import React from 'react';
import { Task } from './TaskManager';
import { TaskCard } from './TaskCard';

interface ListViewProps {
  tasks: Task[];
  onDeleteTask: (taskId: string) => void;
}

export function ListView({ tasks, onDeleteTask }: ListViewProps) {
  const sortedTasks = [...tasks].sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  return (
    <div className="list-view">
      {sortedTasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onDelete={() => onDeleteTask(task.id)}
        />
      ))}
    </div>
  );
}