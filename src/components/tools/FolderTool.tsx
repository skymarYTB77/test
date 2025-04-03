import React from 'react';
import { ImageSettings } from '../../types/folder';
import { Sun, Contrast, Palette } from 'lucide-react';

interface FolderToolProps {
  settings: ImageSettings;
  onChange: (settings: ImageSettings) => void;
}

export function FolderTool({ settings, onChange }: FolderToolProps) {
  const updateSetting = (key: keyof ImageSettings, value: number) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Personnalisation du dossier</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Luminosité
        </label>
        <div className="flex items-center gap-4">
          <Sun className="text-gray-500" size={20} />
          <input
            type="range"
            min="0"
            max="200"
            value={settings.brightness}
            onChange={(e) => updateSetting('brightness', Number(e.target.value))}
            className="w-full"
          />
          <span className="w-12 text-right text-gray-700">{settings.brightness}%</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contraste
        </label>
        <div className="flex items-center gap-4">
          <Contrast className="text-gray-500" size={20} />
          <input
            type="range"
            min="0"
            max="200"
            value={settings.contrast}
            onChange={(e) => updateSetting('contrast', Number(e.target.value))}
            className="w-full"
          />
          <span className="w-12 text-right text-gray-700">{settings.contrast}%</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Saturation
        </label>
        <div className="flex items-center gap-4">
          <Palette className="text-gray-500" size={20} />
          <input
            type="range"
            min="0"
            max="200"
            value={settings.saturation}
            onChange={(e) => updateSetting('saturation', Number(e.target.value))}
            className="w-full"
          />
          <span className="w-12 text-right text-gray-700">{settings.saturation}%</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Teinte
        </label>
        <div className="flex items-center gap-4">
          <Palette className="text-gray-500" size={20} />
          <input
            type="range"
            min="0"
            max="360"
            value={settings.hue}
            onChange={(e) => updateSetting('hue', Number(e.target.value))}
            className="w-full"
          />
          <span className="w-12 text-right text-gray-700">{settings.hue}°</span>
        </div>
      </div>
    </div>
  );
}