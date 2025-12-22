# Gemini AI Integration for SignCraft

## Overview

SignCraft now uses **Google Gemini 2.0** as its comprehensive AI foundation, replacing OpenAI and Replicate with a unified, multimodal intelligence layer that powers every aspect of the platform.

---

## Why Gemini?

- **Unified AI Platform**: One API for all AI needs
- **Multimodal Understanding**: Text, images, video comprehension
- **Cost Effective**: ~75% lower cost than GPT-4
- **Structured Output**: Native JSON mode for reliable data
- **Long Context**: 1M+ token context window
- **Fast**: Gemini 2.0 Flash optimized for speed

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│           Gemini AI Intelligence Layer          │
├─────────────────────────────────────────────────┤
│  1. Creative Intelligence                       │
│     - Design Generation                         │
│     - Image Concepts                            │
│     - SVG Creation                              │
│     - Background Generation                     │
│     - Design Optimization                       │
│     - Auto-Resize                               │
│                                                 │
│  2. Copywriting Intelligence                    │
│     - Headline Generation                       │
│     - CTA Creation                              │
│     - Text Rewriting                            │
│     - Translation & Localization                │
│     - Fit-to-Screen                             │
│     - Body Copy Generation                      │
│                                                 │
│  3. Playlist & Scheduling Intelligence          │
│     - Playlist Optimization                     │
│     - Schedule Recommendations                  │
│     - Content Fatigue Detection                 │
│                                                 │
│  4. Screen Diagnostics Intelligence             │
│     - Health Analysis                           │
│     - Predictive Maintenance                    │
│     - Remote Action Suggestions                 │
│                                                 │
│  5. Analytics Intelligence                      │
│     - Natural Language Queries                  │
│     - Result Interpretation                     │
│     - Performance Comparison                    │
│                                                 │
│  6. Usage Tracking & Safety                     │
│     - Rate Limiting                             │
│     - Cost Tracking                             │
│     - Audit Logging                             │
│     - Approval Workflows                        │
└─────────────────────────────────────────────────┘
```

---

## Setup

### 1. Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key (starts with `AI...`)

### 2. Configure Backend

```bash
cd server
```

Add to `.env`:
```env
GEMINI_API_KEY=AIzaSy...your_key_here
```

### 3. Install Dependencies

```bash
cd server
npm install @google/generative-ai
```

### 4. Run Database Migrations

```bash
cd server
npm run db:migrate
```

This creates:
- `ai_usage_logs` - Track all AI requests
- `ai_generated_content` - Store generated assets
- `ai_usage_limits` - Per-tenant rate limits

---

## Features

### 1. Creative Intelligence

#### Generate Complete Designs

```javascript
POST /api/ai/creative/generate-design
```

**Request:**
```json
{
  "prompt": "Modern Ramadan sale poster with gold and dark blue",
  "dimensions": "1080x1920",
  "orientation": "portrait",
  "style": "modern",
  "brandColors": ["#FFD700", "#001F3F"],
  "purpose": "mall digital signage"
}
```

**Response:**
```json
{
  "design": {
    "layout": {
      "structure": "header-content-footer",
      "areas": [...]
    },
    "typography": {
      "headingFont": "Montserrat",
      "bodyFont": "Open Sans",
      "sizes": { "h1": 120, "h2": 72, "body": 48 }
    },
    "colors": {
      "primary": "#FFD700",
      "secondary": "#001F3F",
      ...
    },
    "elements": [...]
  },
  "tokensUsed": 1250,
  "cost": 0.000094
}
```

#### Generate Image Concepts

**Note**: Gemini generates detailed image descriptions. For actual image generation, integrate with Imagen 3 API.

```javascript
POST /api/ai/creative/generate-image
```

**Request:**
```json
{
  "prompt": "Professional office lobby with modern furniture",
  "style": "photorealistic",
  "aspectRatio": "16:9"
}
```

**Response:**
```json
{
  "image": {
    "description": "A spacious, well-lit office lobby...",
    "prompt": "Professional office lobby...",
    "note": "Use Imagen 3 API for actual generation"
  },
  "tokensUsed": 85,
  "cost": 0.000006
}
```

#### Generate SVG Icons

```javascript
POST /api/ai/creative/generate-svg
```

**Request:**
```json
{
  "description": "Shopping cart icon",
  "size": "24",
  "style": "outline"
}
```

**Response:**
```json
{
  "svg": "<svg viewBox=\"0 0 24 24\"...",
  "tokensUsed": 120
}
```

#### Optimize Designs

```javascript
POST /api/ai/creative/optimize-design
```

Analyzes and improves:
- Readability from distance
- Color contrast (WCAG AA/AAA)
- Visual hierarchy
- Typography choices
- Layout balance
- File size

#### Auto-Resize for Different Screens

```javascript
POST /api/ai/creative/resize-design
```

Intelligently adapts designs:
- Portrait ↔ Landscape
- Different resolutions
- Maintains readability
- Preserves hierarchy
- Reflows content

---

### 2. Copywriting Intelligence

#### Generate Headlines

```javascript
POST /api/ai/copy/generate-headline
```

**Request:**
```json
{
  "context": "Grand opening sale for electronics store",
  "tone": "exciting",
  "maxLength": 50,
  "language": "en",
  "count": 5
}
```

**Response:**
```json
{
  "headlines": [
    {
      "text": "GRAND OPENING - 50% OFF EVERYTHING!",
      "length": 34,
      "strength": "high",
      "reasoning": "Creates urgency with discount"
    },
    ...
  ]
}
```

#### Generate Calls-to-Action

```javascript
POST /api/ai/copy/generate-cta
```

**Request:**
```json
{
  "context": "Food delivery app promotion",
  "actionType": "download",
  "urgency": "high",
  "language": "en",
  "count": 5
}
```

**Response:**
```json
{
  "ctas": [
    {
      "text": "Order Now & Save",
      "impact": "high",
      "urgencyLevel": "medium-high",
      "bestFor": "immediate action"
    },
    ...
  ]
}
```

#### Rewrite for Attention Spans

```javascript
POST /api/ai/copy/rewrite
```

Optimizes text for:
- 3-5 second viewing time
- Quick scanning
- Short attention spans
- Distance reading
- Visual hierarchy

#### Translate & Localize

```javascript
POST /api/ai/copy/translate
```

**Request:**
```json
{
  "text": "Welcome to our store!",
  "targetLanguage": "Malay",
  "culturalContext": "Malaysia",
  "preserveTone": true
}
```

Provides:
- Accurate translation
- Cultural adaptations
- Tone preservation
- Reading direction
- Local idioms

#### Fit Text to Screen

```javascript
POST /api/ai/copy/fit-to-screen
```

**Request:**
```json
{
  "text": "Very long text that needs to fit...",
  "screenDimensions": "1920x1080",
  "fontSize": 72,
  "maxLines": 2
}
```

Automatically:
- Shortens text
- Maintains message
- Suggests alternatives
- Recommends font sizes

---

### 3. Playlist & Scheduling Intelligence

#### Optimize Playlists

```javascript
POST /api/ai/playlist/optimize
```

**Request:**
```json
{
  "playlist": [...],
  "context": "maximize engagement",
  "screenLocation": "Mall entrance, Kuala Lumpur",
  "timeOfDay": "weekday mornings",
  "audienceType": "commuters",
  "screenType": "vertical 55-inch"
}
```

**Response:**
```json
{
  "optimizedPlaylist": {
    "optimizedOrder": [
      {
        "itemId": "promo-1",
        "position": 1,
        "duration": 8,
        "reasoning": "High-energy content for morning audience"
      },
      ...
    ],
    "recommendations": [
      {
        "category": "Duration",
        "suggestion": "Reduce item 3 from 15s to 10s",
        "impact": "high",
        "priority": "high"
      }
    ],
    "insights": {
      "totalDuration": "2 minutes 15 seconds",
      "contentBalance": "Good mix of promotional and informational",
      "engagementScore": 8.5,
      "warnings": ["Item 5 might be too text-heavy"]
    }
  }
}
```

#### Recommend Schedules

```javascript
POST /api/ai/playlist/recommend-schedule
```

**Request:**
```json
{
  "playlistIds": ["breakfast", "lunch", "dinner"],
  "context": "restaurant promotion",
  "timezone": "Asia/Kuala_Lumpur",
  "businessHours": "6 AM - 11 PM",
  "holidays": ["2024-04-10", "2024-05-01"],
  "specialEvents": [
    { "date": "2024-03-15", "name": "Ramadan" }
  ]
}
```

Considers:
- Peak audience times
- Local culture & customs
- Weather patterns
- Day of week
- Special events
- Holidays

#### Detect Content Fatigue

```javascript
POST /api/ai/playlist/detect-fatigue
```

Analyzes playback logs to detect:
- Overplayed content
- Performance degradation
- Optimal refresh intervals
- Variety gaps

---

### 4. Screen Diagnostics Intelligence

#### Analyze Screen Health

```javascript
POST /api/ai/diagnostics/analyze-screen
```

**Request:**
```json
{
  "screenData": {
    "id": "screen-123",
    "lastHeartbeat": "2024-12-19T10:30:00Z",
    "status": "online",
    "uptime": 98.2
  },
  "logs": [...]
}
```

**Response:**
```json
{
  "analysis": {
    "healthScore": 85,
    "status": "good",
    "issues": [
      {
        "severity": "medium",
        "issue": "Frequent reconnections between 2-3 AM",
        "suggestedFix": "Check WiFi stability during off-hours",
        "preventative": "Consider wired connection"
      }
    ],
    "predictions": [
      {
        "risk": "Storage filling up",
        "probability": "medium",
        "timeframe": "2-3 weeks",
        "mitigation": "Schedule cache cleanup"
      }
    ]
  }
}
```

#### Suggest Remote Actions

```javascript
POST /api/ai/diagnostics/suggest-action
```

**Request:**
```json
{
  "screenId": "screen-123",
  "issue": "Screen showing black screen but responding to heartbeat"
}
```

**Response:**
```json
{
  "actions": {
    "recommendedActions": [
      {
        "action": "reload_content",
        "description": "Force reload current playlist",
        "risk": "low",
        "expectedOutcome": "Content should display within 10s"
      },
      {
        "action": "restart_player",
        "description": "Restart SignCraft player application",
        "risk": "medium",
        "expectedOutcome": "Full restart, 30-60s downtime"
      }
    ],
    "requiresConfirmation": true,
    "warnings": ["Restart will cause brief downtime"]
  }
}
```

---

### 5. Analytics Intelligence

#### Natural Language Queries

```javascript
POST /api/ai/analytics/query
```

**Request:**
```json
{
  "question": "Which screens had the lowest uptime last month?",
  "databaseSchema": {...}
}
```

**Response:**
```json
{
  "query": {
    "sql": "SELECT screen_id, name, uptime_percentage FROM screens WHERE tenant_id = ? AND last_month = true ORDER BY uptime_percentage ASC LIMIT 100",
    "explanation": "This query finds screens with lowest uptime...",
    "parameters": ["tenant_id"],
    "estimatedRows": "10-50"
  },
  "warning": "Execute SQL with caution. Validate before running."
}
```

**Safety Features:**
- Read-only (SELECT only)
- Always includes tenant_id filter
- Limited to 100 rows
- No destructive operations

#### Interpret Results

```javascript
POST /api/ai/analytics/interpret
```

**Request:**
```json
{
  "queryResults": [...],
  "context": "screen uptime analysis"
}
```

**Response:**
```json
{
  "interpretation": {
    "summary": "3 screens show significantly lower uptime...",
    "insights": [
      "Screens in Building A have 15% lower uptime",
      "Friday nights show highest failure rate"
    ],
    "trends": [
      "Uptime improving month-over-month",
      "Network issues correlate with failures"
    ],
    "recommendations": [
      "Investigate Building A network infrastructure",
      "Schedule maintenance on Friday afternoons"
    ],
    "anomalies": [
      "Screen #42 sudden drop on Dec 15"
    ]
  }
}
```

#### Compare Performance

```javascript
POST /api/ai/analytics/compare
```

**Request:**
```json
{
  "dataA": { "campaign": "Summer Sale", "clicks": 1250 },
  "dataB": { "campaign": "Winter Sale", "clicks": 980 },
  "comparisonContext": "campaign performance"
}
```

**Response:**
```json
{
  "comparison": {
    "winner": "Summer Sale",
    "differences": [
      {
        "metric": "clicks",
        "valueA": "1250",
        "valueB": "980",
        "difference": "+27.6%",
        "significance": "high"
      }
    ],
    "insights": [
      "Summer campaign had 27.6% more engagement",
      "Visual style may have contributed"
    ],
    "recommendations": [
      "Use Summer campaign's design style for future promotions"
    ]
  }
}
```

---

### 6. Usage Tracking & Safety

#### Get Usage Statistics

```javascript
GET /api/ai/usage/stats
```

**Response:**
```json
{
  "usage": {
    "requests": {
      "used": 450,
      "limit": 1000,
      "percentage": "45.00"
    },
    "tokens": {
      "used": 125000,
      "limit": 1000000,
      "percentage": "12.50"
    },
    "cost": {
      "used": 2.35,
      "limit": 50.00,
      "percentage": "4.70"
    }
  }
}
```

#### Safety Controls

**Rate Limiting** (per tenant):
- Default: 1000 requests/month
- Default: 1M tokens/month
- Default: $50/month

**Configurable in `ai_usage_limits` table:**
```sql
UPDATE ai_usage_limits
SET monthly_request_limit = 2000,
    monthly_cost_limit_usd = 100.00
