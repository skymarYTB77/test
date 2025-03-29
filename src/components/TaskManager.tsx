import React from 'react';
import { List } from 'lucide-react';
import '../styles/TaskManager.css';

export function TaskManager() {
  const openTaskManager = () => {
    const width = 1200;
    const height = 800;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    const popup = window.open(
      '',
      'TaskManager',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no,location=no,menubar=no,toolbar=no`
    );

    if (popup) {
      popup.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Gestionnaire de tâches</title>
            <style>
              body { 
                margin: 0; 
                padding: 0; 
                overflow: hidden; 
                background: #1a1a1a;
              }
              iframe {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border: none;
              }
            </style>
          </head>
          <body>
            <iframe 
              src="https://gestionnairedetaches.netlify.app"
              allow="fullscreen"
              loading="eager"
            ></iframe>
          </body>
        </html>
      `);
      popup.document.close();
    }
  };

  return (
    <button 
      className="task-manager-toggle" 
      onClick={openTaskManager}
      title="Ouvrir le gestionnaire de tâches"
    >
      <List size={20} />
    </button>
  );
}