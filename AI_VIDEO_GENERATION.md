# AI Video Generation Feature

## Overview

SignCraft now includes AI-powered video generation using **Replicate's Zeroscope V2 XL** model. This feature allows users to generate short, high-quality video clips from text prompts directly in the Design Studio.

---

## Model Choice: Zeroscope V2 XL

### Why Zeroscope V2 XL?

**Zeroscope V2 XL** is a text-to-video generation model specifically designed for creating high-quality video clips from text descriptions.

**Key Benefits:**
- **Text-to-Video**: Direct text prompt to video (unlike Stable Video Diffusion which requires an input image)
- **High Quality**: Produces 1024x576 resolution videos optimized for digital signage
- **Fast Generation**: 60-90 seconds per video (2-3 seconds)
- **Smooth Motion**: Excellent for creating looping content for digital displays
- **Cost Effective**: ~$0.05-0.10 per video generation

**Perfect for Digital Signage:**
- Create animated backgrounds
- Generate product showcase videos
- Produce attention-grabbing motion content
- Make promotional video loops

---

## Setup Instructions

### 1. Get Replicate API Token

**Steps:**
1. Go to [replicate.com](https://replicate.com)
2. Sign up or log in to your account
3. Navigate to your [Account Settings](https://replicate.com/account/api-tokens)
4. Copy your API token (starts with `r8_...`)

### 2. Configure Backend

Add the Replicate API token to your backend `.env` file:

```env
# Replicate API Configuration (for AI Video Generation)
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Install Dependencies

Install the Replicate SDK in the server:

```bash
cd server
npm install replicate
```

---

## How It Works

### Architecture

```
User enters prompt in Design Studio
          ↓
Frontend sends request to backend API
          ↓
Backend calls Replicate API
          ↓
Replicate runs Zeroscope V2 XL model (60-90s)
          ↓
Returns video URL
          ↓
Frontend downloads and adds to canvas
          ↓
Video plays on loop in design
```

### API Endpoint

**Route:** `POST /api/design/ai/generate-video`

**Request Body:**
```json
{
  "prompt": "A calm ocean with gentle waves at sunset",
  "duration": 24,
  "width": 1024,
  "height": 576
}
```

**Parameters:**
- `prompt` (required): Text description of desired video
- `duration` (optional): Number of frames (default: 24 = ~3 seconds at 8fps)
- `width` (optional): Video width in pixels (default: 1024)
- `height` (optional): Video height in pixels (default: 576)

**Response:**
```json
{
  "video": {
    "url": "https://replicate.delivery/pbxt/xxx.mp4",
    "prompt": "A calm ocean with gentle waves at sunset",
    "revised_prompt": "A calm ocean with gentle waves at sunset, high quality, smooth motion, professional digital signage content, cinematic, 4k",
    "frames": 24,
    "dimensions": {
      "width": 1024,
      "height": 576
    }
  }
}
```

### Model Configuration

**Model:** `anotherjesse/zeroscope-v2-xl`

**Input Parameters:**
- `prompt`: Enhanced with quality hints
- `num_frames`: 24 frames (adjustable)
- `num_inference_steps`: 50 (quality vs speed tradeoff)
- `guidance_scale`: 17.5 (how closely to follow prompt)
- `width`: 1024px
- `height`: 576px
- `fps`: 8 frames per second

**Prompt Enhancement:**
The system automatically enhances user prompts with quality keywords:
```javascript
const enhancedPrompt = `${prompt}, high quality, smooth motion, professional digital signage content, cinematic, 4k`;
```

Example:
- User input: `"A busy city street at night"`
- Enhanced: `"A busy city street at night, high quality, smooth motion, professional digital signage content, cinematic, 4k"`

---

## Using the Feature

### In the Design Studio

1. **Open AI Assistant Panel**
   - Click the "AI Assistant" button in the left sidebar

2. **Enter Video Description**
   - Type what you want in the video (e.g., "Floating geometric shapes with neon colors")

3. **Generate Video**
   - Click "Generate Video" button (blue/cyan gradient)
   - Wait 60-90 seconds for generation
   - Video will automatically load and play on canvas

4. **Customize Video**
   - Move, resize, and position the video like any other element
   - Video plays on loop automatically
   - Muted by default (perfect for signage)

### Example Prompts

**Good Prompts for Digital Signage:**
- "Slowly rotating 3D product showcase on white background"
- "Abstract colorful particles flowing smoothly"
- "Time-lapse of city traffic at night with light trails"
- "Gentle camera pan across modern office interior"
- "Smooth zoom into coffee cup with steam rising"

**Tips for Best Results:**
- Be specific about motion (slow, smooth, gentle, dynamic)
- Mention camera movements (pan, zoom, rotate)
- Describe the scene in detail
- Keep it simple - complex scenes may not work well
- Avoid fast motion or quick cuts

---

## Technical Implementation

### Backend Code (`server/src/routes/design.js:307-381`)

```javascript
router.post('/ai/generate-video', authenticateToken, async (req, res) => {
  try {
    const { prompt, duration, width, height } = req.body;

    // Initialize Replicate client
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN
    });

    // Enhance prompt for quality
    const enhancedPrompt = `${prompt}, high quality, smooth motion, professional digital signage content, cinematic, 4k`;

    // Run Zeroscope V2 XL model
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

    // Return video URL
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
    // Error handling...
  }
});
```

### Frontend Code (`src/components/DesignEditor.jsx:219-287`)

```javascript
const generateAIVideo = async () => {
  setIsGenerating(true);

  try {
    // Call backend API
    const response = await fetch('http://localhost:3001/api/design/ai/generate-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        prompt: aiPrompt,
        duration: 24,
        width: 1024,
        height: 576
      })
    });

    const data = await response.json();
    const videoUrl = data.video.url;

    // Create HTML5 video element
    const videoElement = document.createElement('video');
    videoElement.src = videoUrl;
    videoElement.crossOrigin = 'anonymous';
    videoElement.loop = true;
    videoElement.muted = true;

    // Load video into Fabric.js canvas
    videoElement.addEventListener('loadeddata', () => {
      const video = new fabric.Image(videoElement, {
        left: 100,
        top: 100,
        scaleX: 0.5,
        scaleY: 0.5,
        objectCaching: false  // Required for video
      });

      canvas.add(video);
      canvas.setActiveObject(video);

      // Start video playback
      videoElement.play();

      // Render loop for video animation
      fabric.util.requestAnimFrame(function render() {
        canvas.renderAll();
        fabric.util.requestAnimFrame(render);
      });
    });
  } catch (error) {
    console.error('Error generating video:', error);
    alert(error.message || 'Failed to generate video');
  } finally {
    setIsGenerating(false);
  }
};
```

---

## Cost & Performance

### Pricing
- **Per Video Generation**: ~$0.05-0.10
- **Based on**: Number of frames and resolution
- **Billing**: Pay-as-you-go through Replicate

### Performance
- **Generation Time**: 60-90 seconds per video
- **Video Length**: 2-3 seconds (24 frames at 8fps)
- **Resolution**: 1024x576 (optimal for most displays)
- **File Size**: ~1-5 MB per video

### Optimization Tips
- Cache generated videos in your database
- Reuse videos across multiple designs
- Generate shorter videos (fewer frames) for faster results
- Consider pre-generating common video types

---

## Comparison: Video vs Image Generation

| Feature | Image (DALL-E 3) | Video (Zeroscope V2 XL) |
|---------|------------------|-------------------------|
| **Generation Time** | 5-10 seconds | 60-90 seconds |
| **Cost** | ~$0.04 per image | ~$0.05-0.10 per video |
| **Use Case** | Static graphics, posters | Motion content, backgrounds |
| **Quality** | 1024x1024, photorealistic | 1024x576, cinematic |
| **Best For** | Product images, artwork | Ambient loops, animations |
| **Provider** | OpenAI | Replicate |

---

## Limitations & Considerations

### Current Limitations
1. **Generation Time**: 60-90 seconds is long for real-time editing
2. **Video Length**: Limited to 2-3 seconds (can be extended with more frames)
3. **Resolution**: Fixed at 1024x576 (can't generate 1920x1080 directly)
4. **Complex Scenes**: Model struggles with intricate details or many elements
5. **Text in Video**: Cannot reliably generate readable text

### Storage Considerations
**⚠️ Important**: Like DALL-E images, Replicate returns **temporary URLs** that expire.

**Production Solution:**
```javascript
// After receiving video from Replicate
const videoUrl = data.video.url;

