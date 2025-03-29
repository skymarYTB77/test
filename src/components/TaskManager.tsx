import React, { useState } from 'react';
import { List, X } from 'lucide-react';
import '../styles/TaskManager.css';

export function TaskManager() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        className="task-manager-toggle" 
        onClick={() => setIsOpen(true)}
        title="Ouvrir le gestionnaire de tâches"
      >
        <List size={20} />
      </button>

      {isOpen && (
        <div className="task-manager-overlay">
          <div className="task-manager-container">
            <div className="task-manager-header">
              <h2>Gestionnaire de tâches</h2>
              <button 
                className="close-task-manager"
                onClick={() => setIsOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
            <div className="task-manager-content">
              <iframe 
                src="https://gestionnairedetaches.netlify.app"
                title="Gestionnaire de tâches"
                className="task-manager-iframe"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}