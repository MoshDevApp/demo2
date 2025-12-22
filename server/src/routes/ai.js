/**
 * AI Routes - Gemini-Powered Intelligence
 * Comprehensive AI features for SignCraft digital signage
 */


import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { creativeService } from '../services/ai/CreativeService.js';
import { copywritingService } from '../services/ai/CopywritingService.js';
import { playlistService } from '../services/ai/PlaylistService.js';
import { diagnosticsService } from '../services/ai/DiagnosticsService.js';
import { analyticsService } from '../services/ai/AnalyticsService.js';
import { UsageTracker } from '../services/ai/UsageTracker.js';

const router = express.Router();
const usageTracker = new UsageTracker();

router.post('/creative/generate-design', authenticateToken, async (req, res) => {
  try {
    const { prompt, dimensions, orientation, style, brandColors, purpose } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'Gemini API not configured',
        message: 'Please add GEMINI_API_KEY to your .env file'
      });
    }

    const result = await creativeService.generateDesign(prompt, {
      tenantId: req.user.tenantId,
      userId: req.user.id,
      dimensions: dimensions || '1920x1080',
      orientation: orientation || 'landscape',
      style: style || 'modern',
      brandColors,
      purpose: purpose || 'general'
    });

    res.json({
      design: result.data,
      tokensUsed: result.tokensUsed,
      cost: result.costUsd
    });
  } catch (error) {
    console.error('Error generating design:', error);
    res.status(500).json({
      error: 'Failed to generate design',
      message: error.message
    });
  }
});

router.post('/creative/generate-image', authenticateToken, async (req, res) => {
  try {
    const { prompt, style, aspectRatio } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const result = await creativeService.generateImage(prompt, {
      tenantId: req.user.tenantId,
      userId: req.user.id,
      style: style || 'professional',
      aspectRatio: aspectRatio || '16:9'
    });

    res.json({
      image: result,
      note: 'Gemini provides image descriptions. Integrate with Imagen 3 API for actual image generation.'
    });
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({
      error: 'Failed to generate image',
      message: error.message
    });
  }
});

router.post('/creative/generate-svg', authenticateToken, async (req, res) => {
  try {
    const { description, size, style } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const result = await creativeService.generateSVGIcon(description, {
      tenantId: req.user.tenantId,
      userId: req.user.id,
      size: size || '24',
      style: style || 'outline'
    });

    res.json({
      svg: result.text,
      tokensUsed: result.tokensUsed
    });
  } catch (error) {
    console.error('Error generating SVG:', error);
    res.status(500).json({
      error: 'Failed to generate SVG',
      message: error.message
    });
  }
});

router.post('/creative/generate-background', authenticateToken, async (req, res) => {
  try {
    const { theme, dimensions, style } = req.body;

    if (!theme) {
      return res.status(400).json({ error: 'Theme is required' });
    }

    const result = await creativeService.generateBackground(theme, {
      tenantId: req.user.tenantId,
      userId: req.user.id,
      dimensions: dimensions || '1920x1080',
      style: style || 'gradient'
    });

    res.json({
      css: result.text,
      tokensUsed: result.tokensUsed
    });
  } catch (error) {
    console.error('Error generating background:', error);
    res.status(500).json({
      error: 'Failed to generate background',
      message: error.message
    });
  }
});

router.post('/creative/optimize-design', authenticateToken, async (req, res) => {
  try {
    const { design, criteria } = req.body;

    if (!design) {
      return res.status(400).json({ error: 'Design is required' });
    }

    const result = await creativeService.optimizeDesign(design, criteria || 'readability, contrast, hierarchy', {
      tenantId: req.user.tenantId,
      userId: req.user.id
    });

    res.json({
      optimization: result.data,
      tokensUsed: result.tokensUsed
    });
  } catch (error) {
    console.error('Error optimizing design:', error);
    res.status(500).json({
      error: 'Failed to optimize design',
      message: error.message
    });
  }
});

router.post('/creative/resize-design', authenticateToken, async (req, res) => {
  try {
    const { design, newDimensions } = req.body;

    if (!design || !newDimensions) {
      return res.status(400).json({ error: 'Design and newDimensions are required' });
    }

    const result = await creativeService.resizeDesign(design, newDimensions, {
      tenantId: req.user.tenantId,
      userId: req.user.id
    });

    res.json({
      resizedDesign: result.data,
      tokensUsed: result.tokensUsed
    });
  } catch (error) {
    console.error('Error resizing design:', error);
    res.status(500).json({
      error: 'Failed to resize design',
      message: error.message
    });
  }
});

