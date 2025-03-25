import React, { useState, useRef, useEffect } from 'react';
import { Eraser, Trash2 } from 'lucide-react';

interface DrawToolProps {
  onDrawingChange: (dataUrl: string) => void;
}

export function DrawTool({ onDrawingChange }: DrawToolProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);

    ctx.strokeStyle = isEraser ? 'transparent' : color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onDrawingChange(canvas.toDataURL());
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onDrawingChange('');
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-medium text-white mb-4">Outil de dessin</h3>
      
      <div className="flex items-center gap-4 mb-4">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer"
        />
        <button
          onClick={() => setIsEraser(!isEraser)}
          className={`p-2 rounded ${
            isEraser ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'
          }`}
        >
          <Eraser size={20} />
        </button>
        <button
          onClick={clearCanvas}
          className="p-2 rounded bg-gray-700 text-gray-300 hover:bg-gray-600"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Taille du pinceau
        </label>
        <input
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <canvas
        ref={canvasRef}
        width={400}
        height={300}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="border border-gray-600 rounded bg-transparent cursor-crosshair"
      />
    </div>
  );
}