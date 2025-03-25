import React, { useState } from 'react';
import { Square, Circle, Triangle } from 'lucide-react';

interface Shape {
  type: 'rectangle' | 'circle' | 'triangle';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

interface ShapeToolProps {
  onShapeAdd: (shape: Shape) => void;
}

export function ShapeTool({ onShapeAdd }: ShapeToolProps) {
  const [selectedShape, setSelectedShape] = useState<Shape['type']>('rectangle');
  const [color, setColor] = useState('#ffffff');
  const [size, setSize] = useState(50);

  const addShape = () => {
    onShapeAdd({
      type: selectedShape,
      x: 0,
      y: 0,
      width: size,
      height: size,
      color
    });
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-medium text-white mb-4">Formes</h3>
      
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setSelectedShape('rectangle')}
          className={`p-4 rounded flex items-center justify-center ${
            selectedShape === 'rectangle' ? 'bg-indigo-600' : 'bg-gray-700'
          }`}
        >
          <Square size={24} />
        </button>
        <button
          onClick={() => setSelectedShape('circle')}
          className={`p-4 rounded flex items-center justify-center ${
            selectedShape === 'circle' ? 'bg-indigo-600' : 'bg-gray-700'
          }`}
        >
          <Circle size={24} />
        </button>
        <button
          onClick={() => setSelectedShape('triangle')}
          className={`p-4 rounded flex items-center justify-center ${
            selectedShape === 'triangle' ? 'bg-indigo-600' : 'bg-gray-700'
          }`}
        >
          <Triangle size={24} />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Couleur
        </label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-full h-10 rounded cursor-pointer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Taille
        </label>
        <input
          type="range"
          min="20"
          max="200"
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <button
        onClick={addShape}
        className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
      >
        Ajouter la forme
      </button>
    </div>
  );
}