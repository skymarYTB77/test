import React from 'react';
import { Calendar, List, MessageSquare } from 'lucide-react';

interface SidebarProps {
  onCalendarClick: () => void;
  onTasksClick: () => void;
  onChatClick: () => void;
}

export function Sidebar({ onCalendarClick, onTasksClick, onChatClick }: SidebarProps) {
  return (
    <div className="sidebar">
      <button 
        className="sidebar-button calendar"
        onClick={onCalendarClick}
        title="Calendrier"
      >
        <Calendar size={20} />
      </button>
      
      <button 
        className="sidebar-button tasks"
        onClick={onTasksClick}
        title="Gestionnaire de tâches"
      >
        <List size={20} />
      </button>
      
      <button 
        className="sidebar-button chat"
        onClick={onChatClick}
        title="Chat avec Gemini"
      >
        <MessageSquare size={20} />
      </button>
    </div>
  );
}