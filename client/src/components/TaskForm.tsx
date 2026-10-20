import { useState } from 'react';
import type { FormEvent } from 'react';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';
import { getAuthErrorMessage } from '../services/authService';
import type { Task, TaskFormValues, TaskStatus } from '../types';
import { PRIORITY_LABELS, PRIORITY_ORDER, STATUS_LABELS, STATUS_ORDER } from './taskMeta';
import type { AssigneeOption } from './taskMeta';
import './TaskUi.css';

// Match the limits enforced in server/src/controllers/task.controller.js.
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 5000;

interface TaskFormProps {
  initialTask?: Task | null;
  // Status preselected for a new task, e.g. when adding from a board column.
  defaultStatus?: TaskStatus;
  // Users the viewer may assign to (GET /users is already scoped by role).
  assignees: AssigneeOption[];
  onSubmit: (values: TaskFormValues) => Promise<void>;
  onCancel: () => void;
}

function toFormValues(task: Task | null | undefined, defaultStatus: TaskStatus): TaskFormValues {
  return {
    title: task?.title ?? '',
    description: task?.description ?? '',
    status: task?.status ?? defaultStatus,
    priority: task?.priority ?? 'medium',
    assignedTo: task?.assignedTo ?? '',
    dueDate: task?.dueDate ?? '',
  };
}

// Create / edit form for admins and team leaders, shown in a modal.
export default function TaskForm({ initialTask, defaultStatus = 'pending', assignees, onSubmit, onCancel }: TaskFormProps) {
  const [values, setValues] = useState<TaskFormValues>(() => toFormValues(initialTask, defaultStatus));
  const { user } = useAuth();
  // Leaders can only assign within their own team, so without a team the list is just themselves.
  const leaderWithoutTeam = user?.role === 'team_leader' && user.teamId === null;

  // Keep the current assignee selectable even if they're outside the viewer's assignable users.
  const currentAssignee = initialTask?.assignedTo ?? null;
  const options =
    currentAssignee !== null && !assignees.some((a) => a.id === currentAssignee)
      ? [...assignees, { id: currentAssignee, name: initialTask?.assignedToName ?? `User #${currentAssignee}` }]
      : assignees;
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    const title = values.title.trim();
    if (!title) {
      setError('Title is required.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ ...values, title, description: values.description.trim() });
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Could not save the task. Please try again.'));
      setSubmitting(false);
    }
  }

  return (
    <Modal title={initialTask ? 'Edit task' : 'New task'} onClose={onCancel}>
      <form className="task-form" onSubmit={handleSubmit} noValidate>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <label className="field">
          <span>Title</span>
          <input
            className="input"
            value={values.title}
            maxLength={MAX_TITLE_LENGTH}
            onChange={(e) => update('title', e.target.value)}
            disabled={submitting}
            autoFocus
            required
          />
        </label>

        <label className="field">
          <span>Description</span>
          <textarea
            className="input"
            rows={4}
            value={values.description}
            maxLength={MAX_DESCRIPTION_LENGTH}
            onChange={(e) => update('description', e.target.value)}
            disabled={submitting}
          />
        </label>

        <div className="field-row">
          <label className="field">
            <span>Status</span>
            <select
              className="input"
              value={values.status}
              onChange={(e) => update('status', e.target.value as TaskFormValues['status'])}
              disabled={submitting}
            >
              {STATUS_ORDER.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Priority</span>
            <select
              className="input"
              value={values.priority}
              onChange={(e) => update('priority', e.target.value as TaskFormValues['priority'])}
              disabled={submitting}
            >
              {PRIORITY_ORDER.map((priority) => (
                <option key={priority} value={priority}>
                  {PRIORITY_LABELS[priority]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="field-row">
          <label className="field">
            <span>Assign to</span>
            <select
              className="input"
              value={values.assignedTo}
              onChange={(e) => update('assignedTo', e.target.value ? Number(e.target.value) : '')}
              disabled={submitting}
            >
              <option value="">Unassigned</option>
              {options.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            {leaderWithoutTeam && (
              <small className="task-form__hint">
                You're not in a team yet, so you can only assign tasks to yourself. Ask an admin to add you
                to a team on the Users page.
              </small>
            )}
          </label>

          <label className="field">
            <span>Due date</span>
            <input
              className="input"
              type="date"
              value={values.dueDate}
              onChange={(e) => update('dueDate', e.target.value)}
              disabled={submitting}
            />
          </label>
        </div>

        <div className="task-form__actions">
          <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Saving…' : initialTask ? 'Save changes' : 'Create task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
