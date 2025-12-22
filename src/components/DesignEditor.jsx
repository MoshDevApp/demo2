/**
 * SignCraft Design Editor Component
 * Canvas-based design editor with AI-powered assistance using Fabric.js
 */

import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import {
  Wand2,
  Type,
  Square,
  Circle,
  Download,
  Save,
  Trash2,
  ZoomIn,
  ZoomOut,
  Layers
} from 'lucide-react';

export default function DesignEditor({ width = 1920, height = 1080, onSave }) {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiStyle, setAiStyle] = useState('professional');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (canvasRef.current && !canvas) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: width,
        height: height,
        backgroundColor: '#ffffff'
      });

      fabricCanvas.on('selection:created', (e) => {
        setSelectedObject(e.selected?.[0] || null);
      });

      fabricCanvas.on('selection:updated', (e) => {
        setSelectedObject(e.selected?.[0] || null);
      });

      fabricCanvas.on('selection:cleared', () => {
        setSelectedObject(null);
      });

      setCanvas(fabricCanvas);
    }

    return () => {
      canvas?.dispose();
    };
  }, []);

  const addText = () => {
    if (!canvas) return;

    const text = new fabric.IText('Click to edit', {
      left: 100,
      top: 100,
      fontSize: 48,
      fontFamily: 'Arial',
      fill: '#000000'
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  const addRectangle = () => {
    if (!canvas) return;

    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 200,
      height: 150,
      fill: '#3b82f6',
      stroke: '#1e40af',
      strokeWidth: 2
    });

    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
  };

  const addCircle = () => {
    if (!canvas) return;

    const circle = new fabric.Circle({
      left: 100,
      top: 100,
      radius: 75,
      fill: '#10b981',
      stroke: '#059669',
      strokeWidth: 2
    });

    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.renderAll();
  };

  const deleteSelected = () => {
    if (!canvas || !selectedObject) return;

    canvas.remove(selectedObject);
    canvas.renderAll();
    setSelectedObject(null);
  };

  const zoomIn = () => {
    if (!canvas) return;
    const zoom = canvas.getZoom();
    canvas.setZoom(zoom * 1.1);
  };

  const zoomOut = () => {
    if (!canvas) return;
    const zoom = canvas.getZoom();
    canvas.setZoom(zoom * 0.9);
  };

  const generateAIImage = async () => {
    if (!aiPrompt.trim()) {
      alert('Please enter a prompt');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('http://localhost:3001/api/ai/creative/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          style: aiStyle,
          aspectRatio: '16:9'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate image');
      }

      const data = await response.json();

      alert(`Image description generated:\n\n${data.image.description}\n\n${data.note}`);
      console.log('Generated image concept:', data);

      setShowAIPanel(false);
      setAiPrompt('');
    } catch (error) {
      console.error('Error generating image:', error);
      alert(error.message || 'Failed to generate image. Gemini requires Imagen API integration for actual image generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateLayoutSuggestion = async () => {
    if (!aiPrompt.trim()) {
      alert('Please enter a design description');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('http://localhost:3001/api/ai/creative/generate-design', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          dimensions: `${width}x${height}`,
          orientation: width > height ? 'landscape' : 'portrait',
          style: aiStyle,
          purpose: 'digital signage'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate design');
      }

      const data = await response.json();
      console.log('Design generated:', data);
      alert('Design layout generated! Check console for complete specification.');

      setShowAIPanel(false);
      setAiPrompt('');
    } catch (error) {
      console.error('Error generating design:', error);
      alert(error.message || 'Failed to generate design layout');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCopywriting = async () => {
    if (!aiPrompt.trim()) {
      alert('Please describe what you need');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('http://localhost:3001/api/ai/copy/generate-headline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          context: aiPrompt,
          tone: aiStyle,
          maxLength: 50,
          language: 'en',
          count: 5
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate headlines');
      }

      const data = await response.json();

      if (data.headlines && data.headlines.length > 0) {
        console.log('Generated headlines:', data.headlines);
        const headlineList = data.headlines.map((h, i) => `${i+1}. ${h.text}`).join('\n');
        alert(`Generated Headlines:\n\n${headlineList}`);
      }

      setShowAIPanel(false);
      setAiPrompt('');
    } catch (error) {
      console.error('Error generating headlines:', error);
      alert(error.message || 'Failed to generate headlines');
    } finally {
      setIsGenerating(false);
    }
  };

  const exportDesign = () => {
    if (!canvas) return;

    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1
    });

    const link = document.createElement('a');
    link.download = `signcraft-design-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
  };

  const saveDesign = () => {
    if (!canvas) return;

    const json = canvas.toJSON();

    if (onSave) {
      onSave(json);
    } else {
      console.log('Design saved:', json);
      alert('Design saved! (Check console for JSON data)');
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      <div className="w-64 bg-gray-800 p-4 flex flex-col gap-4">
        <h2 className="text-white text-lg font-semibold mb-2">SignCraft Studio</h2>

        <button
          onClick={() => setShowAIPanel(!showAIPanel)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          <Wand2 size={18} />
          AI Assistant
        </button>

        <div className="border-t border-gray-700 pt-4">
          <p className="text-gray-400 text-sm mb-2">Elements</p>

          <button
            onClick={addText}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors w-full mb-2"
          >
            <Type size={18} />
            Text
          </button>

          <button
            onClick={addRectangle}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors w-full mb-2"
          >
            <Square size={18} />
            Rectangle
          </button>

          <button
            onClick={addCircle}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors w-full mb-2"
          >
            <Circle size={18} />
            Circle
          </button>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <p className="text-gray-400 text-sm mb-2">Actions</p>

          <button
            onClick={zoomIn}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors w-full mb-2"
          >
            <ZoomIn size={18} />
            Zoom In
          </button>

          <button
            onClick={zoomOut}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors w-full mb-2"
          >
            <ZoomOut size={18} />
            Zoom Out
          </button>

          {selectedObject && (
            <button
              onClick={deleteSelected}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors w-full mb-2"
            >
              <Trash2 size={18} />
              Delete
            </button>
          )}
        </div>

        <div className="border-t border-gray-700 pt-4 mt-auto">
          <button
            onClick={saveDesign}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full mb-2"
          >
            <Save size={18} />
            Save
          </button>

          <button
            onClick={exportDesign}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full"
          >
            <Download size={18} />
            Export PNG
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-gray-900 p-8 overflow-auto">
        <div className="bg-white shadow-2xl">
          <canvas ref={canvasRef} />
        </div>
      </div>

      {showAIPanel && (
        <div className="w-80 bg-gray-800 p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white text-lg font-semibold">AI Assistant</h3>
            <button
              onClick={() => setShowAIPanel(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div>
            <label className="text-gray-300 text-sm block mb-2">
              Describe what you want
            </label>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g., A professional office lobby with modern furniture"
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg resize-none"
              rows={4}
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm block mb-2">Style</label>
            <select
              value={aiStyle}
              onChange={(e) => setAiStyle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
            >
              <option value="professional">Professional</option>
              <option value="modern">Modern</option>
              <option value="minimalist">Minimalist</option>
              <option value="vibrant">Vibrant</option>
              <option value="elegant">Elegant</option>
            </select>
          </div>

          <button
            onClick={generateAIImage}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Wand2 size={18} />
            {isGenerating ? 'Generating...' : 'Generate Image'}
          </button>

          <button
            onClick={generateLayoutSuggestion}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Layers size={18} />
            {isGenerating ? 'Generating...' : 'Suggest Layout'}
          </button>

          <button
            onClick={generateCopywriting}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Type size={18} />
            {isGenerating ? 'Generating...' : 'Generate Headlines'}
          </button>

          <div className="bg-gray-700 p-3 rounded-lg mt-4">
            <p className="text-gray-300 text-xs">
              Powered by Google Gemini 2.0. All AI features require GEMINI_API_KEY in backend .env file.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
