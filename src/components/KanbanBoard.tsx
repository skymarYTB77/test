import React from 'react';
import { Task } from './TaskManager';
import { TaskCard } from './TaskCard';

interface KanbanBoardProps {
  tasks: Task[];
  onDeleteTask: (taskId: string) => void;
}

export function KanbanBoard({ tasks, onDeleteTask }: KanbanBoardProps) {
  const columns = [
    { id: 'today', title: "Aujourd'hui", color: '#00c853' },
    { id: 'thisWeek', title: 'Cette semaine', color: '#2196f3' },
    { id: 'thisMonth', title: 'Ce mois', color: '#ff9800' }
  ] as const;

  return (
    <div className="kanban-board">
      {columns.map(column => (
        <div 
          key={column.id} 
          className="kanban-column"
          style={{ '--column-color': column.color } as React.CSSProperties}
        >
          <div className="column-header">
            <h3>{column.title}</h3>
            <span className="task-count">
              {tasks.filter(task => task.column === column.id).length}
            </span>
          </div>
          <div className="column-content">
            {tasks
              .filter(task => task.column === column.id)
              .map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDelete={() => onDeleteTask(task.id)}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}