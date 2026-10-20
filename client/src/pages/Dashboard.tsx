import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import '../App.css';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import KanbanBoard from '../components/KanbanBoard';
import RightSidebar from '../components/RightSidebar';
import TaskFilters from '../components/TaskFilters';
import TaskForm from '../components/TaskForm';
import { useTaskData } from '../components/useTaskData';
import { applyBoardFilters, hasActiveFilters, readBoardFilters, withPanelFilters } from '../components/boardFilters';
import { PRIORITY_LABELS, STATUS_LABELS, getAssigneeOptions, getTaskStats } from '../components/taskMeta';
import { getTeams } from '../services/teamService';
import type { Task, TaskFormValues, TaskStatus, Team } from '../types';

// Downloads the tasks currently on the board as a CSV file.
function exportReport(tasks: Task[]) {
  const header = ['Title', 'Description', 'Status', 'Priority', 'Assigned to', 'Due date'];
  const rows = tasks.map((t) => [
    t.title,
    t.description,
    STATUS_LABELS[t.status],
    PRIORITY_LABELS[t.priority],
    t.assignedToName ?? 'Unassigned',
    t.dueDate ?? '',
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
    .join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `tasks-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function Dashboard() {
  const { user, canManage, tasks, users, loadState, loadError, actionError, clearActionError, reload, saveTask, changeStatus, removeTask } =
    useTaskData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [teams, setTeams] = useState<Team[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  // undefined = form closed, null = new task, Task = editing that task.
  const [editing, setEditing] = useState<Task | null | undefined>(undefined);
  const [newStatus, setNewStatus] = useState<TaskStatus>('pending');

  useEffect(() => {
    let active = true;
    getTeams()
      .then((data) => {
        if (active) setTeams(data);
      })
      .catch(() => {
        /* Only used for the board's name. */
      });
    return () => {
      active = false;
    };
  }, []);

  // "+ Quick Add" in the navbar opens the new-task form via /dashboard?new=task.
  const quickAdd = searchParams.get('new') === 'task';
  useEffect(() => {
    if (!quickAdd) return;
    if (canManage) openNewTask();
    const next = new URLSearchParams(searchParams);
    next.delete('new');
    setSearchParams(next, { replace: true });
  }, [quickAdd, canManage, searchParams, setSearchParams]);

  const filters = readBoardFilters(searchParams);
  const visibleTasks = user ? applyBoardFilters(tasks, filters, user.id) : [];
  const filtered = hasActiveFilters(filters);
  const stats = getTaskStats(tasks);
  const assignees = getAssigneeOptions(tasks, users);

  const teamName = (id: number | null | undefined) => teams.find((t) => t.id === id)?.name;
  const boardName =
    teamName(filters.teamId) ?? teamName(user?.teamId) ?? (user?.role === 'admin' ? 'All Teams' : 'My');

  function openNewTask(status: TaskStatus = 'pending') {
    setNewStatus(status);
    setEditing(null);
  }

  async function handleSave(values: TaskFormValues) {
    await saveTask(values, editing?.id);
    setEditing(undefined);
  }

  const formOpen = editing !== undefined;

  return (
    <div className="app">
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <main className="main-content">
          <div className="page-heading">
            <div>
              <p className="small-title">WORKSPACE</p>
              <h1>Task Management Dashboard</h1>
              <p className="subtitle">Manage your team's tasks, deadlines and progress.</p>
            </div>
            <button
              className="add-task-button"
              onClick={() => openNewTask()}
              disabled={!canManage}
              title={canManage ? undefined : 'Only admins and team leaders can add tasks'}
            >
              + Add Task
            </button>
          </div>
          <Link className="dashboard-my-tasks" to="/my-tasks">✓ My Tasks →</Link>
          <Link className="dashboard-my-tasks" to="/calendar" style={{ marginLeft: 16 }}>Calendar →</Link>
          <div className="section-heading">
            <div>
              <h2>{boardName} Board</h2>
              <p>
                {loadState === 'loading'
                  ? 'Loading tasks…'
                  : filtered
                    ? `Showing ${visibleTasks.length} of ${tasks.length} tasks.`
                    : 'Track tasks across your current project.'}
                {filtered && loadState === 'ready' && (
                  <>
                    {' '}
                    <button className="board-filters__clear" onClick={() => setSearchParams({}, { replace: true })}>
                      Clear filters
                    </button>
                  </>
                )}
              </p>
            </div>
            <button
              className="filter-button"
              aria-expanded={showFilters}
              onClick={() => setShowFilters((open) => !open)}
            >
              Filter
            </button>
          </div>

          {showFilters && (
            <div className="board-filters">
              <TaskFilters
                values={filters}
                showStatus
                assignees={canManage ? assignees : undefined}
                onChange={(values) => setSearchParams(withPanelFilters(searchParams, values), { replace: true })}
              />
            </div>
          )}

          {loadState === 'error' && (
            <div className="dashboard-message" role="alert">
              <span>{loadError}</span>
              <button onClick={() => void reload()}>Try again</button>
            </div>
          )}

          {actionError && (
            <div className="dashboard-message" role="alert">
              <span>{actionError}</span>
              <button onClick={clearActionError}>Dismiss</button>
            </div>
          )}

          <KanbanBoard
            tasks={visibleTasks}
            canManage={canManage}
            onAdd={openNewTask}
            onStatusChange={(task, status) => void changeStatus(task, status)}
            onEdit={(task) => setEditing(task)}
            onDelete={(task) => void removeTask(task)}
          />
        </main>
        <RightSidebar tasks={tasks} onRefresh={() => void reload()} />
      </div>
      <footer className="footer">
        <div><strong>Project Progress</strong><span> {stats.progress}%</span></div>
        <div className="progress-container"><div className="progress-bar" style={{ width: `${stats.progress}%` }} /></div>
        <div className="footer-links">
          <button onClick={() => exportReport(visibleTasks)} disabled={loadState !== 'ready'}>Export Report</button>
          <button disabled title="Not available yet">Settings</button>
          <button disabled title="Not available yet">Integrations</button>
        </div>
      </footer>

      {formOpen && (
        <TaskForm
          initialTask={editing ?? null}
          defaultStatus={newStatus}
          assignees={assignees}
          onSubmit={handleSave}
          onCancel={() => setEditing(undefined)}
        />
      )}
    </div>
  );
}
