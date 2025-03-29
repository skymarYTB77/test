import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from './TaskManager';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TaskCardProps {
  task: Task;
  onDelete: () => void;
}

export function TaskCard({ task, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="task-card"
    >
      <div className="task-content">
        <h4>{task.title}</h4>
        <div className="task-due-date">
          <span>{format(new Date(task.dueDate), 'dd MMMM yyyy', { locale: fr })}</span>
        </div>
      </div>
      <button 
        className="delete-task"
        onClick={handleDelete}
        title="Supprimer la tâche"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}