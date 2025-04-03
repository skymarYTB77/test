import React, { useEffect } from 'react';
import { ExportFormat } from '../../types/folder';

interface FormatToolProps {
  format: ExportFormat;
  onChange: (format: ExportFormat) => void;
}

export function FormatTool({ format, onChange }: FormatToolProps) {
  useEffect(() => {
    const savedFormat = localStorage.getItem('exportFormat') as ExportFormat;
    if (savedFormat) {
      onChange(savedFormat);
    }
  }, [onChange]);

  const handleFormatChange = (newFormat: ExportFormat) => {
    localStorage.setItem('exportFormat', newFormat);
    onChange(newFormat);
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Format d'export</h3>
      
      <div className="space-y-4">
        <label className="flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 hover:bg-gray-50 hover:border-blue-500 hover:shadow-lg space-y-2 relative">
          <input
            type="radio"
            checked={format === 'png'}
            onChange={() => handleFormatChange('png')}
            className="absolute opacity-0"
          />
          <img 
            src="https://res.cloudinary.com/dp1u62e2c/image/upload/v1743540591/PNG_iykbt7.svg"
            alt="PNG Format"
            className="w-24 h-24"
          />
          <span className={`text-lg font-medium ${format === 'png' ? 'text-blue-500' : 'text-gray-700'}`}>
            .PNG
          </span>
          <p className="text-sm text-gray-500 text-center">
            Format d'image haute qualité avec transparence
          </p>
          <div className={`absolute inset-0 border-2 rounded-lg transition-colors ${format === 'png' ? 'border-blue-500' : 'border-transparent'}`} />
        </label>
        
        <label className="flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 hover:bg-gray-50 hover:border-blue-500 hover:shadow-lg space-y-2 relative">
          <input
            type="radio"
            checked={format === 'ico'}
            onChange={() => handleFormatChange('ico')}
            className="absolute opacity-0"
          />
          <img 
            src="https://res.cloudinary.com/dp1u62e2c/image/upload/v1743602645/ico_rypkw7.svg"
            alt="ICO Format"
            className="w-24 h-24"
          />
          <span className={`text-lg font-medium ${format === 'ico' ? 'text-blue-500' : 'text-gray-700'}`}>
            .ICO
          </span>
          <p className="text-sm text-gray-500 text-center">
            Format standard pour les icônes Windows
          </p>
          <div className={`absolute inset-0 border-2 rounded-lg transition-colors ${format === 'ico' ? 'border-blue-500' : 'border-transparent'}`} />
        </label>
      </div>
    </div>
  );
}