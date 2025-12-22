# AI Features UI Guide

## Overview

A comprehensive interface to explore and test all Gemini AI capabilities in SignCraft. Access it via the **AI Features** tab in the main navigation.

---

## How to Access

1. Start the frontend: `npm run dev`
2. Open your browser to `http://localhost:5173`
3. Click the **AI Features** button in the top navigation (with sparkle icon ✨)

---

## Interface Layout

The UI is split into two panels:

### Left Panel: Input & Controls
- Select different AI features via tabs
- Fill in prompts, settings, and parameters
- Click buttons to submit requests

### Right Panel: Results
- View real-time results from Gemini
- JSON output for all responses
- Copy button to save results
- Error messages if something fails

---

## Available Tabs

### 1. 🎨 Creative Intelligence

**What it does:** Generate complete designs, SVG icons, and backgrounds

**How to use:**
1. Enter a design prompt (e.g., "Modern Ramadan sale poster with gold and dark blue")
2. Select dimensions (1920x1080, 1080x1920, or 4K)
3. Choose a style (Modern, Minimalist, Bold, Elegant, Playful)
4. Click **Generate Complete Design**

**Additional Features:**
- **Generate SVG Icon** - Creates SVG code for icons
- **Generate Background** - Creates CSS background code

**Example Prompts:**
- Summer sale poster with bright colors
- Professional corporate presentation slide
- Restaurant menu board with food photos

**What you'll get:**
- Complete layout specification
- Typography recommendations
- Color scheme
- Element positioning
- Design recommendations

---

### 2. ✍️ Copywriting Intelligence

**What it does:** Generate headlines, CTAs, and body copy optimized for digital signage

**How to use:**
1. Enter context (e.g., "Grand opening sale for electronics store")
2. Select tone (Professional, Exciting, Friendly, Urgent, Playful)
3. Choose language (English, Malay, Chinese, Tamil)
4. Click **Generate Headlines**

**Additional Features:**
- **Generate CTAs** - Create call-to-action phrases
- **Generate Body Copy** - Create longer descriptive text

**Example Contexts:**
- Food delivery app promotion
- Fitness center membership drive
- Holiday shopping event

**What you'll get:**
- 5 headline options with strength ratings
- Character count for each
- Reasoning for recommendations
- Engagement predictions

---

### 3. 📋 Playlist Intelligence

**What it does:** Optimize playlist order, recommend schedules, detect content fatigue

**How to use:**
1. Enter screen location (e.g., "Mall entrance, Kuala Lumpur")
2. Select time of day (Weekday mornings, afternoons, etc.)
3. Choose audience type (General public, Commuters, Shoppers, etc.)
4. Click **Optimize Playlist**

**Additional Features:**
- **Recommend Schedule** - Get time-based scheduling recommendations
- **Detect Fatigue** - Identify overplayed content

**What you'll get:**
- Optimized content order
- Recommended duration per item
- Engagement score
- Performance insights
- Warning about potential issues

---

### 4. 🏥 Diagnostics Intelligence

**What it does:** Analyze screen health and suggest remote actions

**How to use:**
1. Enter screen ID (e.g., "screen-123")
2. Describe the issue (e.g., "Screen showing black screen but responding to heartbeat")
3. Click **Analyze Screen Health**

**Additional Features:**
- **Suggest Remote Actions** - Get step-by-step remediation

**What you'll get:**
- Health score (0-100)
- Identified issues with severity
- Suggested fixes
- Predictive warnings
- Preventative recommendations

---

### 5. 📊 Analytics Intelligence

**What it does:** Convert natural language questions to SQL queries and interpret results

**How to use:**
1. Enter a question in plain English (e.g., "Which screens had the lowest uptime last month?")
2. Click **Convert to SQL Query**

**Additional Features:**
- **Interpret Sample Results** - See how Gemini explains data
- **Compare Sample Campaigns** - Performance comparison analysis

**Example Questions:**
- Which screens had the most downtime?
- What are the top 10 most played media items?
- Show me screens in building A

**What you'll get:**
- SQL query (safe, read-only)
- Explanation of what the query does
- Expected result count
- Parameters needed

**⚠️ Important:** Always validate generated SQL before running on production!

---

### 6. 📈 Usage Stats

**What it does:** Display current AI usage limits and consumption

**How to use:**
1. Click **Get Usage Statistics**
2. View your current usage

**What you'll see:**
- Monthly request usage (used/limit/percentage)
- Token consumption statistics
- Current month costs in USD
- Usage percentage breakdowns

**Default Limits:**
- Requests: 1000 per month
- Tokens: 1M per month
- Cost: $50 per month

---

## Understanding Results

### Success Response Format

All successful responses include:
```json
{
  "data": { ... },           // The actual result
  "tokensUsed": 1250,        // Tokens consumed
  "cost": 0.000094           // Cost in USD
}
```

### Error Response Format

If something fails:
```json
{
  "error": "Error message here"
}
```

Common errors:
- "Gemini API not configured" - Need to add GEMINI_API_KEY to .env
- "Monthly request limit exceeded" - Usage limit reached
- "Monthly cost limit exceeded" - Budget limit reached
- Unauthorized - Need to log in

