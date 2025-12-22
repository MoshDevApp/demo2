import { useState } from 'react';
import DesignEditor from './components/DesignEditor';
import ScreenMonitor from './components/ScreenMonitor';
import AIFeatures from './components/AIFeatures';
import { Palette, Monitor, Sparkles } from 'lucide-react';

function App() {
  const [activeView, setActiveView] = useState('monitor');

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <h1 className="text-2xl font-bold text-white">SignCraft</h1>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveView('monitor')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeView === 'monitor'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Monitor size={20} />
              Screen Monitor
            </button>

            <button
              onClick={() => setActiveView('editor')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeView === 'editor'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Palette size={20} />
              Design Studio
            </button>

            <button
              onClick={() => setActiveView('ai')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeView === 'ai'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Sparkles size={20} />
              AI Features
            </button>
          </div>
        </div>
      </nav>

      {activeView === 'monitor' && <ScreenMonitor />}
      {activeView === 'editor' && <DesignEditor />}
      {activeView === 'ai' && <AIFeatures />}
    </div>
  );
}

export default App;