WHERE tenant_id = '...';
```

**Approval Workflow:**
```sql
UPDATE ai_usage_limits
SET require_approval = true
WHERE tenant_id = '...';
```

When enabled:
- AI-generated content saved with `approval_status = 'pending'`
- Admin must approve before use
- Tracks approver and timestamp

**Audit Logging:**

Every AI request is logged in `ai_usage_logs`:
- User ID
- Feature type
- Action
- Prompt
- Tokens used
- Cost
- Response data
- Timestamp

---

## Cost Comparison

| Feature | OpenAI (Old) | Gemini 2.0 (New) | Savings |
|---------|--------------|------------------|---------|
| **Text Generation** | $0.03/1K tokens | $0.000075/1K tokens | **99.75%** |
| **Image Concepts** | $0.04/image | $0.0001/request | **99.75%** |
| **Layout Design** | $0.03/request | $0.0002/request | **99.3%** |
| **Analysis** | $0.03/1K tokens | $0.000075/1K tokens | **99.75%** |

**Monthly Cost Examples:**
- 1000 AI requests/month: **$1.50** (vs $60 with OpenAI)
- 5000 AI requests/month: **$7.50** (vs $300 with OpenAI)

---

## Database Schema

### `ai_usage_logs`

```sql
CREATE TABLE ai_usage_logs (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL,
  feature_type ENUM('design', 'copywriting', 'playlist', 'diagnostics', 'analytics', 'query', 'admin'),
  action VARCHAR(100),
  prompt TEXT,
  model_used VARCHAR(50) DEFAULT 'gemini-2.0-flash-exp',
  tokens_used INT DEFAULT 0,
  cost_usd DECIMAL(10,6) DEFAULT 0.000000,
  status ENUM('pending', 'completed', 'failed', 'moderated'),
  response_data JSON,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX(tenant_id),
  INDEX(feature_type),
  INDEX(created_at)
);
```

### `ai_generated_content`

```sql
CREATE TABLE ai_generated_content (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL,
  usage_log_id UUID,
  content_type ENUM('image', 'video', 'svg', 'text', 'layout', 'design'),
  url VARCHAR(500),
  prompt TEXT NOT NULL,
  metadata JSON,
  approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
  approved_by UUID,
  approved_at TIMESTAMP,
  version INT DEFAULT 1,
  parent_id UUID,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  INDEX(tenant_id),
  INDEX(approval_status)
);
```

### `ai_usage_limits`

```sql
CREATE TABLE ai_usage_limits (
  id UUID PRIMARY KEY,
  tenant_id UUID UNIQUE NOT NULL,
  monthly_request_limit INT DEFAULT 1000,
  monthly_token_limit INT DEFAULT 1000000,
  monthly_cost_limit_usd DECIMAL(10,2) DEFAULT 50.00,
  current_month_requests INT DEFAULT 0,
  current_month_tokens INT DEFAULT 0,
  current_month_cost_usd DECIMAL(10,2) DEFAULT 0.00,
  last_reset_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_enabled BOOLEAN DEFAULT true,
  require_approval BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(tenant_id)
);
```

---

## API Reference

### Base URL
```
http://localhost:3001/api/ai
```

### Authentication
All endpoints require JWT Bearer token:
```
Authorization: Bearer <token>
```

### Endpoints

#### Creative Intelligence
- `POST /creative/generate-design` - Complete design generation
- `POST /creative/generate-image` - Image concept generation
- `POST /creative/generate-svg` - SVG icon generation
- `POST /creative/generate-background` - Background CSS generation
- `POST /creative/optimize-design` - Design optimization
- `POST /creative/resize-design` - Auto-resize for different screens

#### Copywriting Intelligence
- `POST /copy/generate-headline` - Headline generation
- `POST /copy/generate-cta` - CTA generation
- `POST /copy/rewrite` - Text optimization
- `POST /copy/translate` - Translation & localization
- `POST /copy/fit-to-screen` - Fit text to constraints
- `POST /copy/generate-body` - Body copy generation

#### Playlist & Scheduling
- `POST /playlist/optimize` - Playlist optimization
- `POST /playlist/recommend-schedule` - Schedule recommendations
- `POST /playlist/detect-fatigue` - Content fatigue detection

#### Diagnostics
- `POST /diagnostics/analyze-screen` - Screen health analysis
- `POST /diagnostics/suggest-action` - Remote action suggestions

#### Analytics
- `POST /analytics/query` - Natural language to SQL
- `POST /analytics/interpret` - Result interpretation
- `POST /analytics/compare` - Performance comparison

#### Usage
- `GET /usage/stats` - Get current usage statistics

---

## Best Practices

### 1. Prompt Engineering

**Good Prompts:**
```
✅ "Create a modern Ramadan sale poster for a 55-inch vertical mall screen using gold (#FFD700) and dark blue (#001F3F) with Islamic geometric patterns"

