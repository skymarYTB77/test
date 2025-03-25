import React from 'react';
import { defaultFolderStyles } from '../lib/folderStyles';
import { FolderStyle } from '../types/folder';

interface FolderStylePickerProps {
  currentStyle: string;
  folderColor: string;
  onStyleSelect: (style: FolderStyle) => void;
}

export function FolderStylePicker({ currentStyle, folderColor, onStyleSelect }: FolderStylePickerProps) {
  const renderPreview = (style: FolderStyle) => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.scale(0.25, 0.25);
      style.render(ctx, folderColor);
    }
    
    return canvas.toDataURL();
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
      {defaultFolderStyles.map((style) => (
        <button
          key={style.id}
          onClick={() => onStyleSelect(style)}
          className={`relative p-2 rounded-lg transition-all ${
            currentStyle === style.id
              ? 'ring-2 ring-blue-500 bg-blue-50'
              : 'hover:bg-gray-50'
          }`}
        >
          <img
            src={renderPreview(style)}
            alt={style.name}
            className="w-full h-auto"
          />
          <span className="block text-center mt-2 text-sm font-medium">
            {style.name}
          </span>
        </button>
      ))}
    </div>
  );
}