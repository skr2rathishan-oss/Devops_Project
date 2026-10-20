import { useState } from 'react';
import '../components/TaskUi.css';
import Layout from '../components/Layout';
import StatusSelect from '../components/StatusSelect';
import TaskFilters from '../components/TaskFilters';
import TaskForm from '../components/TaskForm';
import { useTaskData } from '../components/useTaskData';
import {
  EMPTY_FILTERS,
  PRIORITY_LABELS,
  applyTaskFilters,
  describeDeadline,
  formatDueDate,
  getAssigneeOptions,
  isOverdue,
  sortByDueDate,
} from '../components/taskMeta';
import type { TaskFilterValues } from '../components/taskMeta';
import type { Task, TaskFormValues } from '../types';

// Team tasks (admins and team leaders): every task in the viewer's scope, stored in the database.
export default function Tasks() {
  const { user, tasks, users, loadState, loadError, actionError, clearActionError, reload, saveTask, changeStatus, removeTask } =
    useTaskData();
  const [filters, setFilters] = useState<TaskFilterValues>(EMPTY_FILTERS);
  // undefined = closed, null = new task, Task = editing that task.
  const [editing, setEditing] = useState<Task | null | undefined>(undefined);
  const [retrying, setRetrying] = useState(false);

  const visibleTasks = sortByDueDate(applyTaskFilters(tasks, filters));

  async function handleRetry() {
    setRetrying(true);
    await reload();
    setRetrying(false);
  }

  async function handleSave(values: TaskFormValues) {
    await saveTask(values, editing?.id);
    setEditing(undefined);
  }

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Team tasks</h1>
          <p className="page-subtitle">
            {user?.role === 'admin'
              ? 'Every task across all teams.'
              : 'Tasks you created or are assigned, and every task in your team.'}
          </p>
        </div>
        <div className="page-header__actions">
          <button type="button" className="btn btn--primary" onClick={() => setEditing(null)}>
            + New task
          </button>
        </div>
      </div>

      {loadState === 'loading' && <p className="page-state">Loading tasks…</p>}

      {loadState === 'error' && (
        <div className="page-state page-state--error" role="alert">
          <p>{loadError}</p>
          <button type="button" className="btn btn--ghost" onClick={() => void handleRetry()} disabled={retrying}>
            Try again
          </button>
        </div>
      )}

      {loadState === 'ready' && (
        <>
          {actionError && (
            <div className="alert" role="alert">
              <span>{actionError}</span>
              <button type="button" className="link-button" onClick={clearActionError}>
                Dismiss
              </button>
            </div>
          )}

          <div className="section-header">
            <p className="page-subtitle">
              Showing {visibleTasks.length} of {tasks.length} tasks
            </p>
            <TaskFilters
              values={filters}
              onChange={setFilters}
              showStatus
              assignees={getAssigneeOptions(tasks, users)}
            />
          </div>

          {visibleTasks.length === 0 ? (
            <div className="empty-state">
              <h3>{tasks.length === 0 ? 'No tasks yet' : 'No tasks match these filters'}</h3>
              <p>
                {tasks.length === 0
                  ? 'Create a task and assign it to start tracking progress.'
                  : 'Try a different search or clear the filters.'}
              </p>
              {tasks.length > 0 && (
                <button type="button" className="btn btn--ghost" onClick={() => setFilters(EMPTY_FILTERS)}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="table-scroll">
              <table className="data-table task-table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Assigned to</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Due</th>
                    <th>
                      <span className="visually-hidden">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleTasks.map((task) => (
                    <tr key={task.id}>
                      <td>
                        <strong className="task-table__title">{task.title}</strong>
                        {task.description && <span className="task-table__description">{task.description}</span>}
                      </td>
                      <td>{task.assignedToName ?? <span className="text-muted">Unassigned</span>}</td>
                      <td>
                        <span className={`task-badge task-badge--${task.priority}`}>{PRIORITY_LABELS[task.priority]}</span>
                      </td>
                      <td>
                        <StatusSelect
                          value={task.status}
                          label={`Status of ${task.title}`}
                          onChange={(status) => changeStatus(task, status)}
                        />
                      </td>
                      <td>
                        {task.dueDate ? (
                          <>
                            {formatDueDate(task.dueDate)}
                            <span className={`task-table__deadline${isOverdue(task) ? ' is-overdue' : ''}`}>
                              {describeDeadline(task)}
                            </span>
                          </>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="task-table__actions">
                        <button type="button" className="link-button" onClick={() => setEditing(task)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="link-button link-button--danger"
                          onClick={() => void removeTask(task)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {editing !== undefined && (
        <TaskForm
          initialTask={editing}
          assignees={getAssigneeOptions([], users)}
          onSubmit={handleSave}
          onCancel={() => setEditing(undefined)}
        />
      )}
    </Layout>
  );
}
