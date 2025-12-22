import geminiService from './GeminiService.js';


export class DiagnosticsService {
  async analyzeScreenHealth(screenData, logs, options = {}) {
    const { tenantId, userId } = options;

    const systemInstruction = `You are an expert system diagnostician for digital signage networks. Analyze patterns, predict issues, and provide actionable solutions.`;

    const prompt = `Analyze screen health and diagnostics:

Screen Data: ${JSON.stringify(screenData)}
Recent Logs: ${JSON.stringify(logs)}

Analyze:
1. Heartbeat patterns and connectivity
2. Error frequency and types
3. Performance trends
4. Network stability
5. Hardware indicators
6. Unusual behavior patterns

Predict potential issues and suggest fixes.`;

    const schema = {
      type: 'object',
      properties: {
        healthScore: { type: 'number' },
        status: { type: 'string' },
        issues: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              severity: { type: 'string' },
              issue: { type: 'string' },
              suggestedFix: { type: 'string' },
              preventative: { type: 'string' }
            }
          }
        },
        predictions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              risk: { type: 'string' },
              probability: { type: 'string' },
              timeframe: { type: 'string' },
              mitigation: { type: 'string' }
            }
          }
        },
        recommendations: { type: 'array', items: { type: 'string' } }
      }
    };

    return await geminiService.generateStructuredOutput(prompt, schema, {
      tenantId,
      userId,
      featureType: 'diagnostics',
      action: 'analyze_screen_health',
      systemInstruction
    });
  }

  async suggestRemoteAction(screenId, issue, options = {}) {
    const { tenantId, userId } = options;

    const systemInstruction = `You are an expert at troubleshooting digital signage remotely. Provide safe, effective remediation steps.`;

    const prompt = `Suggest remote actions to fix this issue:

Screen ID: ${screenId}
Issue: ${issue}

Provide step-by-step actions:
1. Safe diagnostic checks
2. Remediation steps
3. Risks and precautions
4. Success indicators
5. Fallback options`;

    const schema = {
      type: 'object',
      properties: {
        recommendedActions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              action: { type: 'string' },
              description: { type: 'string' },
              risk: { type: 'string' },
              expectedOutcome: { type: 'string' }
            }
          }
        },
        requiresConfirmation: { type: 'boolean' },
        warnings: { type: 'array', items: { type: 'string' } }
      }
    };

    return await geminiService.generateStructuredOutput(prompt, schema, {
      tenantId,
      userId,
      featureType: 'diagnostics',
      action: 'suggest_remote_action',
      systemInstruction
    });
  }
}

export const diagnosticsService = new DiagnosticsService();
export default diagnosticsService;