---

## Sample Workflows

### Workflow 1: Create a Complete Campaign

1. **Creative Tab:** Generate design for "Summer sale poster"
2. **Copywriting Tab:** Generate headlines for "Summer clearance event"
3. **Copywriting Tab:** Generate CTAs for urgency
4. **Playlist Tab:** Optimize playlist for "weekday afternoons, shoppers"
5. **Usage Tab:** Check remaining quota

### Workflow 2: Troubleshoot a Screen

1. **Diagnostics Tab:** Analyze screen with ID "screen-42"
2. **Diagnostics Tab:** Get suggested actions for the issue
3. **Analytics Tab:** Query "Show recent errors for screen-42"
4. **Analytics Tab:** Interpret the results

### Workflow 3: Optimize Content

1. **Playlist Tab:** Detect content fatigue
2. **Creative Tab:** Generate new designs for tired content
3. **Copywriting Tab:** Refresh copy with new headlines
4. **Playlist Tab:** Recommend new schedule

---

## Tips for Best Results

### 1. Be Specific in Prompts
❌ "Make something nice"
✅ "Create a modern Ramadan sale poster for a 55-inch vertical mall screen using gold and dark blue with geometric patterns"

### 2. Provide Context
Always include:
- Target audience
- Location/environment
- Purpose/goal
- Brand guidelines (if any)

### 3. Experiment with Styles
Try different:
- Tones (Professional vs Playful)
- Styles (Modern vs Minimalist)
- Languages (for localization)

### 4. Iterate
Use results as starting points:
1. Generate initial design
2. Optimize with feedback
3. Resize for different screens
4. Test with target audience

### 5. Monitor Usage
- Check usage stats regularly
- Set internal limits for cost control
- Review audit logs monthly

---

## Keyboard Shortcuts

- **Tab** - Navigate between input fields
- **Ctrl/Cmd + Enter** - Submit (when in textarea)
- **Ctrl/Cmd + C** - Copy result (when focused)

---

## Cost Tracking

Every request shows:
- **tokensUsed**: Number of tokens consumed
- **cost**: Actual cost in USD

Typical costs:
- Generate Design: ~$0.0001
- Generate Headlines: ~$0.00005
- Optimize Playlist: ~$0.00015
- Analyze Screen: ~$0.0001

**Pro tip:** Check Usage Stats tab to see monthly totals

---

## Troubleshooting

### "Gemini API not configured"
**Solution:**
```bash
cd server
echo "GEMINI_API_KEY=your_key_here" >> .env
```

### Results are empty or incomplete
**Causes:**
- Prompt too vague
- Context missing
- API timeout

**Solution:**
- Be more specific in prompts
- Add more context
- Try again with simpler request

### "Unauthorized" or "Token invalid"
**Solution:**
- Log in to the system first
- Check if JWT token is valid
- Refresh the page

### Slow responses
**Normal behavior:**
- Design generation: 3-5 seconds
- Playlist optimization: 2-4 seconds
- Analytics queries: 1-3 seconds

Complex requests may take longer.

---

## Advanced Features

### Copy Results
Click the **Copy** button to save JSON results to clipboard for:
- Documentation
- Bug reports
- Sharing with team
- Integration testing

### Compare Outputs
1. Generate multiple versions
2. Copy each result
3. Compare side-by-side
4. Choose best option

### Chain Requests
Use output from one request as input for another:
1. Generate design → Get layout JSON
2. Use layout in optimization request
3. Optimize → Get recommendations
4. Apply to new design

---

## Safety Features

### 1. Rate Limiting
- Per-tenant limits enforced
- Monthly reset automatic
- Graceful error messages

### 2. Cost Controls
- Real-time cost calculation
- Monthly spending caps
- Usage warnings at 80% and 90%

### 3. Audit Logging
- Every request logged
- Full prompt + response storage
- Accessible in backend database

### 4. Approval Workflow
(If enabled by admin)
- AI content requires approval
- Pending status until reviewed
- Tracked by approver ID

---

## Integration with Other Features

### Design Studio
- Use AI Features to generate concepts
- Import layouts into Design Studio
- Apply AI-generated colors/typography

### Screen Monitor
- Use Diagnostics tab for troubled screens
- Analyze patterns from heartbeat logs
- Get automated remediation steps

### Analytics
- Query screen performance
- Interpret usage data
- Compare campaign effectiveness

---

## Next Steps

After exploring the UI:

1. **Get API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Add to server `.env` file

2. **Run Migrations**
   ```bash
   cd server
   npm run db:migrate
   ```

3. **Test Each Feature**
   - Try all 6 tabs
   - Experiment with different prompts
   - Check usage statistics

4. **Read Full Documentation**
   - See [GEMINI_AI.md](GEMINI_AI.md) for complete API reference
   - See [GEMINI_MIGRATION.md](GEMINI_MIGRATION.md) for implementation details

---

## Support

For questions or issues:

- **Setup Help**: See [SETUP.md](SETUP.md)
- **API Reference**: See [GEMINI_AI.md](GEMINI_AI.md)
- **Database Schema**: See [DATABASE.md](DATABASE.md)

---

**Powered by Google Gemini 2.0 Flash**