router.post('/copy/generate-headline', authenticateToken, async (req, res) => {
  try {
    const { context, tone, maxLength, language, count } = req.body;

    if (!context) {
      return res.status(400).json({ error: 'Context is required' });
    }

    const result = await copywritingService.generateHeadline(context, {
      tenantId: req.user.tenantId,
      userId: req.user.id,
      tone,
      maxLength,
      language,
      count
    });

    res.json({
      headlines: result.data.headlines,
      tokensUsed: result.tokensUsed
    });
  } catch (error) {
    console.error('Error generating headline:', error);
    res.status(500).json({
      error: 'Failed to generate headline',
      message: error.message
    });
  }
});

router.post('/copy/generate-cta', authenticateToken, async (req, res) => {
  try {
    const { context, actionType, urgency, language, count } = req.body;

    if (!context) {
      return res.status(400).json({ error: 'Context is required' });
    }

    const result = await copywritingService.generateCTA(context, {
      tenantId: req.user.tenantId,
      userId: req.user.id,
      actionType,
      urgency,
      language,
      count
    });

    res.json({
      ctas: result.data.ctas,
      tokensUsed: result.tokensUsed
    });
  } catch (error) {
    console.error('Error generating CTA:', error);
    res.status(500).json({
      error: 'Failed to generate CTA',
      message: error.message
    });
  }
});

router.post('/copy/rewrite', authenticateToken, async (req, res) => {
  try {
    const { text, maxDuration, audience, emphasis } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const result = await copywritingService.rewriteForAttention(text, {
      tenantId: req.user.tenantId,
      userId: req.user.id,
      maxDuration,
      audience,
      emphasis
    });

    res.json({
      rewrites: result.data.rewrites,
      original: result.data.original,
      tokensUsed: result.tokensUsed
    });
  } catch (error) {
    console.error('Error rewriting text:', error);
    res.status(500).json({
      error: 'Failed to rewrite text',
      message: error.message
    });
  }
});

router.post('/copy/translate', authenticateToken, async (req, res) => {
  try {
    const { text, targetLanguage, culturalContext, preserveTone } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({ error: 'Text and targetLanguage are required' });
    }

    const result = await copywritingService.translateAndAdapt(text, {
      tenantId: req.user.tenantId,
      userId: req.user.id,
      targetLanguage,
      culturalContext,
      preserveTone
    });

    res.json({
      translation: result.data.translation,
      adaptations: result.data.adaptations,
      culturalNotes: result.data.culturalNotes,
      tokensUsed: result.tokensUsed
    });
  } catch (error) {
    console.error('Error translating text:', error);
    res.status(500).json({
      error: 'Failed to translate text',
      message: error.message
    });
  }
});

router.post('/copy/fit-to-screen', authenticateToken, async (req, res) => {
  try {
    const { text, screenDimensions, fontSize, maxLines } = req.body;

    if (!text || !screenDimensions) {
      return res.status(400).json({ error: 'Text and screenDimensions are required' });
    }

    const result = await copywritingService.fitToScreenSize(text, screenDimensions, {
      tenantId: req.user.tenantId,
      userId: req.user.id,
      fontSize,
      maxLines
    });

    res.json({
      fitted: result.data.fitted,
      alternatives: result.data.alternatives,
      recommendations: result.data.recommendations,
      tokensUsed: result.tokensUsed
    });
  } catch (error) {
    console.error('Error fitting text:', error);
    res.status(500).json({
      error: 'Failed to fit text',
      message: error.message
    });
  }
});

router.post('/copy/generate-body', authenticateToken, async (req, res) => {
  try {
    const { topic, length, tone, keyPoints, language } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const result = await copywritingService.generateBody(topic, {
      tenantId: req.user.tenantId,
      userId: req.user.id,
      length,
      tone,
      keyPoints,
      language
    });

    res.json({
      versions: result.data.versions,
      tokensUsed: result.tokensUsed
    });
  } catch (error) {
    console.error('Error generating body:', error);
    res.status(500).json({
      error: 'Failed to generate body text',
      message: error.message
    });
  }
});

router.post('/playlist/optimize', authenticateToken, async (req, res) => {
  try {
    const { playlist, context, screenLocation, timeOfDay, audienceType, screenType } = req.body;

    if (!playlist) {
      return res.status(400).json({ error: 'Playlist is required' });
    }

    const result = await playlistService.optimizePlaylist(playlist, context || 'general engagement', {
      tenantId: req.user.tenantId,
      userId: req.user.id,
      screenLocation,
      timeOfDay,
      audienceType,
      screenType
    });

    res.json({
      optimizedPlaylist: result.data,
      tokensUsed: result.tokensUsed
    });
  } catch (error) {
    console.error('Error optimizing playlist:', error);
    res.status(500).json({
      error: 'Failed to optimize playlist',
      message: error.message
    });
  }
});

