import { useState } from 'react';
import type { TaskStatus } from '../types';
import { STATUS_LABELS, STATUS_ORDER } from './taskMeta';
import './TaskUi.css';

interface StatusSelectProps {
  value: TaskStatus;
  label: string;
  // Expected to handle its own errors; the select is disabled until it settles.
  onChange: (status: TaskStatus) => Promise<void>;
}

export default function StatusSelect({ value, label, onChange }: StatusSelectProps) {
  const [saving, setSaving] = useState(false);

  async function handleChange(next: TaskStatus) {
    setSaving(true);
    try {
      await onChange(next);
    } finally {
      setSaving(false);
    }
  }

  return (
    <select
      className={`status-select status-select--${value}`}
      aria-label={label}
      value={value}
      disabled={saving}
      onChange={(e) => void handleChange(e.target.value as TaskStatus)}
    >
      {STATUS_ORDER.map((status) => (
        <option key={status} value={status}>
          {STATUS_LABELS[status]}
        </option>
      ))}
    </select>
  );
}