✅ "Generate 5 urgent call-to-action phrases for a food delivery app, targeting young professionals during lunch hours"
```

**Bad Prompts:**
```
❌ "Make something nice"
❌ "Design"
❌ "Help"
```

### 2. Context is Key

Always provide:
- Screen dimensions
- Audience type
- Location/timezone
- Purpose/goal
- Brand guidelines

### 3. Iterate

Use Gemini's suggestions as starting points:
1. Generate initial design
2. Optimize with feedback
3. Resize for different screens
4. Test with real audience

### 4. Monitor Usage

- Check `/usage/stats` regularly
- Set appropriate limits
- Enable approval workflow for production
- Review audit logs monthly

### 5. Error Handling

```javascript
try {
  const result = await fetch('/api/ai/creative/generate-design', {...});
  if (!result.ok) {
    // Check for rate limit errors
    if (result.status === 429) {
      alert('Monthly AI limit reached');
    }
  }
} catch (error) {
  console.error('AI request failed:', error);
}
```

---

## Troubleshooting

### "Gemini API not configured"
**Solution:** Add `GEMINI_API_KEY` to server `.env` file

### "Monthly request limit exceeded"
**Solution:** Increase limits in `ai_usage_limits` table or wait for monthly reset

### "Failed to generate content"
**Solution:** Check prompt quality, internet connection, API key validity

### Rate limit errors
**Solution:** Implement request throttling on frontend, increase tenant limits

---

## Future Enhancements

- [ ] Imagen 3 integration for actual image generation
- [ ] Video generation via Veo
- [ ] Multi-image input for design analysis
- [ ] Voice input for queries
- [ ] Real-time collaboration with AI suggestions
- [ ] A/B testing automation
- [ ] Predictive content scheduling
- [ ] Automated content refresh based on performance

---

## Support

For setup assistance, see [SETUP.md](SETUP.md)

For API details, see [API.md](API.md)

For database schema, see [DATABASE.md](DATABASE.md)

---

**Powered by Google Gemini 2.0 Flash**
