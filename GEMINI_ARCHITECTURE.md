# Gemini AI Integration - Complete Architecture

This document provides a comprehensive technical explanation of the Gemini AI integration, including all files, functions, and data flow patterns.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [File Structure](#file-structure)
3. [Core Components](#core-components)
4. [Data Flow](#data-flow)
5. [Feature Breakdown](#feature-breakdown)
6. [Database Layer](#database-layer)
7. [Security & Rate Limiting](#security--rate-limiting)

---

## Architecture Overview

The Gemini AI integration follows a **layered service architecture**:

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER                       │
│  src/components/AIFeatures.jsx - User Interface         │
└────────────────┬────────────────────────────────────────┘
                 │ HTTP Requests (fetch)
                 ↓
┌─────────────────────────────────────────────────────────┐
│                      API LAYER                          │
│  server/src/routes/ai.js - Express Routes              │
└────────────────┬────────────────────────────────────────┘
                 │ Function Calls
                 ↓
┌─────────────────────────────────────────────────────────┐
│                   SERVICE LAYER                         │
│  CreativeService    | Generate designs                  │
│  CopywritingService | Generate text                     │
│  PlaylistService    | Optimize playlists                │
│  DiagnosticsService | Analyze screens                   │
│  AnalyticsService   | Natural language queries          │
└────────────────┬────────────────────────────────────────┘
                 │ API Calls
                 ↓
┌─────────────────────────────────────────────────────────┐
│                   GEMINI LAYER                          │
│  GeminiService - Core API wrapper                       │
│  UsageTracker  - Limits & logging                       │
└────────────────┬────────────────────────────────────────┘
                 │ SDK Calls
                 ↓
┌─────────────────────────────────────────────────────────┐
│               GOOGLE GEMINI API                         │
│  gemini-2.0-flash-exp model                            │
└────────────────┬────────────────────────────────────────┘
                 │ Responses
                 ↓
┌─────────────────────────────────────────────────────────┐
│                   DATABASE LAYER                        │
│  ai_usage_logs   - Request/response audit trail        │
│  ai_usage_limits - Quota management                     │
└─────────────────────────────────────────────────────────┘
```

---

## File Structure

### Frontend Files

```
src/
├── components/
│   └── AIFeatures.jsx          # Main UI component with 6 tabs
└── App.jsx                     # Navigation integration
```

### Backend Files

```
server/src/
├── routes/
│   └── ai.js                   # All API endpoints (18 routes)
│
├── services/ai/
│   ├── GeminiService.js        # Core Gemini API wrapper
│   ├── UsageTracker.js         # Rate limiting & logging
│   ├── CreativeService.js      # Design generation
│   ├── CopywritingService.js   # Text generation
│   ├── PlaylistService.js      # Playlist optimization
│   ├── DiagnosticsService.js   # Screen diagnostics
│   └── AnalyticsService.js     # Natural language queries
│
├── migrations/
│   ├── 20240101000012-create-ai-usage-logs.js
│   └── 20240101000014-create-ai-usage-limits.js
│
└── middleware/
    └── auth.js                 # JWT authentication
```

### Documentation Files

```
project/
├── GEMINI_AI.md               # API reference
├── GEMINI_MIGRATION.md        # Migration guide
├── AI_FEATURES_UI_GUIDE.md    # UI usage guide
└── GEMINI_ARCHITECTURE.md     # This document
```

---

## Core Components

### 1. GeminiService (Core Layer)

**File:** `server/src/services/ai/GeminiService.js`

**Purpose:** Low-level wrapper around Google's Gemini SDK

**Key Functions:**

#### `generateText(prompt, options)`
- Generates plain text responses
- Used for SVG code, CSS backgrounds
- Parameters:
  - `prompt` - The instruction text
  - `options.model` - 'flash' or 'pro'
  - `options.temperature` - 0-1 (creativity)
  - `options.maxTokens` - Max output length
  - `options.systemInstruction` - System role definition

**Returns:** `{ text, tokensUsed, costUsd }`

#### `generateStructuredOutput(prompt, schema, options)`
- Generates JSON responses matching a schema
- Uses Gemini's native JSON mode
- Ensures type-safe, parseable output
- Parameters:
  - `prompt` - The instruction
  - `schema` - JSON Schema definition
  - `options` - Same as generateText

**Returns:** `{ data, tokensUsed, costUsd }`

#### `generateImage(prompt, options)`
- Currently generates image descriptions
- Ready for Imagen 3 API integration
- Parameters:
  - `prompt` - Image description
  - `options.aspectRatio` - '16:9', '1:1', etc.
  - `options.style` - 'natural', 'professional', etc.

**Returns:** `{ description, prompt, tokensUsed, costUsd }`

#### `checkLimits(tenantId)`
- Validates usage against monthly limits
- Called before every API request
- Returns: `{ allowed: boolean, reason?: string }`

#### `calculateCost(tokens, model)`
- Calculates USD cost from token count
- Pricing:
  - Flash: $0.000075 per token
  - Pro: $0.000375 per token

**Data Flow:**
```
Request → checkLimits() → generateContent() → updateUsage() → Return
```

---

### 2. UsageTracker (Rate Limiting)

**File:** `server/src/services/ai/UsageTracker.js`

**Purpose:** Enforce usage limits and track consumption

**Key Functions:**

#### `checkLimits(tenantId)`
1. Fetches or creates limits record for tenant
2. Checks if new month (resets if needed)
3. Validates against 3 limits:
   - Monthly requests (default: 1000)
   - Monthly tokens (default: 1M)
   - Monthly cost (default: $50)
4. Returns authorization decision

#### `logRequest(data)`
- Creates initial log entry with status 'pending'
- Records: tenant, user, feature, action, prompt, model
- Returns: Log ID for later updates

#### `updateRequest(logId, data)`
- Updates log with completion data
- Records: status, tokens, cost, response
- Calls `incrementUsage()` if successful

#### `incrementUsage(tenantId, tokens, cost)`
- Atomically increments counters
- Updates: requests +1, tokens +N, cost +$X

#### `getUsageStats(tenantId)`
- Returns current usage statistics
- Format:
```json
{
  "requests": { "used": 45, "limit": 1000, "percentage": "4.50" },
  "tokens": { "used": 12500, "limit": 1000000, "percentage": "1.25" },
  "cost": { "used": 0.94, "limit": 50.00, "percentage": "1.88" }
}
```

#### `resetIfNewMonth(limits)`
- Automatically resets counters on new month
- Compares current month vs `last_reset_at`
- Resets: requests, tokens, cost to 0

---

### 3. CreativeService (Design Generation)

**File:** `server/src/services/ai/CreativeService.js`

**Purpose:** Generate design specifications, SVG icons, backgrounds

**Key Functions:**

#### `generateDesign(prompt, options)`
**What it does:** Creates complete design specifications for digital signage

**Process:**
1. Constructs detailed prompt with requirements:
   - Dimensions (e.g., 1920x1080)
   - Style (modern, minimalist, bold, etc.)
   - Brand colors (if provided)
   - Purpose (general, advertisement, etc.)

2. Defines JSON schema for structured output:
```javascript
{
  layout: { structure, grid, areas[] },
  typography: { headingFont, bodyFont, sizes{} },
  colors: { primary, secondary, accent, background, text },
  elements: [{ type, content, position, style }],
  recommendations: { imagery, animations, duration }
}
```

3. Calls `geminiService.generateStructuredOutput()`

4. Returns complete design specification

**Example Input:**
```javascript
{
  prompt: "Modern Ramadan sale poster",
  dimensions: "1920x1080",
  style: "modern",
  brandColors: ["#FFD700", "#1A237E"]
}
```

**Example Output:**
```javascript
{
  layout: {
    structure: "Hero with centered content",
    areas: [
      { name: "header", x: 0, y: 0, width: 1920, height: 200 },
      { name: "main", x: 100, y: 250, width: 1720, height: 600 }
    ]
  },
  typography: {
    headingFont: "Poppins Bold",
    sizes: { h1: 96, h2: 64, body: 32 }
  },
  colors: {
    primary: "#FFD700",
    secondary: "#1A237E",
    background: "#0A0E27"
  },
  elements: [
    {
      type: "heading",
      content: "RAMADAN SPECIAL",
      position: { x: 960, y: 300, width: 1000, height: 120 }
    }
  ]
}
```

#### `generateSVGIcon(description, options)`
**What it does:** Generates SVG code for custom icons

**Process:**
1. Creates prompt requesting clean SVG code
2. Specifies: size, style (outline/solid), requirements
3. Uses `generateText()` to get raw SVG code
4. Returns SVG string ready for use

**Example:**
```javascript
Input: { description: "shopping cart", size: "24", style: "outline" }
Output: "<svg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>...</svg>"
```

#### `generateBackground(theme, options)`
**What it does:** Creates CSS background code

**Returns:** CSS code for gradients, patterns, or solid colors

#### `optimizeDesign(design, criteria, options)`
**What it does:** Analyzes existing design and provides optimization suggestions

**Returns:**
```javascript
{
  overallScore: 85,
  suggestions: [
    {
      category: "Readability",
      issue: "Heading font too small for 10ft viewing",
      recommendation: "Increase h1 to 120px",
      priority: "high",
      impact: "Improves readability by 40%"
    }
  ],
  optimizedElements: {}
}
```

#### `resizeDesign(design, newDimensions, options)`
**What it does:** Adapts design for different screen sizes

**Intelligence:**
- Scales fonts proportionally
- Adjusts spacing and padding
- Maintains aspect ratios
- Reflows content for portrait/landscape changes
- Preserves visual hierarchy

---

### 4. CopywritingService (Text Generation)

**File:** `server/src/services/ai/CopywritingService.js`

**Purpose:** Generate headlines, CTAs, body copy optimized for digital signage

**Key Functions:**

#### `generateHeadline(context, options)`
**What it does:** Creates attention-grabbing headlines

**Process:**
1. Analyzes context (e.g., "Grand opening sale")
2. Considers: tone, max length, language
3. Generates multiple options (default: 5)
4. Rates each by "strength" (high/medium/low)

**Returns:**
```javascript
{
  headlines: [
    {
      text: "GRAND OPENING! 50% OFF EVERYTHING",
      length: 32,
      strength: "high",
      reasoning: "Creates urgency with exclamation, clear benefit"
    },
    {
      text: "Discover Amazing Deals Today",
      length: 28,
      strength: "medium",
      reasoning: "Softer approach, less urgent"
    }
  ]
}
```

**Parameters:**
- `context` - What the headline is about
- `tone` - professional, exciting, friendly, urgent, playful
- `maxLength` - Character limit (default: 50)
- `language` - en, ms, zh, ta
- `count` - Number of options (default: 5)

#### `generateCTA(context, options)`
**What it does:** Creates compelling call-to-action phrases

**Returns:**
```javascript
{
  ctas: [
    {
      text: "SHOP NOW",
      impact: "high",
      urgencyLevel: "high",
      bestFor: "Sales, promotions"
    },
    {
      text: "Learn More",
      impact: "medium",
      urgencyLevel: "low",
      bestFor: "Information, education"
    }
  ]
}
```

**Parameters:**
- `actionType` - visit, buy, register, learn
- `urgency` - low, medium, high
- `language` - en, ms, zh, ta
- `count` - Number of options

#### `generateBody(topic, options)`
**What it does:** Creates body copy for longer messages

**Parameters:**
- `length` - 'short' (30-50 words), 'medium' (50-100), 'long' (100-150)
- `tone` - professional, friendly, etc.
- `keyPoints` - Array of must-include points
- `language` - Target language

**Returns:** Multiple versions with different approaches

#### `rewriteForAttention(text, options)`
**What it does:** Condenses text for short attention spans

**Goal:** Reduce word count by 50%+ while maintaining core message

**Returns:**
```javascript
{
  original: {
    text: "Visit our store...",
    wordCount: 45,
    readingTime: "9 seconds"
  },
  rewrites: [
    {
      version: "Ultra-concise",
      text: "50% Off Everything. Today Only.",
      wordCount: 6,
      readingTime: "1.2 seconds",
      approach: "Focus on key benefit and urgency",
      strengths: ["Immediate impact", "Clear benefit", "Urgency"]
    }
  ]
}
```

#### `translateAndAdapt(text, options)`
**What it does:** Translates text while adapting for cultural context

**Intelligence:**
- Accurate translation
- Cultural appropriateness
- Adapts idioms and expressions
- Considers local customs
- Maintains marketing impact

**Returns:**
```javascript
{
  translation: {
    text: "Selamat Hari Raya - 50% Diskaun",
    language: "ms",
    readingDirection: "ltr"
  },
  adaptations: [
    {
      original: "Christmas Sale",
      adapted: "Year End Sale",
      reason: "More culturally appropriate for Malaysian Muslim audience"
    }
  ],
  culturalNotes: [
    "Used 'Selamat Hari Raya' greeting which is common during Ramadan",
    "Avoided religious references that may not apply"
  ],
  confidence: "high"
}
```

#### `fitToScreenSize(text, screenDimensions, options)`
**What it does:** Adapts text to fit screen constraints

**Parameters:**
- `screenDimensions` - "1920x1080"
- `fontSize` - Target font size (default: 48)
- `maxLines` - Maximum lines (default: 3)

**Returns:** Optimized versions that fit within constraints

---

### 5. PlaylistService (Content Scheduling)

**File:** `server/src/services/ai/PlaylistService.js`

**Purpose:** Optimize content order and scheduling for maximum engagement

**Key Functions:**

#### `optimizePlaylist(playlist, context, options)`
**What it does:** Reorders and times playlist items for maximum impact

**Context Examples:**
- "maximize engagement"
- "promote new products"
- "maintain brand awareness"

**Parameters:**
- `screenLocation` - "Mall entrance, Kuala Lumpur"
- `timeOfDay` - "weekday mornings"
- `audienceType` - "commuters", "shoppers", "professionals"
- `screenType` - "vertical 55-inch"

**Returns:**
```javascript
{
  optimizedOrder: [
    {
      itemId: "promo-video",
      position: 1,
      duration: 15,
      reasoning: "High-impact opener captures attention during peak traffic"
    },
    {
      itemId: "brand-message",
      position: 2,
      duration: 10,
      reasoning: "Reinforces brand after initial engagement"
    }
  ],
  recommendations: [
    {
      category: "Pacing",
      suggestion: "Alternate between video and static content",
      impact: "Reduces viewer fatigue, increases engagement",
      priority: "high"
    }
  ],
  insights: {
    totalDuration: "2 minutes 15 seconds",
    contentBalance: "Good mix of promotional and informational",
    engagementScore: 87,
    warnings: ["Item 3 may be too long for morning commuters"]
  }
}
```

#### `recommendSchedule(playlistIds, context, options)`
**What it does:** Recommends when to play each playlist

**Intelligence:**
- Peak audience times
- Content relevance by time
- Day of week patterns
- Local culture and customs
- Seasonal variations
- Weather impact

**Parameters:**
- `playlistIds` - Array of playlist IDs
- `timezone` - "Asia/Kuala_Lumpur"
- `businessHours` - "6 AM - 11 PM"
- `holidays` - Array of dates
- `specialEvents` - Array of events

**Returns:**
```javascript
{
  schedule: [
    {
      playlistId: "breakfast-promo",
      timeSlots: ["06:00-10:00"],
      daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      reasoning: "Target morning commuters during breakfast hours",
      expectedImpact: "High engagement with working professionals"
    },
    {
      playlistId: "lunch-specials",
      timeSlots: ["11:30-14:00"],
      daysOfWeek: ["All"],
      reasoning: "Peak lunch time across all demographics",
      expectedImpact: "Maximum visibility during meal decisions"
    }
  ],
  warnings: ["Weekend morning traffic is 40% lower"],
  opportunities: ["Consider special weekend playlists for families"]
}
```

#### `detectContentFatigue(playbackLogs, options)`
**What it does:** Identifies overplayed or stale content

**Parameters:**
- `playbackLogs` - Array of { itemId, playCount, lastPlayed }

**Returns:**
```javascript
{
  fatigueDetected: true,
  overplayedItems: [
    {
      itemId: "summer-sale-v1",
      playCount: 450,
      recommendation: "Rotate out or refresh creative",
      severity: "high"
    }
  ],
  refreshRecommendations: [
    "Create new version of summer-sale with different visuals",
    "Reduce play frequency to 50% for 1 week",
    "Consider A/B testing new messaging"
  ],
  healthScore: 62
}
```

---

### 6. DiagnosticsService (Screen Health)

**File:** `server/src/services/ai/DiagnosticsService.js`

**Purpose:** Analyze screen health and suggest remediation

**Key Functions:**

#### `analyzeScreenHealth(screenData, logs, options)`
**What it does:** Analyzes patterns to detect and predict issues

**Intelligence:**
- Heartbeat pattern analysis
- Error frequency and types
- Performance trend detection
- Network stability assessment
- Hardware indicator analysis
- Unusual behavior detection

**Parameters:**
- `screenData` - { id, lastHeartbeat, status, uptime }
- `logs` - Array of recent events

**Returns:**
```javascript
{
  healthScore: 78,
  status: "Needs Attention",
  issues: [
    {
      severity: "medium",
      issue: "Frequent reconnection attempts detected",
      suggestedFix: "Check network stability or router configuration",
      preventative: "Monitor connection quality, consider wired connection"
    },
    {
      severity: "low",
      issue: "Screen missed 2 heartbeats in last 24 hours",
      suggestedFix: "Schedule maintenance check",
      preventative: "Set up proactive alerts for missed heartbeats"
    }
  ],
  predictions: [
    {
      risk: "Connection failure",
      probability: "medium (35%)",
      timeframe: "Within 7 days",
      mitigation: "Preemptively check network hardware"
    }
  ],
  recommendations: [
    "Review network logs for packet loss",
    "Update screen firmware to latest version",
    "Consider UPS for power stability"
  ]
}
```

#### `suggestRemoteAction(screenId, issue, options)`
**What it does:** Provides step-by-step troubleshooting

**Parameters:**
- `screenId` - Unique identifier
- `issue` - Description of problem

**Returns:**
```javascript
{
  recommendedActions: [
    {
      action: "Send refresh command",
      description: "Forces screen to reload current playlist",
      risk: "Low - Safe operation",
      expectedOutcome: "Screen displays content within 30 seconds"
    },
    {
      action: "Restart display service",
      description: "Restarts the player software without rebooting device",
      risk: "Low - Temporary 10-second interruption",
      expectedOutcome: "Resolves 80% of display issues"
    },
    {
      action: "Full device reboot",
      description: "Complete system restart",
      risk: "Medium - 2-3 minute downtime",
      expectedOutcome: "Clears all software issues"
    }
  ],
  requiresConfirmation: true,
  warnings: [
    "Actions will cause temporary service interruption",
    "Ensure screen is not in critical viewing period"
  ]
}
```

---

### 7. AnalyticsService (Natural Language Queries)

**File:** `server/src/services/ai/AnalyticsService.js`

**Purpose:** Convert questions to SQL and interpret results

**Key Functions:**

#### `naturalLanguageQuery(question, databaseSchema, options)`
**What it does:** Converts plain English to safe SQL

**Intelligence:**
- Understands database schema
- Generates read-only queries (SELECT only)
- ALWAYS includes tenant_id filter (multi-tenant security)
- Optimizes queries
- Includes appropriate JOINs
- Limits results to prevent overload

**Parameters:**
- `question` - "Which screens had the lowest uptime last month?"
- `databaseSchema` - Object describing tables and columns
- `tenantId` - Automatically included for security

**Returns:**
```javascript
{
  sql: `
    SELECT
      s.id,
      s.name,
      s.uptime_percentage,
      s.last_heartbeat
    FROM screens s
    WHERE s.tenant_id = '${tenantId}'
      AND s.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
    ORDER BY s.uptime_percentage ASC
    LIMIT 10
  `,
  explanation: "This query retrieves the 10 screens with lowest uptime in the last month, filtered by your organization",
  parameters: ["tenantId"],
  estimatedRows: "0-10"
}
```

**Security Features:**
- Only SELECT statements generated
- Tenant isolation enforced
- No DROP, DELETE, UPDATE, INSERT
- Result limits enforced

#### `interpretResults(queryResults, context, options)`
**What it does:** Explains data in plain English

**Parameters:**
- `queryResults` - Array of rows from database
- `context` - "screen uptime analysis"

**Returns:**
```javascript
{
  summary: "Analysis of 10 screens shows 3 with concerning uptime below 90%. Average uptime is 93.2%, with significant variance suggesting infrastructure inconsistencies.",

  insights: [
    "Screen-42 has only 87.3% uptime, lowest in your fleet",
    "Screens in Building A consistently outperform Building B by 4%",
    "Uptime degraded 2.1% compared to previous month"
  ],

  trends: [
    "Uptime declining month-over-month",
    "Weekend performance better than weekdays",
    "Network-related issues increasing"
  ],

  recommendations: [
    "Prioritize maintenance for Screen-42",
    "Investigate Building B network infrastructure",
    "Consider redundant connections for critical screens"
  ],

  anomalies: [
    "Screen-17 had perfect 100% uptime despite being oldest device",
    "Unexpected drop in all screens on March 15th at 2 AM (possible ISP issue)"
  ]
}
```

#### `comparePerformance(dataA, dataB, options)`
**What it does:** Compares two campaigns, screens, or time periods

**Parameters:**
- `dataA` - First dataset
- `dataB` - Second dataset
- `comparisonContext` - "campaign performance"

**Returns:**
```javascript
{
  winner: "Campaign A",

  differences: [
    {
      metric: "Engagement",
      valueA: "1250 interactions",
      valueB: "980 interactions",
      difference: "+27.6%",
      significance: "Statistically significant (p < 0.05)"
    },
    {
      metric: "Click-through Rate",
      valueA: "36%",
      valueB: "32.7%",
      difference: "+3.3pp",
      significance: "Significant"
    },
    {
      metric: "Cost per Engagement",
      valueA: "$0.08",
      valueB: "$0.10",
      difference: "-20%",
      significance: "Meaningful"
    }
  ],

  insights: [
    "Campaign A achieved 27.6% more engagement with similar reach",
    "Campaign A's creative resonated better with target audience",
    "Campaign B had higher frequency but lower quality engagement"
  ],

  recommendations: [
    "Replicate Campaign A's visual style for future campaigns",
    "Campaign B's messaging needs refinement",
    "Consider A/B testing specific elements from both campaigns"
  ]
}
```

---

## Data Flow

### Complete Request Flow

Here's a detailed trace of a request from UI to database:

#### 1. User Interaction (Frontend)

```javascript
// src/components/AIFeatures.jsx
const makeRequest = async (endpoint, body) => {
  const response = await fetch(`http://localhost:3001/api/ai/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  setResult(data);
};
```

**Data sent:**
```json
{
  "prompt": "Modern Ramadan sale poster",
  "dimensions": "1920x1080",
  "style": "modern"
}
```

#### 2. API Route Handler (Express)

```javascript
// server/src/routes/ai.js
router.post('/creative/generate-design', authenticateToken, async (req, res) => {
  // 1. Validate input
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // 2. Check API key
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ error: 'Gemini API not configured' });
  }

  // 3. Call service
  const result = await creativeService.generateDesign(prompt, {
    tenantId: req.user.tenantId,
    userId: req.user.id,
    dimensions,
    style
  });

  // 4. Return result
  res.json({
    design: result.data,
    tokensUsed: result.tokensUsed,
    cost: result.costUsd
  });
});
```

**Middleware (authenticateToken):**
- Verifies JWT token
- Extracts user info: `req.user = { id, tenantId, email }`

#### 3. Service Layer

```javascript
// server/src/services/ai/CreativeService.js
async generateDesign(prompt, options) {
  // 1. Build detailed prompt
  const designPrompt = `Create a ${style} design for digital signage...`;

  // 2. Define JSON schema
  const schema = {
    type: 'object',
    properties: {
      layout: { ... },
      typography: { ... },
      colors: { ... }
    }
  };

  // 3. Call core service
  return await geminiService.generateStructuredOutput(designPrompt, schema, {
    tenantId,
    userId,
    featureType: 'design',
    action: 'generate_design'
  });
}
```

#### 4. Core Service (Gemini Layer)

```javascript
// server/src/services/ai/GeminiService.js
async generateStructuredOutput(prompt, schema, options) {
  // 1. Check usage limits
  const canProceed = await this.checkLimits(tenantId);
  if (!canProceed.allowed) {
    throw new Error(canProceed.reason);
  }

  // 2. Create log entry
  const usageLogId = await this.usageTracker.logRequest({
    tenantId,
    userId,
    featureType: 'design',
    action: 'generate_design',
    prompt,
    model: 'gemini-2.0-flash-exp'
  });

  // 3. Call Gemini API
  const geminiModel = this.genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: schema
    }
  });

  const result = await geminiModel.generateContent(prompt);
  const jsonText = result.response.text();
  const data = JSON.parse(jsonText);

  // 4. Calculate metrics
  const tokensUsed = result.response.usageMetadata?.totalTokenCount || 0;
  const costUsd = this.calculateCost(tokensUsed, 'flash');

  // 5. Update log
  await this.usageTracker.updateRequest(usageLogId, {
    status: 'completed',
    tokensUsed,
    costUsd,
    responseData: data
  });

  // 6. Return result
  return { data, tokensUsed, costUsd };
}
```

#### 5. Usage Tracking (Database)

```javascript
// server/src/services/ai/UsageTracker.js
async updateRequest(logId, data) {
  // 1. Update log entry
  await AIUsageLog.update({
    status: 'completed',
    tokens_used: data.tokensUsed,
    cost_usd: data.costUsd,
    response_data: data.responseData
  }, { where: { id: logId } });

  // 2. Increment tenant usage
  await AIUsageLimit.increment({
    current_month_requests: 1,
    current_month_tokens: data.tokensUsed,
    current_month_cost_usd: parseFloat(data.costUsd)
  }, { where: { tenant_id: tenantId } });
}
```

#### 6. Database Writes

Two tables updated:

**ai_usage_logs:**
```sql
INSERT INTO ai_usage_logs (
  id, tenant_id, user_id, feature_type, action, prompt,
  model_used, tokens_used, cost_usd, status, response_data
) VALUES (
  'uuid-123', 'tenant-456', 'user-789', 'design', 'generate_design',
  'Modern Ramadan sale poster', 'gemini-2.0-flash-exp',
  1250, 0.000094, 'completed', '{ "layout": {...} }'
);
```

**ai_usage_limits:**
```sql
UPDATE ai_usage_limits
SET
  current_month_requests = current_month_requests + 1,
  current_month_tokens = current_month_tokens + 1250,
  current_month_cost_usd = current_month_cost_usd + 0.000094
WHERE tenant_id = 'tenant-456';
```

#### 7. Response to Frontend

```json
{
  "design": {
    "layout": {
      "structure": "Hero with centered content",
      "areas": [...]
    },
    "typography": {
      "headingFont": "Poppins Bold",
      "sizes": { "h1": 96, "h2": 64 }
    },
    "colors": {
      "primary": "#FFD700",
      "secondary": "#1A237E"
    },
    "elements": [...]
  },
  "tokensUsed": 1250,
  "cost": 0.000094
}
```

#### 8. UI Display

```javascript
// Frontend receives and displays
setResult({
  design: {...},
  tokensUsed: 1250,
  cost: 0.000094
});
```

**Total Time:** ~3-5 seconds

---

## Feature Breakdown

### Creative Intelligence

**Endpoints:**
- `POST /api/ai/creative/generate-design`
- `POST /api/ai/creative/generate-image`
- `POST /api/ai/creative/generate-svg`
- `POST /api/ai/creative/generate-background`
- `POST /api/ai/creative/optimize-design`
- `POST /api/ai/creative/resize-design`

**Functions:**
- `CreativeService.generateDesign()`
- `CreativeService.generateImage()`
- `CreativeService.generateSVGIcon()`
- `CreativeService.generateBackground()`
- `CreativeService.optimizeDesign()`
- `CreativeService.resizeDesign()`

**Token Usage:** 500-2000 tokens per request

---

### Copywriting Intelligence

**Endpoints:**
- `POST /api/ai/copy/generate-headline`
- `POST /api/ai/copy/generate-cta`
- `POST /api/ai/copy/generate-body`
- `POST /api/ai/copy/rewrite`
- `POST /api/ai/copy/translate`
- `POST /api/ai/copy/fit-to-screen`

**Functions:**
- `CopywritingService.generateHeadline()`
- `CopywritingService.generateCTA()`
- `CopywritingService.generateBody()`
- `CopywritingService.rewriteForAttention()`
- `CopywritingService.translateAndAdapt()`
- `CopywritingService.fitToScreenSize()`

**Token Usage:** 200-800 tokens per request

---

### Playlist Intelligence

**Endpoints:**
- `POST /api/ai/playlist/optimize`
- `POST /api/ai/playlist/recommend-schedule`
- `POST /api/ai/playlist/detect-fatigue`

**Functions:**
- `PlaylistService.optimizePlaylist()`
- `PlaylistService.recommendSchedule()`
- `PlaylistService.detectContentFatigue()`

**Token Usage:** 800-1500 tokens per request

---

### Diagnostics Intelligence

**Endpoints:**
- `POST /api/ai/diagnostics/analyze-screen`
- `POST /api/ai/diagnostics/suggest-action`

**Functions:**
- `DiagnosticsService.analyzeScreenHealth()`
- `DiagnosticsService.suggestRemoteAction()`

**Token Usage:** 500-1000 tokens per request

---

### Analytics Intelligence

**Endpoints:**
- `POST /api/ai/analytics/query`
- `POST /api/ai/analytics/interpret`
- `POST /api/ai/analytics/compare`

**Functions:**
- `AnalyticsService.naturalLanguageQuery()`
- `AnalyticsService.interpretResults()`
- `AnalyticsService.comparePerformance()`

**Token Usage:** 300-1000 tokens per request

---

### Usage Tracking

**Endpoints:**
- `GET /api/ai/usage/stats`

**Functions:**
- `UsageTracker.getUsageStats()`

**Token Usage:** None (database query only)

---

## Database Layer

### ai_usage_logs Table

**Purpose:** Audit trail of all AI requests and responses

**Schema:**
```sql
CREATE TABLE ai_usage_logs (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  user_id UUID REFERENCES users(id),
  feature_type ENUM('design', 'copywriting', 'playlist', 'diagnostics', 'analytics'),
  action VARCHAR(100),
  prompt TEXT,
  model_used VARCHAR(50),
  tokens_used INTEGER DEFAULT 0,
  cost_usd DECIMAL(10,6) DEFAULT 0.000000,
  status ENUM('pending', 'completed', 'failed', 'moderated'),
  response_data JSON,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tenant ON ai_usage_logs(tenant_id);
CREATE INDEX idx_user ON ai_usage_logs(user_id);
CREATE INDEX idx_feature ON ai_usage_logs(feature_type);
CREATE INDEX idx_created ON ai_usage_logs(created_at);
```

**Use Cases:**
- Compliance auditing
- Cost attribution by user/team
- Performance analysis
- Debugging failed requests
- Content moderation review

**Example Query:**
```sql
-- Get monthly spend by feature
SELECT
  feature_type,
  COUNT(*) as requests,
  SUM(tokens_used) as total_tokens,
  SUM(cost_usd) as total_cost
FROM ai_usage_logs
WHERE tenant_id = ?
  AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
  AND status = 'completed'
GROUP BY feature_type;
```

---

### ai_usage_limits Table

**Purpose:** Enforce and track monthly usage quotas

**Schema:**
```sql
CREATE TABLE ai_usage_limits (
  id UUID PRIMARY KEY,
  tenant_id UUID UNIQUE REFERENCES tenants(id),
  monthly_request_limit INTEGER DEFAULT 1000,
  monthly_token_limit INTEGER DEFAULT 1000000,
  monthly_cost_limit_usd DECIMAL(10,2) DEFAULT 50.00,
  current_month_requests INTEGER DEFAULT 0,
  current_month_tokens INTEGER DEFAULT 0,
  current_month_cost_usd DECIMAL(10,2) DEFAULT 0.00,
  last_reset_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_enabled BOOLEAN DEFAULT true,
  require_approval BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_tenant_limits ON ai_usage_limits(tenant_id);
```

**Default Limits:**
- Requests: 1,000 per month
- Tokens: 1,000,000 per month
- Cost: $50 per month

**Auto-Reset:** Beginning of each calendar month

**Fields Explained:**
- `monthly_request_limit` - Max API calls per month
- `monthly_token_limit` - Max tokens consumed per month
- `monthly_cost_limit_usd` - Max spending per month
- `current_month_requests` - Current usage counter
- `current_month_tokens` - Current token counter
- `current_month_cost_usd` - Current spend counter
- `last_reset_at` - When counters were last reset
- `is_enabled` - Feature toggle (disable AI for tenant)
- `require_approval` - Manual approval workflow flag

---

## Security & Rate Limiting

### Multi-Tenant Isolation

**Every request includes tenant filtering:**

```javascript
// User authenticated → JWT contains tenantId
const token = jwt.verify(authHeader, secret);
req.user = { id: token.id, tenantId: token.tenantId };

// All queries filtered by tenant
WHERE tenant_id = req.user.tenantId
```

**Benefits:**
- Data isolation
- Usage tracking per organization
- Separate quota management
- Security boundary enforcement

---

### Rate Limiting Flow

```
Request → Check Limits → Allow/Deny
                ↓
        ┌───────┴────────┐
        │                │
    Requests < Limit?  Tokens < Limit?  Cost < Limit?
        │                │                │
        └────────────────┴────────────────┘
                         │
                    All Pass? → Proceed
                    Any Fail? → Reject
```

**Enforcement Points:**
1. Before calling Gemini API
2. Before incrementing usage
3. On every request (real-time)

**Error Responses:**
```json
{
  "error": "Monthly request limit exceeded",
  "allowed": false
}
```

---

### Cost Calculation

**Gemini 2.0 Flash Pricing:**
- Input: $0.00001875 per token
- Output: $0.000075 per token

**Calculation:**
```javascript
costUsd = tokens * 0.000075
```

**Example:**
- 1,250 tokens = $0.000094
- 10,000 tokens = $0.00075
- 1,000,000 tokens = $75

**Why track both tokens and cost:**
- Tokens measure API usage
- Cost measures actual spend
- Different models have different pricing
- Provides flexibility for billing

---

### Authentication Flow

```
Frontend                    Backend                     Database
   │                           │                            │
   │ 1. Login                  │                            │
   ├──────────────────────────>│                            │
   │                           │ 2. Verify credentials      │
   │                           ├───────────────────────────>│
   │                           │<───────────────────────────┤
   │ 3. JWT Token              │                            │
   │<──────────────────────────┤                            │
   │                           │                            │
   │ 4. API Request + Token    │                            │
   ├──────────────────────────>│                            │
   │                           │ 5. Verify JWT              │
   │                           │ 6. Extract tenantId        │
   │                           │ 7. Check limits            │
   │                           ├───────────────────────────>│
   │                           │<───────────────────────────┤
   │                           │ 8. Process request         │
   │                           │ 9. Call Gemini             │
   │ 10. Response              │                            │
   │<──────────────────────────┤                            │
```

---

## Summary

### Key Technologies

1. **Frontend:** React, Fetch API
2. **Backend:** Node.js, Express
3. **AI:** Google Gemini 2.0 Flash
4. **Database:** PostgreSQL via Sequelize ORM
5. **Auth:** JWT tokens

### Architecture Principles

1. **Separation of Concerns**
   - Routes handle HTTP
   - Services handle business logic
   - GeminiService handles API calls
   - UsageTracker handles quotas

2. **Security by Default**
   - JWT authentication on all routes
   - Tenant isolation in all queries
   - Read-only SQL generation
   - Rate limiting enforced

3. **Observability**
   - Every request logged
   - Full audit trail
   - Usage metrics tracked
   - Cost attribution per tenant

4. **Developer Experience**
   - Clear service boundaries
   - Consistent response formats
   - Comprehensive error handling
   - Well-documented schemas

### Total Files in Integration

- **Frontend:** 2 files (AIFeatures.jsx, App.jsx)
- **Backend Routes:** 1 file (ai.js with 18 endpoints)
- **Backend Services:** 6 files (GeminiService, UsageTracker, 5 feature services)
- **Database Migrations:** 2 files
- **Documentation:** 4 files

### Total Functions

- **API Endpoints:** 18
- **Service Methods:** 27
- **Core Functions:** 8
- **Database Models:** 2

---

## Next Steps

1. **Add GEMINI_API_KEY** to `.env`
2. **Run migrations** to create database tables
3. **Test each feature** via UI
4. **Monitor usage** in real-time
5. **Adjust limits** per tenant as needed

For more information:
- [API Reference](GEMINI_AI.md)
- [UI Guide](AI_FEATURES_UI_GUIDE.md)
- [Migration Guide](GEMINI_MIGRATION.md)
