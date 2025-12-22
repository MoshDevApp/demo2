import geminiService from './GeminiService.js';


export class AnalyticsService {
  async naturalLanguageQuery(question, databaseSchema, options = {}) {
    const { tenantId, userId } = options;

    const systemInstruction = `You are an expert at converting natural language questions into SQL queries. Generate safe, read-only queries with proper filtering for multi-tenant systems.`;

    const prompt = `Convert this question to SQL:

Question: "${question}"
Schema: ${JSON.stringify(databaseSchema)}
Tenant ID: ${tenantId}

Requirements:
1. Read-only (SELECT only)
2. MUST include tenant_id filter
3. Optimized and safe
4. Include appropriate JOINs
5. Limit results to 100

Return SQL query and explanation.`;

    const schema = {
      type: 'object',
      properties: {
        sql: { type: 'string' },
        explanation: { type: 'string' },
        parameters: { type: 'array', items: { type: 'string' } },
        estimatedRows: { type: 'string' }
      }
    };

    return await geminiService.generateStructuredOutput(prompt, schema, {
      tenantId,
      userId,
      featureType: 'analytics',
      action: 'natural_language_query',
      systemInstruction
    });
  }

  async interpretResults(queryResults, context, options = {}) {
    const { tenantId, userId } = options;

    const systemInstruction = `You are an expert data analyst who explains insights in clear, actionable language.`;

    const prompt = `Interpret these query results:

Context: ${context}
Results: ${JSON.stringify(queryResults)}

Provide:
1. Key insights
2. Trends and patterns
3. Anomalies
4. Actionable recommendations
5. Plain English summary`;

    const schema = {
      type: 'object',
      properties: {
        summary: { type: 'string' },
        insights: { type: 'array', items: { type: 'string' } },
        trends: { type: 'array', items: { type: 'string' } },
        recommendations: { type: 'array', items: { type: 'string' } },
        anomalies: { type: 'array', items: { type: 'string' } }
      }
    };

    return await geminiService.generateStructuredOutput(prompt, schema, {
      tenantId,
      userId,
      featureType: 'analytics',
      action: 'interpret_results',
      systemInstruction
    });
  }

  async comparePerformance(dataA, dataB, options = {}) {
    const { tenantId, userId, comparisonContext } = options;

    const systemInstruction = `You are an expert at comparative analysis for digital signage performance metrics.`;

    const prompt = `Compare these datasets:

Context: ${comparisonContext}
Dataset A: ${JSON.stringify(dataA)}
Dataset B: ${JSON.stringify(dataB)}

Analyze:
1. Key differences
2. Performance winners
3. Statistical significance
4. Insights and learnings
5. Recommendations`;

    const schema = {
      type: 'object',
      properties: {
        winner: { type: 'string' },
        differences: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              metric: { type: 'string' },
              valueA: { type: 'string' },
              valueB: { type: 'string' },
              difference: { type: 'string' },
              significance: { type: 'string' }
            }
          }
        },
        insights: { type: 'array', items: { type: 'string' } },
        recommendations: { type: 'array', items: { type: 'string' } }
      }
    };

    return await geminiService.generateStructuredOutput(prompt, schema, {
      tenantId,
      userId,
      featureType: 'analytics',
      action: 'compare_performance',
      systemInstruction
    });
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
