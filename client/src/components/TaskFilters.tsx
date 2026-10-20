import { PRIORITY_LABELS, PRIORITY_ORDER, STATUS_LABELS, STATUS_ORDER } from './taskMeta';
import type { AssigneeFilter, AssigneeOption, TaskFilterValues } from './taskMeta';
import './ui.css';
import './TaskUi.css';

interface TaskFiltersProps {
  values: TaskFilterValues;
  onChange: (values: TaskFilterValues) => void;
  showStatus?: boolean;
  // Shows the assignee filter when given (admins and team leaders).
  assignees?: AssigneeOption[];
}

function parseAssignee(value: string): AssigneeFilter {
  if (value === 'all' || value === 'unassigned') return value;
  return Number(value);
}

export default function TaskFilters({ values, onChange, showStatus = false, assignees }: TaskFiltersProps) {
  function set<K extends keyof TaskFilterValues>(key: K, value: TaskFilterValues[K]) {
    onChange({ ...values, [key]: value });
  }

  return (
    <div className="task-filters" role="search">
      <input
        className="input task-filters__search"
        type="search"
        placeholder="Search tasks…"
        aria-label="Search tasks"
        value={values.search}
        onChange={(e) => set('search', e.target.value)}
      />

      {showStatus && (
        <select
          className="input"
          aria-label="Filter by status"
          value={values.status}
          onChange={(e) => set('status', e.target.value as TaskFilterValues['status'])}
        >
          <option value="all">All statuses</option>
          {STATUS_ORDER.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      )}

      <select
        className="input"
        aria-label="Filter by priority"
        value={values.priority}
        onChange={(e) => set('priority', e.target.value as TaskFilterValues['priority'])}
      >
        <option value="all">All priorities</option>
        {PRIORITY_ORDER.map((priority) => (
          <option key={priority} value={priority}>
            {PRIORITY_LABELS[priority]}
          </option>
        ))}
      </select>

      {assignees && (
        <select
          className="input"
          aria-label="Filter by assignee"
          value={String(values.assignee)}
          onChange={(e) => set('assignee', parseAssignee(e.target.value))}
        >
          <option value="all">Everyone</option>
          <option value="unassigned">Unassigned</option>
          {assignees.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
