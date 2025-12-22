import geminiService from './GeminiService.js';


export class PlaylistService {
  async optimizePlaylist(playlist, context, options = {}) {
    const {
      tenantId,
      userId,
      screenLocation,
      timeOfDay,
      audienceType,
      screenType
    } = options;

    const systemInstruction = `You are an expert in optimizing digital signage content scheduling for maximum engagement and effectiveness.`;

    const prompt = `Optimize this playlist for digital signage:

Playlist: ${JSON.stringify(playlist, null, 2)}

Context:
- Location: ${screenLocation}
- Time: ${timeOfDay}
- Audience: ${audienceType}
- Screen Type: ${screenType}
- Goal: ${context}

Analyze and optimize:
1. Content order for maximum impact
2. Duration per item
3. Content mix and variety
4. Pacing and rhythm
5. Attention management
6. Peak viewing times
7. Content fatigue prevention

Provide specific, actionable recommendations.`;

    const schema = {
      type: 'object',
      properties: {
        optimizedOrder: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              itemId: { type: 'string' },
              position: { type: 'number' },
              duration: { type: 'number' },
              reasoning: { type: 'string' }
            }
          }
        },
        recommendations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              category: { type: 'string' },
              suggestion: { type: 'string' },
              impact: { type: 'string' },
              priority: { type: 'string' }
            }
          }
        },
        insights: {
          type: 'object',
          properties: {
            totalDuration: { type: 'string' },
            contentBalance: { type: 'string' },
            engagementScore: { type: 'number' },
            warnings: { type: 'array', items: { type: 'string' } }
          }
        }
      }
    };

    return await geminiService.generateStructuredOutput(prompt, schema, {
      tenantId,
      userId,
      featureType: 'playlist',
      action: 'optimize_playlist',
      systemInstruction
    });
  }

  async recommendSchedule(playlistIds, context, options = {}) {
    const {
      tenantId,
      userId,
      timezone,
      businessHours,
      holidays,
      specialEvents
    } = options;

    const systemInstruction = `You are an expert at scheduling digital signage content for optimal audience reach and engagement across different times and contexts.`;

    const prompt = `Recommend optimal scheduling for these playlists:

Playlists: ${JSON.stringify(playlistIds)}
Context: ${context}

Factors:
- Timezone: ${timezone}
- Business Hours: ${businessHours}
- Holidays: ${JSON.stringify(holidays)}
- Special Events: ${JSON.stringify(specialEvents)}

Consider:
1. Peak audience times
2. Content relevance by time
3. Day of week patterns
4. Local context and culture
5. Seasonal variations
6. Weather impact (if applicable)

Provide detailed scheduling recommendations.`;

    const schema = {
      type: 'object',
      properties: {
        schedule: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              playlistId: { type: 'string' },
              timeSlots: { type: 'array', items: { type: 'string' } },
              daysOfWeek: { type: 'array', items: { type: 'string' } },
              reasoning: { type: 'string' },
              expectedImpact: { type: 'string' }
            }
          }
        },
        warnings: {
          type: 'array',
          items: { type: 'string' }
        },
        opportunities: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    };

    return await geminiService.generateStructuredOutput(prompt, schema, {
      tenantId,
      userId,
      featureType: 'playlist',
      action: 'recommend_schedule',
      systemInstruction
    });
  }

  async detectContentFatigue(playbackLogs, options = {}) {
    const {
      tenantId,
      userId
    } = options;

    const systemInstruction = `You are an expert at analyzing content performance patterns and detecting when content becomes stale or overexposed.`;

    const prompt = `Analyze these playback logs for content fatigue:

Logs: ${JSON.stringify(playbackLogs, null, 2)}

Detect:
1. Overplayed content
2. Performance degradation over time
3. Optimal refresh intervals
4. Content that needs updating
5. Variety gaps

Provide actionable insights for content rotation.`;

    const schema = {
      type: 'object',
      properties: {
        fatigueDetected: { type: 'boolean' },
        overplayedItems: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              itemId: { type: 'string' },
              playCount: { type: 'number' },
              recommendation: { type: 'string' },
              severity: { type: 'string' }
            }
          }
        },
        refreshRecommendations: {
          type: 'array',
          items: { type: 'string' }
        },
        healthScore: { type: 'number' }
      }
    };

    return await geminiService.generateStructuredOutput(prompt, schema, {
      tenantId,
      userId,
      featureType: 'playlist',
      action: 'detect_fatigue',
      systemInstruction
    });
  }
}

export const playlistService = new PlaylistService();
export default playlistService;