// Download video file
const videoResponse = await fetch(videoUrl);
const videoBuffer = await videoResponse.arrayBuffer();

// Upload to permanent storage (S3, Cloudinary, etc.)
const permanentUrl = await uploadVideoToS3(videoBuffer, 'video/mp4');

// Save to database
await Media.create({
  name: 'AI Generated Video',
  url: permanentUrl,
  type: 'ai_video',
  prompt: prompt,
  duration: frames,
  dimensions: { width, height }
});
```

---

## Error Handling

### Common Errors

| Error Code | Cause | Solution |
|------------|-------|----------|
| `503` | API token not configured | Add `REPLICATE_API_TOKEN` to `.env` |
| `401` | Invalid API token | Check token from Replicate dashboard |
| `429` | Rate limit exceeded | Wait or upgrade plan |
| `400` | Invalid prompt | Provide valid text description |
| `500` | Model timeout | Retry or reduce frame count |

### Error Messages
```javascript
// Missing API token
{
  "error": "Replicate API token not configured",
  "message": "Please add REPLICATE_API_TOKEN to your .env file"
}

// Invalid token
{
  "error": "Invalid Replicate API token",
  "message": "Please check your REPLICATE_API_TOKEN in .env file"
}

// Rate limit
{
  "error": "Rate limit exceeded",
  "message": "Too many requests to Replicate API"
}
```

---

## Future Enhancements

### Potential Improvements
1. **Longer Videos**: Extend to 5-10 seconds with more frames
2. **Higher Resolution**: Upscale to 1920x1080 for full HD displays
3. **Progress Tracking**: Show generation progress percentage
4. **Video Library**: Save and reuse generated videos
5. **Style Presets**: Pre-configured settings for different video types
6. **Batch Generation**: Generate multiple variations at once
7. **Custom Parameters**: Let users adjust inference steps, guidance scale

### Alternative Models
- **Runway Gen-2**: Higher quality but more expensive
- **Pika Labs**: Better text handling
- **AnimateDiff**: Animation from static images
- **Stable Video Diffusion**: Convert images to video

---

## Support & Resources

### Documentation
- **Replicate Docs**: [replicate.com/docs](https://replicate.com/docs)
- **Zeroscope Model**: [replicate.com/anotherjesse/zeroscope-v2-xl](https://replicate.com/anotherjesse/zeroscope-v2-xl)
- **Fabric.js Video**: [fabricjs.com](http://fabricjs.com/fabric-intro-part-5#video)

### API Reference
- **Design API**: `/api/design/ai/generate-video`
- **Method**: POST
- **Authentication**: JWT Bearer token required
- **Rate Limiting**: Recommended 10 requests/minute per user

---

## Summary

The AI video generation feature adds powerful motion content capabilities to SignCraft using Replicate's Zeroscope V2 XL model. Users can generate high-quality video clips from text prompts in 60-90 seconds, perfect for creating engaging digital signage content.

**Key Takeaways:**
- Easy setup with Replicate API token
- Text-to-video in ~90 seconds
- Seamless integration with Design Studio
- Automatic looping and playback
- Cost-effective at ~$0.05-0.10 per video
- Perfect for ambient loops and motion backgrounds
