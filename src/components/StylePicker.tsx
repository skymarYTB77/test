import React from 'react';
import { folderStyles } from '../lib/folderStyles';

interface StylePickerProps {
  currentStyleId: string;
  folderColor: string;
  onStyleSelect: (styleId: string) => void;
}

export function StylePicker({ currentStyleId, folderColor, onStyleSelect }: StylePickerProps) {
  const renderPreview = (styleId: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.scale(0.25, 0.25);
      const style = folderStyles.find(s => s.id === styleId);
      if (style) {
        style.render(ctx, folderColor);
      }
    }
    
    return canvas.toDataURL();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Choisir un style</h2>
          <button
            onClick={() => onStyleSelect(currentStyleId)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {folderStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => onStyleSelect(style.id)}
              className={`relative p-4 rounded-lg transition-all ${
                currentStyleId === style.id
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
            >
              <img
                src={renderPreview(style.id)}
                alt={style.name}
                className="w-full h-auto mb-2"
              />
              <span className="block text-center text-sm font-medium">
                {style.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}