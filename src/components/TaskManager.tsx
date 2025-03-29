import React, { useState } from 'react';
import { List } from 'lucide-react';
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
        <div className="task-manager-overlay" onClick={() => setIsOpen(false)}>
          <div className="task-manager-container" onClick={e => e.stopPropagation()}>
            <iframe 
              src="https://gestionnairedetaches.netlify.app"
              title="Gestionnaire de tâches"
              className="task-manager-iframe"
            />
          </div>
        </div>
      )}
    </>
  );
}