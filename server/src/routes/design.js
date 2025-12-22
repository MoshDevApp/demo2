/**
 * Design API Routes
 * AI-powered design assistance using OpenAI DALL-E and GPT-4
 * Video generation using Replicate Stable Video Diffusion
 */

import express from 'express';
import OpenAI from 'openai';
import Replicate from 'replicate';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/ai/generate-image', authenticateToken, async (req, res) => {
  try {
    const { prompt, style, size, n } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        error: 'OpenAI API key not configured',
        message: 'Please add OPENAI_API_KEY to your .env file'
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const enhancedPrompt = style
      ? `${prompt}, style: ${style}, high quality, digital signage optimized`
      : `${prompt}, high quality, digital signage optimized`;

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: enhancedPrompt,
      n: n || 1,
      size: size || '1024x1024',
      quality: 'standard',
      response_format: 'url'
    });

    res.json({
      images: response.data.map(img => ({
        url: img.url,
        revised_prompt: img.revised_prompt
      }))
    });
  } catch (error) {
    console.error('Error generating image:', error);

    if (error.response?.status === 401) {
      return res.status(401).json({
        error: 'Invalid OpenAI API key',
        message: 'Please check your OPENAI_API_KEY in .env file'
      });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests to OpenAI API'
      });
    }

    res.status(500).json({
      error: 'Failed to generate image',
      message: error.message
    });
  }
});

router.post('/ai/suggest-layout', authenticateToken, async (req, res) => {
  try {
    const { description, dimensions, orientation } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        error: 'OpenAI API key not configured',
        message: 'Please add OPENAI_API_KEY to your .env file'
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const prompt = `You are a professional digital signage designer. Generate a detailed layout suggestion for a digital signage design.

Description: ${description}
Dimensions: ${dimensions || '1920x1080'}
Orientation: ${orientation || 'landscape'}

Provide a JSON response with:
1. Recommended layout structure (header, content areas, footer)
2. Element placement suggestions with coordinates (x, y, width, height)
3. Typography recommendations (font families, sizes, colors)
4. Color scheme suggestions (primary, secondary, accent colors with hex codes)
5. Visual hierarchy tips

Response format:
{
  "layout": { "type": "...", "sections": [...] },
  "elements": [{ "type": "...", "x": 0, "y": 0, "width": 0, "height": 0, "style": {...} }],
  "typography": { "heading": {...}, "body": {...} },
  "colors": { "primary": "#...", "secondary": "#...", "accent": "#..." },
  "tips": ["..."]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional digital signage and graphic designer. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const content = response.choices[0].message.content;
    let layoutSuggestion;

    try {
      layoutSuggestion = JSON.parse(content || '{}');
    } catch (parseError) {
      const jsonMatch = content?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        layoutSuggestion = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI response');
      }
    }

    res.json({
      suggestion: layoutSuggestion,
      raw_response: content
    });
  } catch (error) {
    console.error('Error suggesting layout:', error);

    if (error.response?.status === 401) {
      return res.status(401).json({
        error: 'Invalid OpenAI API key',
        message: 'Please check your OPENAI_API_KEY in .env file'
      });
    }

    res.status(500).json({
      error: 'Failed to generate layout suggestion',
      message: error.message
    });
  }
});

router.post('/ai/generate-text', authenticateToken, async (req, res) => {
  try {
    const { prompt, type, maxLength } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        error: 'OpenAI API key not configured',
        message: 'Please add OPENAI_API_KEY to your .env file'
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const systemPrompts = {
      headline: 'Generate short, impactful headlines for digital signage. Keep it under 10 words.',
      description: 'Generate clear, concise descriptions for digital signage. Keep it under 50 words.',
      cta: 'Generate compelling call-to-action text. Keep it under 5 words.'
    };

    const systemContent = systemPrompts[type] || 'Generate professional text for digital signage.';

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: systemContent
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: maxLength || 100
    });

    const generatedText = response.choices[0].message.content?.trim() || '';

    res.json({
      text: generatedText,
      type: type || 'general'
    });
  } catch (error) {
    console.error('Error generating text:', error);

    if (error.response?.status === 401) {
      return res.status(401).json({
        error: 'Invalid OpenAI API key',
        message: 'Please check your OPENAI_API_KEY in .env file'
      });
    }

    res.status(500).json({
      error: 'Failed to generate text',
      message: error.message
    });
  }
});

router.post('/ai/optimize-design', authenticateToken, async (req, res) => {
  try {
    const { design, targetAudience, purpose } = req.body;

    if (!design) {
      return res.status(400).json({ error: 'Design data is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        error: 'OpenAI API key not configured',
        message: 'Please add OPENAI_API_KEY to your .env file'
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const prompt = `Analyze this digital signage design and provide optimization suggestions.

Design elements: ${JSON.stringify(design)}
Target audience: ${targetAudience || 'general public'}
Purpose: ${purpose || 'information display'}

Provide actionable suggestions for:
1. Visual hierarchy improvements
2. Color contrast and accessibility
3. Typography optimization
4. Layout balance
5. Content clarity

Response format: Array of suggestion objects with "category", "issue", "suggestion", and "priority" (high/medium/low)`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in digital signage design, UX, and accessibility. Provide specific, actionable feedback.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 1500
    });

    const suggestions = response.choices[0].message.content;

    res.json({
      suggestions,
      analyzed_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error optimizing design:', error);

    if (error.response?.status === 401) {
      return res.status(401).json({
        error: 'Invalid OpenAI API key',
        message: 'Please check your OPENAI_API_KEY in .env file'
      });
    }

    res.status(500).json({
      error: 'Failed to optimize design',
      message: error.message
    });
  }
});

router.post('/ai/generate-video', authenticateToken, async (req, res) => {
  try {
    const { prompt, duration, width, height } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      return res.status(503).json({
        error: 'Replicate API token not configured',
        message: 'Please add REPLICATE_API_TOKEN to your .env file'
      });
    }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN
    });

    const enhancedPrompt = `${prompt}, high quality, smooth motion, professional digital signage content, cinematic, 4k`;

    const output = await replicate.run(
      "anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351",
      {
        input: {
          prompt: enhancedPrompt,
          num_frames: duration || 24,
          num_inference_steps: 50,
          guidance_scale: 17.5,
          width: width || 1024,
          height: height || 576,
          fps: 8
        }
      }
    );

    if (!output) {
      throw new Error('No video generated');
    }

    res.json({
      video: {
        url: output,
        prompt: prompt,
        revised_prompt: enhancedPrompt,
        frames: duration || 24,
        dimensions: {
          width: width || 1024,
          height: height || 576
        }
      }
    });
  } catch (error) {
    console.error('Error generating video:', error);

    if (error.response?.status === 401) {
      return res.status(401).json({
        error: 'Invalid Replicate API token',
        message: 'Please check your REPLICATE_API_TOKEN in .env file'
      });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests to Replicate API'
      });
    }

    res.status(500).json({
      error: 'Failed to generate video',
      message: error.message
    });
  }
});

export default router;
