"use client";

import {
  Palette,
  Brush,
  Eraser,
  Type,
  Square,
  Circle,
  Minus,
  Undo2,
  Redo2,
  ImageIcon,
  Download,
  Trash2,
  Keyboard,
  Lightbulb,
} from "lucide-react";

const tools = [
  { id: "brush", name: "Brush", icon: Brush, shortcut: "B" },
  { id: "eraser", name: "Eraser", icon: Eraser, shortcut: "E" },
  { id: "text", name: "Text", icon: Type, shortcut: "T" },
  { id: "rectangle", name: "Rectangle", icon: Square, shortcut: "R" },
  { id: "circle", name: "Circle", icon: Circle, shortcut: "C" },
  { id: "line", name: "Line", icon: Minus, shortcut: "L" },
];

export default function Sidebar({
  currentTool,
  setCurrentTool,
  color,
  setColor,
  brushSize,
  setBrushSize,
  fontSize,
  setFontSize,
  historyStep,
  historyLength,
  onUndo,
  onRedo,
  onImageUpload,
  onDownload,
  onClearCanvas,
  images,
  fileInputRef,
}) {
  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-xl">
      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        {/* Header */}
        <div className="text-center border-b border-gray-200 pb-4">
          <div className="flex justify-center mb-2">
            <Palette className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Drawing Tools
          </h1>
          <p className="text-sm text-gray-600">Advanced whiteboard features</p>
        </div>

        {/* Scroll Hint */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-2 text-blue-600 text-sm font-medium mb-1">
            <Lightbulb className="w-4 h-4" />
            Pro Tip
          </div>
          <div className="text-blue-700 text-xs">
            Scroll down to see all available tools, options, and keyboard
            shortcuts!
          </div>
        </div>

        {/* Tools */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Brush className="w-5 h-5" />
            Tools
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {tools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => setCurrentTool(tool.id)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                    currentTool === tool.id
                      ? "bg-blue-500 text-white shadow-md transform scale-105"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                  title={`${tool.name} (${tool.shortcut})`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="text-xs">{tool.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Picker */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Color
          </h3>
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-16 h-16 rounded-xl border-2 border-gray-300 cursor-pointer shadow-md hover:shadow-lg transition-shadow"
            />
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">Current Color</div>
              <div className="text-lg font-mono font-bold text-gray-800">
                {color.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Brush Size */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Circle className="w-5 h-5" />
            Size: {brushSize}px
          </h3>
          <input
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(Number.parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>1px</span>
            <span>50px</span>
          </div>
        </div>

        {/* Font Size (for text tool) */}
        {currentTool === "text" && (
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Type className="w-5 h-5" />
              Font Size: {fontSize}px
            </h3>
            <input
              type="range"
              min="12"
              max="72"
              value={fontSize}
              onChange={(e) => setFontSize(Number.parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>12px</span>
              <span>72px</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onUndo}
              disabled={historyStep <= 0}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all shadow-sm ${
                historyStep <= 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white text-green-600 border-2 border-green-200 hover:bg-green-50 hover:border-green-300 hover:scale-105"
              }`}
            >
              <Undo2 className="w-4 h-4" />
              Undo
            </button>
            <button
              onClick={onRedo}
              disabled={historyStep >= historyLength - 1}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all shadow-sm ${
                historyStep >= historyLength - 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white text-green-600 border-2 border-green-200 hover:bg-green-50 hover:border-green-300 hover:scale-105"
              }`}
            >
              <Redo2 className="w-4 h-4" />
              Redo
            </button>
          </div>

          <div className="h-px bg-gray-200"></div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
          />

          <button
            onClick={onImageUpload}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white text-purple-600 border-2 border-purple-200 rounded-lg font-medium hover:bg-purple-50 hover:border-purple-300 hover:scale-105 transition-all shadow-sm"
          >
            <ImageIcon className="w-5 h-5" />
            Import Image
          </button>

          <button
            onClick={onDownload}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white text-blue-600 border-2 border-blue-200 rounded-lg font-medium hover:bg-blue-50 hover:border-blue-300 hover:scale-105 transition-all shadow-sm"
          >
            <Download className="w-5 h-5" />
            Download PNG
          </button>

          <button
            onClick={onClearCanvas}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white text-red-600 border-2 border-red-200 rounded-lg font-medium hover:bg-red-50 hover:border-red-300 hover:scale-105 transition-all shadow-sm"
          >
            <Trash2 className="w-5 h-5" />
            Clear Canvas
          </button>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Shortcuts
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Undo</span>
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono shadow-sm">
                Ctrl+Z
              </kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Redo</span>
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono shadow-sm">
                Ctrl+Y
              </kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Brush Tool</span>
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono shadow-sm">
                B
              </kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Eraser Tool</span>
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono shadow-sm">
                E
              </kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Text Tool</span>
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono shadow-sm">
                T
              </kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Rectangle</span>
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono shadow-sm">
                R
              </kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Circle</span>
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono shadow-sm">
                C
              </kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Line</span>
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono shadow-sm">
                L
              </kbd>
            </div>
          </div>
        </div>

        {/* Image Info */}
        {images.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Images ({images.length})
            </h3>
            <div className="text-sm text-gray-600">
              <p className="mb-2">
                Images are automatically synced with all users!
              </p>
              <p className="text-xs">
                Tip: Images are positioned in the center when uploaded and
                included in downloads.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
