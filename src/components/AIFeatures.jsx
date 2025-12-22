import { useState } from 'react';
import {
  Sparkles,
  Type,
  ListOrdered,
  Activity,
  BarChart3,
  Info,
  Loader2,
  Copy,
  CheckCircle
} from 'lucide-react';

export default function AIFeatures() {
  const [activeTab, setActiveTab] = useState('creative');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const tabs = [
    { id: 'creative', label: 'Creative', icon: Sparkles },
    { id: 'copywriting', label: 'Copywriting', icon: Type },
    { id: 'playlist', label: 'Playlist', icon: ListOrdered },
    { id: 'diagnostics', label: 'Diagnostics', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'usage', label: 'Usage Stats', icon: Info }
  ];

  const makeRequest = async (endpoint, body) => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`http://localhost:3001/api/ai/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getUsageStats = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:3001/api/ai/usage/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Sparkles className="text-blue-400" size={36} />
            Gemini AI Features
          </h1>
          <p className="text-gray-400">
            Explore all AI-powered capabilities for digital signage
          </p>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setResult(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">
              {tabs.find(t => t.id === activeTab)?.label} Tools
            </h2>

            {activeTab === 'creative' && <CreativeTools onSubmit={makeRequest} loading={loading} />}
            {activeTab === 'copywriting' && <CopywritingTools onSubmit={makeRequest} loading={loading} />}
            {activeTab === 'playlist' && <PlaylistTools onSubmit={makeRequest} loading={loading} />}
            {activeTab === 'diagnostics' && <DiagnosticsTools onSubmit={makeRequest} loading={loading} />}
            {activeTab === 'analytics' && <AnalyticsTools onSubmit={makeRequest} loading={loading} />}
            {activeTab === 'usage' && <UsageTools onSubmit={getUsageStats} loading={loading} />}
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Result</h2>
              {result && !result.error && (
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-1 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all text-sm"
                >
                  {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>

            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-blue-400" size={48} />
              </div>
            )}

            {!loading && !result && (
              <div className="text-gray-500 text-center py-12">
                Select a tool and submit to see results
              </div>
            )}

            {!loading && result && (
              <div className="bg-gray-900 rounded-lg p-4 max-h-[600px] overflow-auto">
                {result.error ? (
                  <div className="text-red-400">
                    <p className="font-bold mb-2">Error:</p>
                    <p>{result.error}</p>
                  </div>
                ) : (
                  <pre className="text-gray-300 text-sm whitespace-pre-wrap">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CreativeTools({ onSubmit, loading }) {
  const [prompt, setPrompt] = useState('');
  const [dimensions, setDimensions] = useState('1920x1080');
  const [style, setStyle] = useState('modern');

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-gray-300 mb-2 text-sm">Design Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Modern Ramadan sale poster with gold and dark blue"
          className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none min-h-[100px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-300 mb-2 text-sm">Dimensions</label>
          <select
            value={dimensions}
            onChange={(e) => setDimensions(e.target.value)}
            className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="1920x1080">1920x1080 (Landscape)</option>
            <option value="1080x1920">1080x1920 (Portrait)</option>
            <option value="3840x2160">3840x2160 (4K)</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-300 mb-2 text-sm">Style</label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="modern">Modern</option>
            <option value="minimalist">Minimalist</option>
            <option value="bold">Bold</option>
            <option value="elegant">Elegant</option>
            <option value="playful">Playful</option>
          </select>
        </div>
      </div>

      <button
        onClick={() => onSubmit('creative/generate-design', {
          prompt,
          dimensions,
          style,
          purpose: 'digital signage'
        })}
        disabled={loading || !prompt}
        className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {loading ? 'Generating...' : 'Generate Complete Design'}
      </button>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onSubmit('creative/generate-svg', {
            description: prompt || 'shopping cart icon',
            size: '24',
            style: 'outline'
          })}
          disabled={loading}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50 text-sm"
        >
          Generate SVG Icon
        </button>

        <button
          onClick={() => onSubmit('creative/generate-background', {
            theme: prompt || 'modern gradient',
            dimensions,
            style: 'gradient'
          })}
          disabled={loading}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50 text-sm"
        >
          Generate Background
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg p-3 text-xs text-gray-400">
        <p className="font-bold mb-1">Try these prompts:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Summer sale poster with bright colors</li>
          <li>Professional corporate presentation slide</li>
          <li>Restaurant menu board with food photos</li>
        </ul>
      </div>
    </div>
  );
}

function CopywritingTools({ onSubmit, loading }) {
  const [context, setContext] = useState('');
  const [tone, setTone] = useState('professional');
  const [language, setLanguage] = useState('en');

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-gray-300 mb-2 text-sm">Context / Description</label>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="e.g., Grand opening sale for electronics store"
          className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none min-h-[100px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-300 mb-2 text-sm">Tone</label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="professional">Professional</option>
            <option value="exciting">Exciting</option>
            <option value="friendly">Friendly</option>
            <option value="urgent">Urgent</option>
            <option value="playful">Playful</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-300 mb-2 text-sm">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="en">English</option>
            <option value="ms">Malay</option>
            <option value="zh">Chinese</option>
            <option value="ta">Tamil</option>
          </select>
        </div>
      </div>

      <button
        onClick={() => onSubmit('copy/generate-headline', {
          context,
          tone,
          language,
          maxLength: 50,
          count: 5
        })}
        disabled={loading || !context}
        className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {loading ? 'Generating...' : 'Generate Headlines'}
      </button>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onSubmit('copy/generate-cta', {
            context,
            actionType: 'visit',
            urgency: 'medium',
            language,
            count: 5
          })}
          disabled={loading || !context}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50 text-sm"
        >
          Generate CTAs
        </button>

        <button
          onClick={() => onSubmit('copy/generate-body', {
            topic: context,
            length: 'short',
            tone,
            language,
            keyPoints: []
          })}
          disabled={loading || !context}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50 text-sm"
        >
          Generate Body Copy
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg p-3 text-xs text-gray-400">
        <p className="font-bold mb-1">Try these contexts:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Food delivery app promotion</li>
          <li>Fitness center membership drive</li>
          <li>Holiday shopping event</li>
        </ul>
      </div>
    </div>
  );
}

function PlaylistTools({ onSubmit, loading }) {
  const [location, setLocation] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('weekday mornings');
  const [audienceType, setAudienceType] = useState('general public');

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-gray-300 mb-2 text-sm">Screen Location</label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., Mall entrance, Kuala Lumpur"
          className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-300 mb-2 text-sm">Time of Day</label>
          <select
            value={timeOfDay}
            onChange={(e) => setTimeOfDay(e.target.value)}
            className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="weekday mornings">Weekday Mornings</option>
            <option value="weekday afternoons">Weekday Afternoons</option>
            <option value="weekday evenings">Weekday Evenings</option>
            <option value="weekend">Weekend</option>
            <option value="peak hours">Peak Hours</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-300 mb-2 text-sm">Audience Type</label>
          <select
            value={audienceType}
            onChange={(e) => setAudienceType(e.target.value)}
            className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="general public">General Public</option>
            <option value="commuters">Commuters</option>
            <option value="shoppers">Shoppers</option>
            <option value="professionals">Professionals</option>
            <option value="students">Students</option>
          </select>
        </div>
      </div>

      <button
        onClick={() => onSubmit('playlist/optimize', {
          playlist: {
            name: 'Sample Playlist',
            items: [
              { id: '1', name: 'Promo Video', duration: 15 },
              { id: '2', name: 'Brand Message', duration: 10 },
              { id: '3', name: 'Special Offer', duration: 12 }
            ]
          },
          context: 'maximize engagement',
          screenLocation: location || 'mall entrance',
          timeOfDay,
          audienceType,
          screenType: 'vertical 55-inch'
        })}
        disabled={loading}
        className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {loading ? 'Analyzing...' : 'Optimize Playlist'}
      </button>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onSubmit('playlist/recommend-schedule', {
            playlistIds: ['breakfast', 'lunch', 'dinner'],
            context: 'restaurant promotion',
            timezone: 'Asia/Kuala_Lumpur',
            businessHours: '6 AM - 11 PM',
            holidays: [],
            specialEvents: []
          })}
          disabled={loading}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50 text-sm"
        >
          Recommend Schedule
        </button>

        <button
          onClick={() => onSubmit('playlist/detect-fatigue', {
            playbackLogs: [
              { itemId: '1', playCount: 150, lastPlayed: '2024-12-19' },
              { itemId: '2', playCount: 95, lastPlayed: '2024-12-18' },
              { itemId: '3', playCount: 200, lastPlayed: '2024-12-19' }
            ]
          })}
          disabled={loading}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50 text-sm"
        >
          Detect Fatigue
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg p-3 text-xs text-gray-400">
        <p className="font-bold mb-1">What this does:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Optimizes content order for maximum impact</li>
          <li>Recommends ideal durations</li>
          <li>Detects overplayed content</li>
        </ul>
      </div>
    </div>
  );
}

function DiagnosticsTools({ onSubmit, loading }) {
  const [screenId, setScreenId] = useState('');
  const [issue, setIssue] = useState('');

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-gray-300 mb-2 text-sm">Screen ID</label>
        <input
          value={screenId}
          onChange={(e) => setScreenId(e.target.value)}
          placeholder="e.g., screen-123"
          className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-gray-300 mb-2 text-sm">Issue Description</label>
        <textarea
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
          placeholder="e.g., Screen showing black screen but responding to heartbeat"
          className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none min-h-[100px]"
        />
      </div>

      <button
        onClick={() => onSubmit('diagnostics/analyze-screen', {
          screenData: {
            id: screenId || 'screen-sample',
            lastHeartbeat: new Date().toISOString(),
            status: 'online',
            uptime: 98.2
          },
          logs: [
            { timestamp: '2024-12-19T10:30:00Z', event: 'heartbeat', status: 'ok' },
            { timestamp: '2024-12-19T02:15:00Z', event: 'reconnect', status: 'warning' },
            { timestamp: '2024-12-19T02:45:00Z', event: 'reconnect', status: 'warning' }
          ]
        })}
        disabled={loading}
        className="w-full px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {loading ? 'Analyzing...' : 'Analyze Screen Health'}
      </button>

      <button
        onClick={() => onSubmit('diagnostics/suggest-action', {
          screenId: screenId || 'screen-sample',
          issue: issue || 'Screen not displaying content'
        })}
        disabled={loading || !issue}
        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50"
      >
        Suggest Remote Actions
      </button>

      <div className="bg-gray-900 rounded-lg p-3 text-xs text-gray-400">
        <p className="font-bold mb-1">Diagnostic capabilities:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Pattern analysis from logs</li>
          <li>Predictive failure detection</li>
          <li>Safe remediation suggestions</li>
        </ul>
      </div>
    </div>
  );
}

function AnalyticsTools({ onSubmit, loading }) {
  const [question, setQuestion] = useState('');

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-gray-300 mb-2 text-sm">Natural Language Query</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g., Which screens had the lowest uptime last month?"
          className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none min-h-[100px]"
        />
      </div>

      <button
        onClick={() => onSubmit('analytics/query', {
          question: question || 'Which screens had the lowest uptime last month?',
          databaseSchema: {
            screens: ['id', 'name', 'status', 'uptime_percentage', 'tenant_id'],
            playlists: ['id', 'name', 'tenant_id'],
            media: ['id', 'title', 'type', 'tenant_id']
          }
        })}
        disabled={loading || !question}
        className="w-full px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {loading ? 'Processing...' : 'Convert to SQL Query'}
      </button>

      <button
        onClick={() => onSubmit('analytics/interpret', {
          queryResults: [
            { screen_id: '1', name: 'Screen A', uptime: 95.5 },
            { screen_id: '2', name: 'Screen B', uptime: 89.2 },
            { screen_id: '3', name: 'Screen C', uptime: 92.8 }
          ],
          context: 'screen uptime analysis'
        })}
        disabled={loading}
        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50"
      >
        Interpret Sample Results
      </button>

      <button
        onClick={() => onSubmit('analytics/compare', {
          dataA: { campaign: 'Summer Sale', engagement: 1250, clicks: 450 },
          dataB: { campaign: 'Winter Sale', engagement: 980, clicks: 320 },
          comparisonContext: 'campaign performance'
        })}
        disabled={loading}
        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50"
      >
          Compare Sample Campaigns
        </button>

      <div className="bg-gray-900 rounded-lg p-3 text-xs text-gray-400">
        <p className="font-bold mb-1">Try these questions:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Which screens had the most downtime?</li>
          <li>What are the top 10 most played media items?</li>
          <li>Show me screens in building A</li>
        </ul>
      </div>
    </div>
  );
}

function UsageTools({ onSubmit, loading }) {
  return (
    <div className="space-y-4">
      <div className="bg-gray-900 rounded-lg p-4">
        <h3 className="text-white font-bold mb-2">Usage Statistics</h3>
        <p className="text-gray-400 text-sm">
          View your current AI usage limits, requests, tokens, and costs for the current month.
        </p>
      </div>

      <button
        onClick={onSubmit}
        disabled={loading}
        className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {loading ? 'Loading...' : 'Get Usage Statistics'}
      </button>

      <div className="bg-gray-900 rounded-lg p-3 text-xs text-gray-400">
        <p className="font-bold mb-1">What you'll see:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Monthly request usage and limits</li>
          <li>Token consumption statistics</li>
          <li>Current month costs</li>
          <li>Usage percentage breakdowns</li>
        </ul>
      </div>

      <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3 text-xs text-yellow-200">
        <p className="font-bold mb-1">Default Limits:</p>
        <ul className="space-y-1">
          <li>Requests: 1000 per month</li>
          <li>Tokens: 1M per month</li>
          <li>Cost: $50 per month</li>
        </ul>
      </div>
    </div>
  );
}
