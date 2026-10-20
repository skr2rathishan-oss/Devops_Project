import { useEffect, useRef, useState } from 'react';
import type { Task, TaskStatus } from '../types';
import { PRIORITY_LABELS, STATUS_LABELS, STATUS_ORDER, formatShortDate, initials, isOverdue } from './taskMeta';

type TaskCardProps = {
  task: Task;
  // Admins and team leaders may edit and delete; everyone shown a card may move it.
  canManage: boolean;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
};

function TaskCard({ task, canManage, onStatusChange, onEdit, onDelete }: TaskCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const overdue = isOverdue(task);

  // Close the menu on an outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  function choose(action: () => void) {
    setMenuOpen(false);
    action();
  }

  return (
    <div className="task-card">
      <div className="task-top" ref={menuRef}>
        <span className={`priority ${task.priority}`}>
          {PRIORITY_LABELS[task.priority]}
        </span>

        <button
          aria-label={`Actions for ${task.title}`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          •••
        </button>

        {menuOpen && (
          <div className="task-menu" role="menu">
            <span className="task-menu__label">MOVE TO</span>
            {STATUS_ORDER.map((status) => (
              <button
                key={status}
                role="menuitem"
                disabled={status === task.status}
                onClick={() => choose(() => onStatusChange(task, status))}
              >
                {STATUS_LABELS[status]}
              </button>
            ))}
            {canManage && (
              <>
                <span className="task-menu__label">TASK</span>
                <button role="menuitem" onClick={() => choose(() => onEdit(task))}>
                  Edit
                </button>
                <button role="menuitem" className="task-menu__danger" onClick={() => choose(() => onDelete(task))}>
                  Delete
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <h3>{task.title}</h3>

      {task.description && <p>{task.description}</p>}

      <div className="task-bottom">
        <div className="task-user" title={task.assignedToName ?? 'Unassigned'}>
          {task.assignedToName ? initials(task.assignedToName) : '–'}
        </div>

        <span className={overdue ? 'task-due-overdue' : undefined} title={overdue ? 'Overdue' : undefined}>
          📅 {task.dueDate ? formatShortDate(task.dueDate) : 'No date'}
        </span>
      </div>
    </div>
  );
}

export default TaskCard;
