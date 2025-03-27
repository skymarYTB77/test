import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

interface ExportToolProps {
  onExport: (format: 'ico' | 'png') => void;
}

export function ExportTool({ onExport }: ExportToolProps) {
  const [selectedFormat, setSelectedFormat] = useState(() => {
    return localStorage.getItem('preferredFormat') || 'ico';
  });

  useEffect(() => {
    localStorage.setItem('preferredFormat', selectedFormat);
  }, [selectedFormat]);

  const formats = [
    { id: 'ico', label: 'Fichier ICO', description: 'Format Windows, supporte plusieurs tailles' },
    { id: 'png', label: 'Fichier PNG', description: 'Compatible avec tous les systèmes' }
  ];

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Format d'export</h3>
      
      <div className="space-y-2">
        {formats.map((format) => (
          <label
            key={format.id}
            className="flex items-start p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center h-5">
              <input
                type="radio"
                name="format"
                value={format.id}
                checked={selectedFormat === format.id}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="h-4 w-4 text-blue-500 border-gray-300 focus:ring-blue-500"
              />
            </div>
            <div className="ml-3">
              <span className="block text-sm font-medium text-gray-900">
                {format.label}
              </span>
              <span className="block text-xs text-gray-500">
                {format.description}
              </span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}