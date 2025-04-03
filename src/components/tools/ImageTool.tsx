import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { OverlaySettings } from '../../types/folder';

interface ImageToolProps {
  settings: OverlaySettings;
  onChange: (settings: OverlaySettings) => void;
}

export function ImageTool({ settings, onChange }: ImageToolProps) {
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': []
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          onChange({
            ...settings,
            image: e.target?.result as string
          });
        };
        reader.readAsDataURL(file);
      }
    }
  });

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Image superposée</h3>
      
      {!settings.image ? (
        <div 
          {...getRootProps()} 
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400"
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            Cliquez ou glissez une image ici
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-4">
            <img 
              src={settings.image} 
              alt="Superposition" 
              className="w-16 h-16 object-contain bg-gray-100 rounded"
            />
            <button
              onClick={() => onChange({ ...settings, image: '' })}
              className="text-red-500 text-sm hover:text-red-600"
            >
              Supprimer
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Échelle
            </label>
            <input
              type="range"
              min="10"
              max="300"
              value={settings.scale}
              onChange={(e) => onChange({ ...settings, scale: Number(e.target.value) })}
              className="w-full"
            />
            <span className="text-sm text-gray-500 mt-1 block">
              {settings.scale}%
            </span>
          </div>
        </>
      )}
    </div>
  );
}