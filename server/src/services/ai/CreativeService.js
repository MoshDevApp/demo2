import geminiService from './GeminiService.js';


export class CreativeService {
  async generateDesign(prompt, options = {}) {
    const {
      tenantId,
      userId,
      dimensions = '1920x1080',
      orientation = 'landscape',
      style = 'modern',
      brandColors = null,
      purpose = 'general'
    } = options;

    const [width, height] = dimensions.split('x').map(Number);

    const systemInstruction = `You are an expert digital signage designer. Generate detailed design specifications in JSON format for professional digital displays. Consider readability from distance, visual hierarchy, and modern design principles.`;

    const designPrompt = `Create a ${style} design for digital signage with these requirements:

Prompt: ${prompt}
Dimensions: ${width}x${height}px (${orientation})
Purpose: ${purpose}
${brandColors ? `Brand Colors: ${brandColors.join(', ')}` : ''}

Generate a complete design specification including:
1. Layout structure (header, content areas, footer)
2. Typography (fonts, sizes, weights)
3. Color scheme${brandColors ? ' (incorporating brand colors)' : ''}
4. Element positioning and sizes
5. Visual hierarchy
6. Recommended imagery or icons
7. Animation suggestions for attention

Ensure the design is readable from 10+ feet away and optimized for ${purpose}.`;

    const schema = {
      type: 'object',
      properties: {
        layout: {
          type: 'object',
          properties: {
            structure: { type: 'string' },
            grid: { type: 'string' },
            areas: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  x: { type: 'number' },
                  y: { type: 'number' },
                  width: { type: 'number' },
                  height: { type: 'number' }
                }
              }
            }
          }
        },
        typography: {
          type: 'object',
          properties: {
            headingFont: { type: 'string' },
            bodyFont: { type: 'string' },
            sizes: {
              type: 'object',
              properties: {
                h1: { type: 'number' },
                h2: { type: 'number' },
                body: { type: 'number' }
              }
            }
          }
        },
        colors: {
          type: 'object',
          properties: {
            primary: { type: 'string' },
            secondary: { type: 'string' },
            accent: { type: 'string' },
            background: { type: 'string' },
            text: { type: 'string' }
          }
        },
        elements: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              content: { type: 'string' },
              position: {
                type: 'object',
                properties: {
                  x: { type: 'number' },
                  y: { type: 'number' },
                  width: { type: 'number' },
                  height: { type: 'number' }
                }
              },
              style: { type: 'object' }
            }
          }
        },
        recommendations: {
          type: 'object',
          properties: {
            imagery: { type: 'string' },
            animations: { type: 'string' },
            duration: { type: 'string' }
          }
        }
      }
    };

    return await geminiService.generateStructuredOutput(designPrompt, schema, {
      tenantId,
      userId,
      featureType: 'design',
      action: 'generate_design',
      model: 'flash'
    });
  }

  async generateImage(prompt, options = {}) {
    const {
      tenantId,
      userId,
      style = 'professional',
      aspectRatio = '16:9'
    } = options;

    return await geminiService.generateImage(prompt, {
      tenantId,
      userId,
      featureType: 'design',
      action: 'generate_image',
      aspectRatio,
      style
    });
  }

  async generateSVGIcon(description, options = {}) {
    const {
      tenantId,
      userId,
      size = '24',
      style = 'outline'
    } = options;

    const systemInstruction = `You are an expert SVG designer. Generate clean, scalable SVG code for icons that are visually clear and work well at any size.`;

    const prompt = `Generate SVG code for an icon with these specifications:

Description: ${description}
Size: ${size}x${size}
Style: ${style}
Requirements:
- Clean, minimal design
- Single color (currentColor)
- Centered within viewBox
- Optimized paths
- No external dependencies

Return only the complete SVG code, properly formatted.`;

    return await geminiService.generateText(prompt, {
      tenantId,
      userId,
      featureType: 'design',
      action: 'generate_svg',
      systemInstruction
    });
  }

  async generateBackground(theme, options = {}) {
    const {
      tenantId,
      userId,
      dimensions = '1920x1080',
      style = 'gradient'
    } = options;

    const systemInstruction = `You are an expert in creating CSS backgrounds and gradients for digital signage. Generate visually appealing backgrounds that don't distract from content.`;

    const prompt = `Generate CSS background code for:

Theme: ${theme}
Style: ${style}
Dimensions: ${dimensions}
Requirements:
- Professional and modern
- Subtle, not distracting
- Works well with text overlay
- Optimized for digital displays

Provide complete CSS code including gradients, patterns, or solid colors as appropriate.`;

    return await geminiService.generateText(prompt, {
      tenantId,
      userId,
      featureType: 'design',
      action: 'generate_background',
      systemInstruction
    });
  }

  async optimizeDesign(design, criteria, options = {}) {
    const {
      tenantId,
      userId
    } = options;

    const systemInstruction = `You are a digital signage design expert specializing in readability, accessibility, and visual impact optimization.`;

    const prompt = `Analyze and optimize this digital signage design:

Current Design:
${JSON.stringify(design, null, 2)}

Optimization Criteria:
${criteria}

Provide detailed optimization suggestions for:
1. Readability (from 10+ feet)
2. Color contrast and accessibility
3. Visual hierarchy
4. Content placement
5. Typography
6. Animation and motion
7. File size optimization

Return structured feedback with specific, actionable recommendations.`;

    const schema = {
      type: 'object',
      properties: {
        overallScore: { type: 'number' },
        suggestions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              category: { type: 'string' },
              issue: { type: 'string' },
              recommendation: { type: 'string' },
              priority: { type: 'string' },
              impact: { type: 'string' }
            }
          }
        },
        optimizedElements: { type: 'object' }
      }
    };

    return await geminiService.generateStructuredOutput(prompt, schema, {
      tenantId,
      userId,
      featureType: 'design',
      action: 'optimize_design',
      systemInstruction
    });
  }

  async resizeDesign(design, newDimensions, options = {}) {
    const {
      tenantId,
      userId
    } = options;

    const [width, height] = newDimensions.split('x').map(Number);
    const orientation = width > height ? 'landscape' : 'portrait';

    const systemInstruction = `You are an expert at adapting designs for different screen sizes while maintaining visual hierarchy and readability.`;

    const prompt = `Resize and adapt this design for new dimensions:

Original Design:
${JSON.stringify(design, null, 2)}

New Dimensions: ${width}x${height}px (${orientation})

Intelligently resize all elements:
- Scale fonts appropriately
- Adjust spacing and padding
- Maintain aspect ratios
- Ensure readability
- Preserve visual hierarchy
- Reflow content if needed for portrait/landscape change

Return the complete adapted design specification.`;

    const schema = {
      type: 'object',
      properties: {
        dimensions: {
          type: 'object',
          properties: {
            width: { type: 'number' },
            height: { type: 'number' },
            orientation: { type: 'string' }
          }
        },
        layout: { type: 'object' },
        elements: { type: 'array' },
        typography: { type: 'object' },
        adaptations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              element: { type: 'string' },
              change: { type: 'string' },
              reason: { type: 'string' }
            }
          }
        }
      }
    };

    return await geminiService.generateStructuredOutput(prompt, schema, {
      tenantId,
      userId,
      featureType: 'design',
      action: 'resize_design',
      systemInstruction
    });
  }
}

export const creativeService = new CreativeService();
export default creativeService;
