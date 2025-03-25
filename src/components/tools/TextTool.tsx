import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { TextSettings } from '../../types/folder';

const GOOGLE_FONTS = [
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Raleway',
  'Source Sans Pro',
  'Ubuntu',
  'Playfair Display',
  'Merriweather'
];

interface TextToolProps {
  settings: TextSettings;
  onChange: (settings: TextSettings) => void;
}

export function TextTool({ settings, onChange }: TextToolProps) {
  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Texte superposé</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Texte
        </label>
        <input
          type="text"
          value={settings.text}
          onChange={(e) => onChange({ ...settings, text: e.target.value })}
          className="w-full px-3 py-2 border rounded-md text-gray-900"
          placeholder="Entrez votre texte"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Taille
        </label>
        <input
          type="range"
          min="8"
          max="120"
          value={settings.size}
          onChange={(e) => onChange({ ...settings, size: Number(e.target.value) })}
          className="w-full"
        />
        <span className="text-sm text-gray-500 mt-1 block">
          {settings.size}px
        </span>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Couleur
        </label>
        <HexColorPicker
          color={settings.color}
          onChange={(color) => onChange({ ...settings, color })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Police
        </label>
        <select
          value={settings.fontFamily}
          onChange={(e) => onChange({ ...settings, fontFamily: e.target.value })}
          className="w-full px-3 py-2 border rounded-md text-gray-900"
          style={{ fontFamily: settings.fontFamily }}
        >
          {GOOGLE_FONTS.map(font => (
            <option 
              key={font} 
              value={font}
              style={{ fontFamily: font }}
            >
              {font}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}