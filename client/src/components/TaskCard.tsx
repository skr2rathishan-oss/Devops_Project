import type { Task, Role } from '../types';

interface TaskCardProps {
  task: Task;
  role: Role;
  onEdit?: (task: Task) => void;
  onDelete?: (id: number) => void;
  onStatusChange?: (id: number, status: Task['status']) => void;
}

const STATUS_LABELS: Record<Task['status'], string> = {
  pending: 'Pending',
  in_progress: 'In progress',
  completed: 'Completed',
};

const PRIORITY_LABELS: Record<Task['priority'], string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export default function TaskCard({ task, role, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const canManage = role === 'admin' || role === 'team_leader';

  return (
    <article className="task-card">
      <div className="task-card__header">
        <h3 className="task-card__title">{task.title}</h3>
        <span className={`badge badge--priority-${task.priority}`}>{PRIORITY_LABELS[task.priority]}</span>
      </div>
      {task.description && <p className="task-card__description">{task.description}</p>}
      <div className="task-card__meta">
        <span className={`badge badge--status-${task.status}`}>{STATUS_LABELS[task.status]}</span>
        {task.assignedToName && <span className="task-card__assignee">Assigned to {task.assignedToName}</span>}
        {task.dueDate && <span className="task-card__due">Due {new Date(task.dueDate).toLocaleDateString()}</span>}
      </div>

      {onStatusChange && !canManage && (
        <select
          className="input"
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as Task['status'])}
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
      )}

      {canManage && (
        <div className="task-card__actions">
          {onEdit && (
            <button type="button" className="btn btn--ghost" onClick={() => onEdit(task)}>
              Edit
            </button>
          )}
          {onDelete && (
            <button type="button" className="btn btn--danger" onClick={() => onDelete(task.id)}>
              Delete
            </button>
          )}
        </div>
      )}
    </article>
  );
}
