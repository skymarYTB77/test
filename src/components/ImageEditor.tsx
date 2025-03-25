import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { ImageSettings, OverlaySettings, TextSettings } from '../types/folder';
import { Sun, Contrast, Palette, Scale, Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface ImageEditorProps {
  settings: ImageSettings;
  overlaySettings?: OverlaySettings;
  textSettings?: TextSettings;
  onChange: (settings: ImageSettings) => void;
  onOverlayChange?: (settings: OverlaySettings) => void;
  onTextChange?: (settings: TextSettings) => void;
}

export function ImageEditor({ 
  settings, 
  overlaySettings, 
  textSettings,
  onChange, 
  onOverlayChange,
  onTextChange 
}: ImageEditorProps) {
  const updateSetting = (key: keyof ImageSettings, value: number) => {
    onChange({ ...settings, [key]: value });
  };

  const updateOverlaySetting = (key: keyof OverlaySettings, value: number | string) => {
    if (onOverlayChange && overlaySettings) {
      onOverlayChange({ ...overlaySettings, [key]: value });
    }
  };

  const updateTextSetting = (key: keyof TextSettings, value: number | string) => {
    if (onTextChange && textSettings) {
      onTextChange({ ...textSettings, [key]: value });
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': []
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file && onOverlayChange && overlaySettings) {
        const reader = new FileReader();
        reader.onload = (e) => {
          onOverlayChange({
            ...overlaySettings,
            image: e.target?.result as string
          });
        };
        reader.readAsDataURL(file);
      }
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-4">Dossier</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Luminosité
          </label>
          <div className="flex items-center gap-4">
            <Sun className="text-gray-500" size={24} />
            <input
              type="range"
              min="0"
              max="200"
              value={settings.brightness}
              onChange={(e) => updateSetting('brightness', Number(e.target.value))}
              className="w-full"
            />
            <span className="w-16 text-right">{settings.brightness}%</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Contraste
          </label>
          <div className="flex items-center gap-4">
            <Contrast className="text-gray-500" size={24} />
            <input
              type="range"
              min="0"
              max="200"
              value={settings.contrast}
              onChange={(e) => updateSetting('contrast', Number(e.target.value))}
              className="w-full"
            />
            <span className="w-16 text-right">{settings.contrast}%</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Saturation
          </label>
          <div className="flex items-center gap-4">
            <Palette className="text-gray-500" size={24} />
            <input
              type="range"
              min="0"
              max="200"
              value={settings.saturation}
              onChange={(e) => updateSetting('saturation', Number(e.target.value))}
              className="w-full"
            />
            <span className="w-16 text-right">{settings.saturation}%</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Teinte
          </label>
          <div className="flex items-center gap-4">
            <Palette className="text-gray-500" size={24} />
            <input
              type="range"
              min="0"
              max="360"
              value={settings.hue}
              onChange={(e) => updateSetting('hue', Number(e.target.value))}
              className="w-full"
            />
            <span className="w-16 text-right">{settings.hue}°</span>
          </div>
        </div>
      </div>

      {onOverlayChange && overlaySettings && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Image superposée</h3>
          
          {!overlaySettings.image ? (
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
                  src={overlaySettings.image} 
                  alt="Superposition" 
                  className="w-16 h-16 object-contain"
                />
                <button
                  onClick={() => updateOverlaySetting('image', '')}
                  className="text-red-500 text-sm hover:text-red-600"
                >
                  Supprimer
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position X
                  </label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={overlaySettings.x}
                    onChange={(e) => updateOverlaySetting('x', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position Y
                  </label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={overlaySettings.y}
                    onChange={(e) => updateOverlaySetting('y', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Échelle
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    value={overlaySettings.scale}
                    onChange={(e) => updateOverlaySetting('scale', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {onTextChange && textSettings && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Texte superposé</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Texte
              </label>
              <input
                type="text"
                value={textSettings.text}
                onChange={(e) => updateTextSetting('text', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Entrez votre texte"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position X
              </label>
              <input
                type="range"
                min="-100"
                max="100"
                value={textSettings.x}
                onChange={(e) => updateTextSetting('x', Number(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position Y
              </label>
              <input
                type="range"
                min="-100"
                max="100"
                value={textSettings.y}
                onChange={(e) => updateTextSetting('y', Number(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taille
              </label>
              <input
                type="range"
                min="8"
                max="72"
                value={textSettings.size}
                onChange={(e) => updateTextSetting('size', Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur
              </label>
              <HexColorPicker
                color={textSettings.color}
                onChange={(color) => updateTextSetting('color', color)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Police
              </label>
              <select
                value={textSettings.fontFamily}
                onChange={(e) => updateTextSetting('fontFamily', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Georgia">Georgia</option>
                <option value="Courier New">Courier New</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}