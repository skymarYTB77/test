import React from 'react';
import { Type, Image, Folder, FileType } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const tools = [
    { id: 'folder', icon: Folder, label: 'Dossier' },
    { id: 'text', icon: Type, label: 'Texte' },
    { id: 'image', icon: Image, label: 'Image' },
    { id: 'format', icon: FileType, label: 'Format' }
  ];

  return (
    <div className="w-20 bg-gray-100 border-l border-gray-200 flex flex-col items-center py-4">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onTabChange(tool.id)}
          className={`w-16 h-16 mb-2 flex flex-col items-center justify-center rounded-lg transition-colors ${
            activeTab === tool.id
              ? 'bg-blue-500 text-white'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          <tool.icon size={24} />
          <span className="text-xs mt-1">{tool.label}</span>
        </button>
      ))}
    </div>
  );
}