router.post('/playlist/recommend-schedule', authenticateToken, async (req, res) => {
  try {
    const { playlistIds, context, timezone, businessHours, holidays, specialEvents } = req.body;

    if (!playlistIds || !Array.isArray(playlistIds)) {
      return res.status(400).json({ error: 'playlistIds array is required' });
    }

    const result = await playlistService.recommendSchedule(playlistIds, context || 'optimal reach', {
      tenantId: req.user.tenantId,
      userId: req.user.id,
      timezone,
      businessHours,
      holidays,
      specialEvents
    });

    res.json({
      schedule: result.data,
      tokensUsed: result.tokensUsed
    });
  } catch (error) {
    console.error('Error recommending schedule:', error);
    res.status(500).json({
      error: 'Failed to recommend schedule',
      message: error.message
    });
  }
});

router.post('/playlist/detect-fatigue', authenticateToken, async (req, res) => {
  try {
    const { playbackLogs } = req.body;

    if (!playbackLogs) {
      return res.status(400).json({ error: 'playbackLogs are required' });
    }

    const result = await playlistService.detectContentFatigue(playbackLogs, {
      tenantId: req.user.tenantId,
      userId: req.user.id
    });

    res.json({
      fatigue: result.data,
      tokensUsed: result.tokensUsed
    });
  } catch (error) {
    console.error('Error detecting content fatigue:', error);
    res.status(500).json({
      error: 'Failed to detect content fatigue',
      message: error.message
    });
  }
});

router.post('/diagnostics/analyze-screen', authenticateToken, async (req, res) => {
  try {
    const { screenData, logs } = req.body;

    if (!screenData) {
      return res.status(400).json({ error: 'screenData is required' });
    }

    const result = await diagnosticsService.analyzeScreenHealth(screenData, logs || [], {
      tenantId: req.user.tenantId,
      userId: req.user.id
    });

    res.json({
      analysis: result.data,
      tokensUsed: result.tokensUsed
    });
  } catch (error) {
    console.error('Error analyzing screen:', error);
    res.status(500).json({
      error: 'Failed to analyze screen health',
      message: error.message
    });
  }
});

router.post('/diagnostics/suggest-action', authenticateToken, async (req, res) => {
  try {
    const { screenId, issue } = req.body;

    if (!screenId || !issue) {
      return res.status(400).json({ error: 'screenId and issue are required' });
    }

    const result = await diagnosticsService.suggestRemoteAction(screenId, issue, {
      tenantId: req.user.tenantId,
      userId: req.user.id
    });

    res.json({
      actions: result.data,
      tokensUsed: result.tokensUsed
    });
  } catch (error) {
    console.error('Error suggesting action:', error);
    res.status(500).json({
      error: 'Failed to suggest action',
      message: error.message
    });
  }
});

router.post('/analytics/query', authenticateToken, async (req, res) => {
  try {
    const { question, databaseSchema } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'question is required' });
    }

    const result = await analyticsService.naturalLanguageQuery(question, databaseSchema || {}, {
      tenantId: req.user.tenantId,
      userId: req.user.id
    });

    res.json({
      query: result.data,
      tokensUsed: result.tokensUsed,
      warning: 'Execute SQL with caution. Validate before running.'
    });
  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({
      error: 'Failed to process natural language query',
      message: error.message
    });
  }
});

router.post('/analytics/interpret', authenticateToken, async (req, res) => {
  try {
    const { queryResults, context } = req.body;

    if (!queryResults) {
      return res.status(400).json({ error: 'queryResults are required' });
    }

    const result = await analyticsService.interpretResults(queryResults, context || 'general analysis', {
      tenantId: req.user.tenantId,
      userId: req.user.id
    });

    res.json({
      interpretation: result.data,
      tokensUsed: result.tokensUsed
    });
  } catch (error) {
    console.error('Error interpreting results:', error);
    res.status(500).json({
      error: 'Failed to interpret results',
      message: error.message
    });
  }
});

router.post('/analytics/compare', authenticateToken, async (req, res) => {
  try {
    const { dataA, dataB, comparisonContext } = req.body;

    if (!dataA || !dataB) {
      return res.status(400).json({ error: 'dataA and dataB are required' });
    }

    const result = await analyticsService.comparePerformance(dataA, dataB, {
      tenantId: req.user.tenantId,
      userId: req.user.id,
      comparisonContext: comparisonContext || 'performance comparison'
    });

    res.json({
      comparison: result.data,
      tokensUsed: result.tokensUsed
    });
  } catch (error) {
    console.error('Error comparing performance:', error);
    res.status(500).json({
      error: 'Failed to compare performance',
      message: error.message
    });
  }
});

router.get('/usage/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await usageTracker.getUsageStats(req.user.tenantId);

    res.json({
      usage: stats
    });
  } catch (error) {
    console.error('Error getting usage stats:', error);
    res.status(500).json({
      error: 'Failed to get usage statistics',
      message: error.message
    });
  }
});

export default router;
