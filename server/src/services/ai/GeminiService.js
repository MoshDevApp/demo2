import { GoogleGenerativeAI } from '@google/generative-ai';
import { UsageTracker } from './UsageTracker.js';


class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.usageTracker = new UsageTracker();

    this.models = {
      flash: 'gemini-2.0-flash-exp',
      pro: 'gemini-pro-vision'
    };
  }

  async checkLimits(tenantId) {
    return await this.usageTracker.checkLimits(tenantId);
  }

  async generateText(prompt, options = {}) {
    const {
      tenantId,
      userId,
      featureType = 'design',
      action = 'generate_text',
      model = 'flash',
      systemInstruction = null,
      temperature = 0.7,
      maxTokens = 2048
    } = options;

    const canProceed = await this.checkLimits(tenantId);
    if (!canProceed.allowed) {
      throw new Error(canProceed.reason);
    }

    const usageLogId = await this.usageTracker.logRequest({
      tenantId,
      userId,
      featureType,
      action,
      prompt,
      model: this.models[model]
    });

    try {
      const geminiModel = this.genAI.getGenerativeModel({
        model: this.models[model],
        systemInstruction: systemInstruction || undefined,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens
        }
      });

      const result = await geminiModel.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      const tokensUsed = response.usageMetadata?.totalTokenCount || 0;
      const costUsd = this.calculateCost(tokensUsed, model);

      await this.usageTracker.updateRequest(usageLogId, {
        status: 'completed',
        tokensUsed,
        costUsd,
        responseData: { text }
      });

      return { text, tokensUsed, costUsd };
    } catch (error) {
      await this.usageTracker.updateRequest(usageLogId, {
        status: 'failed',
        responseData: { error: error.message }
      });
      throw error;
    }
  }

  async generateImage(prompt, options = {}) {
    const {
      tenantId,
      userId,
      featureType = 'design',
      action = 'generate_image',
      model = 'flash',
      aspectRatio = '1:1',
      style = 'natural'
    } = options;

    const canProceed = await this.checkLimits(tenantId);
    if (!canProceed.allowed) {
      throw new Error(canProceed.reason);
    }

    const usageLogId = await this.usageTracker.logRequest({
      tenantId,
      userId,
      featureType,
      action,
      prompt,
      model: 'imagen-3.0'
    });

    try {
      const enhancedPrompt = `Generate a professional, high-quality ${style} style image: ${prompt}. Aspect ratio: ${aspectRatio}. Ensure the image is suitable for digital signage displays.`;

      const geminiModel = this.genAI.getGenerativeModel({
        model: this.models[model]
      });

      const result = await geminiModel.generateContent([
        { text: enhancedPrompt },
        { text: 'Please provide a detailed description of an image that matches this request, suitable for a text-to-image model.' }
      ]);

      const imageDescription = result.response.text();

      const tokensUsed = result.response.usageMetadata?.totalTokenCount || 100;
      const costUsd = this.calculateCost(tokensUsed, model);

      await this.usageTracker.updateRequest(usageLogId, {
        status: 'completed',
        tokensUsed,
        costUsd,
        responseData: {
          description: imageDescription,
          prompt: enhancedPrompt,
          note: 'Gemini text model used - integrate with Imagen API for actual image generation'
        }
      });

      return {
        description: imageDescription,
        prompt: enhancedPrompt,
        tokensUsed,
        costUsd,
        note: 'Use Imagen 3 API or similar for actual image generation'
      };
    } catch (error) {
      await this.usageTracker.updateRequest(usageLogId, {
        status: 'failed',
        responseData: { error: error.message }
      });
      throw error;
    }
  }

  async generateStructuredOutput(prompt, schema, options = {}) {
    const {
      tenantId,
      userId,
      featureType,
      action,
      model = 'flash',
      temperature = 0.7
    } = options;

    const canProceed = await this.checkLimits(tenantId);
    if (!canProceed.allowed) {
      throw new Error(canProceed.reason);
    }

    const usageLogId = await this.usageTracker.logRequest({
      tenantId,
      userId,
      featureType,
      action,
      prompt,
      model: this.models[model]
    });

    try {
      const geminiModel = this.genAI.getGenerativeModel({
        model: this.models[model],
        generationConfig: {
          temperature,
          responseMimeType: 'application/json',
          responseSchema: schema
        }
      });

      const result = await geminiModel.generateContent(prompt);
      const response = result.response;
      const jsonText = response.text();
      const data = JSON.parse(jsonText);

      const tokensUsed = response.usageMetadata?.totalTokenCount || 0;
      const costUsd = this.calculateCost(tokensUsed, model);

      await this.usageTracker.updateRequest(usageLogId, {
        status: 'completed',
        tokensUsed,
        costUsd,
        responseData: data
      });

      return { data, tokensUsed, costUsd };
    } catch (error) {
      await this.usageTracker.updateRequest(usageLogId, {
        status: 'failed',
        responseData: { error: error.message }
      });
      throw error;
    }
  }

  calculateCost(tokens, model = 'flash') {
    const pricing = {
      flash: {
        input: 0.00001875,
        output: 0.000075
      },
      pro: {
        input: 0.000125,
        output: 0.000375
      }
    };

    const rate = pricing[model] || pricing.flash;
    return (tokens * rate.output).toFixed(6);
  }
}

export const geminiService = new GeminiService();
export default geminiService;
