import geminiService from './GeminiService.js';


export class CopywritingService {
  async generateHeadline(context, options = {}) {
    const {
      tenantId,
      userId,
      tone = 'professional',
      maxLength = 50,
      language = 'en',
      count = 5
    } = options;

    const systemInstruction = `You are an expert copywriter specializing in digital signage. Create attention-grabbing, concise headlines that work for quick viewing.`;

    const prompt = `Generate ${count} compelling headlines for digital signage:

Context: ${context}
Tone: ${tone}
Max Length: ${maxLength} characters
Language: ${language}
Requirements:
- Attention-grabbing and memorable
- Clear and direct
- Action-oriented when appropriate
- Optimized for quick reading (2-3 seconds)
- Suitable for digital displays

Return an array of headline options.`;

    const schema = {
      type: 'object',
      properties: {
        headlines: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              text: { type: 'string' },
              length: { type: 'number' },
              strength: { type: 'string' },
              reasoning: { type: 'string' }
            }
          }
        }
      }
    };

    return await geminiService.generateStructuredOutput(prompt, schema, {
      tenantId,
      userId,
      featureType: 'copywriting',
      action: 'generate_headline',
      systemInstruction
    });
  }

  async generateCTA(context, options = {}) {
    const {
      tenantId,
      userId,
      actionType = 'visit',
      urgency = 'medium',
      language = 'en',
      count = 5
    } = options;

    const systemInstruction = `You are an expert in creating compelling calls-to-action that drive engagement on digital signage.`;

    const prompt = `Generate ${count} effective call-to-action phrases:

Context: ${context}
Action Type: ${actionType} (e.g., visit, buy, register, learn)
Urgency Level: ${urgency}
Language: ${language}
Requirements:
- Clear action verb
- Creates urgency without being pushy
- 2-6 words
- Works in large, bold text
- Appropriate for public displays

Return an array of CTA options with impact ratings.`;

    const schema = {
      type: 'object',
      properties: {
        ctas: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              text: { type: 'string' },
              impact: { type: 'string' },
              urgencyLevel: { type: 'string' },
              bestFor: { type: 'string' }
            }
          }
        }
      }
    };

    return await geminiService.generateStructuredOutput(prompt, schema, {
      tenantId,
      userId,
      featureType: 'copywriting',
      action: 'generate_cta',
      systemInstruction
    });
  }

  async rewriteForAttention(text, options = {}) {
    const {
      tenantId,
      userId,
      maxDuration = '5 seconds',
      audience = 'general public',
      emphasis = 'clarity'
    } = options;

    const systemInstruction = `You are an expert at adapting copy for short attention spans and quick comprehension, particularly for digital signage environments.`;

    const prompt = `Rewrite this text for maximum impact on digital signage:

Original Text:
"${text}"

Viewing Duration: ${maxDuration}
Audience: ${audience}
Emphasis: ${emphasis}
Requirements:
- Reduce word count by 50% or more
- Maintain core message
- Use powerful, simple words
- Front-load important information
- Optimize for scanning, not reading
- Remove unnecessary details

Provide multiple rewritten versions with different approaches.`;

    const schema = {
      type: 'object',
      properties: {
        original: {
          type: 'object',
          properties: {
            text: { type: 'string' },
            wordCount: { type: 'number' },
            readingTime: { type: 'string' }
          }
        },
        rewrites: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              version: { type: 'string' },
              text: { type: 'string' },
              wordCount: { type: 'number' },
              readingTime: { type: 'string' },
              approach: { type: 'string' },
              strengths: { type: 'array', items: { type: 'string' } }
            }
          }
        }
      }
    };

    return await geminiService.generateStructuredOutput(prompt, schema, {
      tenantId,
      userId,
      featureType: 'copywriting',
      action: 'rewrite_text',
      systemInstruction
    });
  }

  async translateAndAdapt(text, options = {}) {
    const {
      tenantId,
      userId,
      targetLanguage,
      culturalContext,
      preserveTone = true
    } = options;

    const systemInstruction = `You are an expert translator who understands cultural nuances and adapts messaging appropriately for different markets.`;

    const prompt = `Translate and culturally adapt this digital signage text:

Original Text:
"${text}"

Target Language: ${targetLanguage}
Cultural Context: ${culturalContext}
Preserve Tone: ${preserveTone}

Requirements:
- Accurate translation
- Cultural appropriateness
- Maintain marketing impact
- Adapt idioms and expressions
- Consider local customs and sensitivities
- Optimize for local reading patterns
${preserveTone ? '- Maintain original tone and emotion' : '- Adapt tone for cultural fit'}

Provide translation with cultural notes.`;

    const schema = {
      type: 'object',
      properties: {
        translation: {
          type: 'object',
          properties: {
            text: { type: 'string' },
            language: { type: 'string' },
            readingDirection: { type: 'string' }
          }
        },
        adaptations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              original: { type: 'string' },
              adapted: { type: 'string' },
              reason: { type: 'string' }
            }
          }
        },
        culturalNotes: {
          type: 'array',
          items: { type: 'string' }
        },
        confidence: { type: 'string' }
      }
    };

    return await geminiService.generateStructuredOutput(prompt, schema, {
      tenantId,
      userId,
      featureType: 'copywriting',
      action: 'translate_text',
      systemInstruction
    });
  }

  async fitToScreenSize(text, screenDimensions, options = {}) {
    const {
      tenantId,
      userId,
      fontSize = 48,
      maxLines = 3
    } = options;

    const systemInstruction = `You are an expert at adapting copy to fit specific screen constraints while maintaining readability and impact.`;

    const [width, height] = screenDimensions.split('x').map(Number);

    const prompt = `Adapt this text to fit screen constraints:

Original Text:
"${text}"

Screen: ${width}x${height}px
Font Size: ${fontSize}px
Max Lines: ${maxLines}
Requirements:
- Must fit within ${maxLines} lines at ${fontSize}px
- Maintain core message
- Preserve readability
- Optimize word breaks
- Suggest alternative phrasing if needed

Provide optimized versions for this screen size.`;

    const schema = {
      type: 'object',
      properties: {
        fitted: {
          type: 'object',
          properties: {
            text: { type: 'string' },
            lines: { type: 'number' },
            fitsWithinConstraints: { type: 'boolean' }
          }
        },
        alternatives: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              text: { type: 'string' },
              lines: { type: 'number' },
              adjustments: { type: 'string' }
            }
          }
        },
        recommendations: {
          type: 'object',
          properties: {
            fontSize: { type: 'number' },
            maxLines: { type: 'number' },
            layout: { type: 'string' }
          }
        }
      }
    };

    return await geminiService.generateStructuredOutput(prompt, schema, {
      tenantId,
      userId,
      featureType: 'copywriting',
      action: 'fit_text',
      systemInstruction
    });
  }

  async generateBody(topic, options = {}) {
    const {
      tenantId,
      userId,
      length = 'short',
      tone = 'professional',
      keyPoints = [],
      language = 'en'
    } = options;

    const lengthGuide = {
      'short': '30-50 words',
      'medium': '50-100 words',
      'long': '100-150 words'
    };

    const systemInstruction = `You are an expert copywriter for digital signage, skilled at creating engaging, scannable body copy.`;

    const prompt = `Generate body copy for digital signage:

Topic: ${topic}
Length: ${lengthGuide[length]}
Tone: ${tone}
Language: ${language}
${keyPoints.length > 0 ? `Key Points to Include:\n${keyPoints.map(p => `- ${p}`).join('\n')}` : ''}

Requirements:
- Short sentences (max 15 words each)
- Simple, powerful words
- Clear hierarchy of information
- Scannable structure
- Appropriate for ${tone} tone
- Optimized for quick comprehension

Provide multiple versions with different approaches.`;

    const schema = {
      type: 'object',
      properties: {
        versions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              text: { type: 'string' },
              wordCount: { type: 'number' },
              readingTime: { type: 'string' },
              approach: { type: 'string' },
              bestFor: { type: 'string' }
            }
          }
        }
      }
    };

    return await geminiService.generateStructuredOutput(prompt, schema, {
      tenantId,
      userId,
      featureType: 'copywriting',
      action: 'generate_body',
      systemInstruction
    });
  }
}

export const copywritingService = new CopywritingService();
export default copywritingService;
