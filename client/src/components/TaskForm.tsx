import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Task, TaskFormValues, User } from '../types';

interface TaskFormProps {
  initialTask?: Task | null;
  users: User[];
  onSubmit: (values: TaskFormValues) => Promise<void>;
  onCancel: () => void;
}

function toFormValues(task?: Task | null): TaskFormValues {
  return {
    title: task?.title ?? '',
    description: task?.description ?? '',
    status: task?.status ?? 'pending',
    priority: task?.priority ?? 'medium',
    assignedTo: task?.assignedTo ?? '',
    dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : '',
  };
}

export default function TaskForm({ initialTask, users, onSubmit, onCancel }: TaskFormProps) {
  const [values, setValues] = useState<TaskFormValues>(toFormValues(initialTask));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!values.title.trim()) {
      setError('Title is required.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save the task. Try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h2 className="task-form__title">{initialTask ? 'Edit task' : 'New task'}</h2>

      {error && <p className="form-error">{error}</p>}

      <label className="field">
        <span>Title</span>
        <input
          className="input"
          value={values.title}
          onChange={(e) => update('title', e.target.value)}
          disabled={submitting}
        />
      </label>

      <label className="field">
        <span>Description</span>
        <textarea
          className="input"
          rows={3}
          value={values.description}
          onChange={(e) => update('description', e.target.value)}
          disabled={submitting}
        />
      </label>

      <div className="field-row">
        <label className="field">
          <span>Priority</span>
          <select
            className="input"
            value={values.priority}
            onChange={(e) => update('priority', e.target.value as TaskFormValues['priority'])}
            disabled={submitting}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>

        <label className="field">
          <span>Status</span>
          <select
            className="input"
            value={values.status}
            onChange={(e) => update('status', e.target.value as TaskFormValues['status'])}
            disabled={submitting}
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
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
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
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
          {submitting ? 'Saving…' : 'Save task'}
        </button>
      </div>
    </form>
  );
}
