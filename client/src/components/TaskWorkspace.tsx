import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { TaskStatus } from '../types';
import './TaskWorkspace.css';
type Workspace = {
  id: string;
  team: string;
  project: string;
  members?: string[];
};
type LocalTask = {
  id: string;
  workspaceId: string;
  title: string;
  assignee: string;
  due: string;
  status: TaskStatus;
};
type Data = {
  workspaces: Workspace[];
  tasks: LocalTask[];
  selectedId: string;
};
const statuses: Record<TaskStatus, string> = {
  pending: 'To do', in_progress: 'In progress', completed: 'Completed'
};
function readData(key: string): Data {
  try {
    const d = JSON.parse(localStorage.getItem(key) || 'null');
    if (d && typeof d.selectedId === 'string' && Array.isArray(d.workspaces) && Array.isArray(d.tasks) &&
      d.workspaces.every((w: Workspace) => typeof w.id === 'string' && typeof w.team === 'string' && typeof w.project === 'string' && (w.members === undefined || (Array.isArray(w.members) && w.members.every(name => typeof name === 'string')))) &&
      d.tasks.every((t: LocalTask) => typeof t.id === 'string' && typeof t.workspaceId === 'string' && typeof t.title === 'string' && typeof t.assignee === 'string' && typeof t.due === 'string' && Object.hasOwn(statuses, t.status)))
      return d;
  }
  catch { /* Start empty if saved data is unavailable. */
  }
  return {
    workspaces: [], tasks: [], selectedId: ''
  };
}
export default function TaskWorkspace({ personal = false }: {
  personal?: boolean;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const key = `teamspace-workspaces-v1-${user!.id}`;
  const [data, setData] = useState<Data>(() => readData(key));
  const [dialog, setDialog] = useState<'profile' | 'workspace' | 'task' | null>(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | TaskStatus>('all');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const canAssign = user!.role !== 'team_member';
  const workspace = data.workspaces.find(w => w.id === data.selectedId) ?? data.workspaces[0];
  const teamTasks = data.tasks.filter(t => t.workspaceId === workspace?.id);
  const myTasks = teamTasks.filter(t => t.assignee === String(user!.id));
  const completed = myTasks.filter(t => t.status === 'completed').length;
  const progress = myTasks.length ? Math.round(completed / myTasks.length * 100) : 0;
  const visible = (personal ? myTasks : teamTasks).filter(t => filter === 'all' || t.status === filter);
  const initials = user!.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    }
    catch {
      setError('Your browser could not save changes. Keep this tab open to retain your work.');
    }
  }, [data, key]);
  useEffect(() => {
    if (dialog)
      dialogRef.current?.showModal();
    else
      dialogRef.current?.close();
  }, [dialog]);
  function open(value: typeof dialog) {
    setError('');
    setDialog(value);
  }
  function createWorkspace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const team = String(form.get('team') || '').trim();
    const project = String(form.get('project') || '').trim();
    if (!team || !project) {
      setError('Enter a team name and project name.');
      return;
    }
    const members = [...new Set(String(form.get('members') || '').split(',').map(name => name.trim()).filter(Boolean))];
    const entry = {
      id: crypto.randomUUID(), team, project, members
    };
    setData(p => ({
      ...p, workspaces: [...p.workspaces, entry], selectedId: entry.id
    }));
    setFilter('all');
    setDialog(null);
  }
  function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!workspace)
      return;
    const form = new FormData(event.currentTarget);
    const title = String(form.get('title') || '').trim();
    if (!title) {
      setError('Enter a task title.');
      return;
    }
    const task: LocalTask = {
      id: crypto.randomUUID(), workspaceId: workspace.id, title,
      assignee: canAssign ? String(form.get('assignee') || '') : String(user!.id),
      due: String(form.get('due') || ''), status: 'pending'
    };
    setData(p => ({
      ...p, tasks: [...p.tasks, task]
    }));
    setFilter('all');
    setDialog(null);
  }
  function updateTask(id: string, changes: Partial<Pick<LocalTask, 'status' | 'assignee'>>) {
    setData(p => ({
      ...p, tasks: p.tasks.map(t => t.id === id ? {
        ...t, ...changes
      } : t)
    }));
  }
  function deadline(task: LocalTask) {
    if (task.status === 'completed')
      return 'Finished';
    if (!task.due)
      return 'No deadline';
    const today = new Date();
    const [y, m, d] = task.due.split('-').map(Number);
    const days = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) / 86400000);
    return days < 0 ? `${Math.abs(days)} days overdue` : days === 0 ? 'Due today' : `${days} days left`;
  }
  return <main className="tw-page">
  <div className="tw-shell">
 <header className="tw-header">
  <Link to="/dashboard" className="tw-brand">
  <span className="tw-brand-icon">▦</span>
  <span>
  <strong>TeamSpace</strong>
  <small>My tasks / Personal workspace</small>
  </span>
  </Link>
  <span className="tw-active">● Active member</span>
  </header>
 <nav className="tw-nav" aria-label="Workspace navigation">
  <Link to="/dashboard">Overview</Link>
  <Link to="/my-tasks" aria-current={personal ? 'page' : undefined}>My tasks</Link><Link to="/calendar">Calendar</Link>{canAssign && <Link to="/tasks" aria-current={!personal ? 'page' : undefined}>Team tasks</Link>}<button onClick={() => {
      logout();
      navigate('/login');
    }}>Sign out</button>
  </nav>
 <section className="tw-profile">
  <div className="tw-avatar" aria-hidden="true">{initials}</div>
  <div>
  <h1>My Profile</h1>
  <p>{user!.name} · {user!.role.replaceAll('_', ' ')}</p>
  <small>{workspace?.team || 'Create your first workspace'}</small>
  </div>
  <button className="tw-button" onClick={() => open('profile')}>View profile ↗</button>
  </section>
 <section className="tw-stats" aria-label="Your task totals">{[['▤', myTasks.length, 'Assigned'], ['✓', completed, 'Completed'], ['◷', myTasks.length - completed, 'Remaining']].map(([icon, count, label]) => <div className="tw-stat" key={label}>
    <span aria-hidden="true">{icon}</span>
    <strong>{count}</strong>
    <small>{label}</small>
    </div>)}</section>
 <section className="tw-panel">
  <div className="tw-section-heading">
  <h2>My Task Progress</h2>
  <span className="tw-tag">Personal progress</span>
  </div>
  <div className="tw-progress-body">
  <div className="tw-ring" role="progressbar" aria-label="Completed tasks" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} style={{
      background: `conic-gradient(#7862ff ${progress}%, #242429 ${progress}% 100%)`
    }}>
  <div>{progress}%</div>
  </div>
  <div>
  <h3>{completed} of {myTasks.length} tasks completed</h3>
  <p>Your personal progress across assigned tasks.</p>
  <small>{myTasks.length - completed} tasks remaining</small>
  </div>
  </div>
  </section>
 <section className="tw-workspace">
  <div className="tw-section-heading">
  <h2>My Teams & Projects</h2>
  <button className="tw-text-button" onClick={() => open('workspace')}>+ Add workspace</button>
  </div>
  <label className="tw-sr-only" htmlFor="workspace">Switch team and project</label>
  <select id="workspace" className="tw-select" value={workspace?.id || ''} disabled={!data.workspaces.length} onChange={e => {
      setData(p => ({
        ...p, selectedId: e.target.value
      }));
      setFilter('all');
    }}>{!data.workspaces.length && <option value="">No workspaces yet</option>}{data.workspaces.map(w => <option key={w.id} value={w.id}>{w.team} — {w.project}</option>)}</select>
  <p>Switch workspace to see its tasks and your progress.</p>
  </section>
 <section>
  <div className="tw-section-heading">
  <div>
  <h2>{personal ? 'My Assigned Tasks' : 'Team Tasks'}</h2>
  <p>{workspace?.project || 'Start by creating a team and project.'}</p>
  </div>
  <button className="tw-button tw-primary" disabled={!workspace} onClick={() => open('task')}>+ Create task</button>
  </div>
  <div className="tw-filters" aria-label="Filter tasks">{(['all', 'pending', 'in_progress', 'completed'] as const).map(s => <button key={s} aria-pressed={filter === s} onClick={() => setFilter(s)}>{s === 'all' ? 'All tasks' : statuses[s]}</button>)}</div>
 <div className="tw-table-scroll">
  <table>
  <thead>
  <tr>
  <th>Task</th>{!personal && <th>Assigned to</th>}<th>Status</th>
  <th>Due</th>
  <th>Remaining</th>
  </tr>
  </thead>
  <tbody>{visible.map(task => <tr key={task.id}>
    <td>
    <strong>{task.title}</strong>
    </td>{!personal && <td>{canAssign ? <select aria-label={`Assign ${task.title}`} value={task.assignee} onChange={e => updateTask(task.id, {
            assignee: e.target.value
          })}>
        <option value="">Unassigned</option>
        <option value={String(user!.id)}>{user!.name} (you)</option>{workspace?.members?.map(name => <option key={name} value={`member:${name}`}>{name}</option>)}</select> : user!.name}</td>}<td>
    <select className={`tw-status-${task.status}`} aria-label={`Status of ${task.title}`} value={task.status} onChange={e => updateTask(task.id, {
        status: e.target.value as TaskStatus
      })}>{Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
    </td>
    <td>{task.due ? new Date(`${task.due}T00:00:00`).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric'
      }) : '—'}</td>
    <td>{deadline(task)}</td>
    </tr>)}</tbody>
  </table>
  </div>
 {!visible.length && <div className="tw-empty">
    <span aria-hidden="true">▤</span>
    <h3>{filter === 'all' ? 'A fresh start for your tasks' : 'No tasks with this status'}</h3>
    <p>{!workspace ? 'Add a workspace, then create your first task.' : personal ? 'Tasks assigned to you in this workspace will appear here.' : 'Create a task and assign it to start tracking progress.'}</p>
    </div>}
 </section>{error && !dialog && <p role="alert" className="tw-error">{error}</p>}<footer className="tw-footer">Browser workspace · Saved on this device. Team sharing is not connected yet.</footer>
 </div>
  <dialog ref={dialogRef} className="tw-dialog" onCancel={() => setDialog(null)} onClose={() => setDialog(null)}>
  <div className="tw-section-heading">
  <h2>{dialog === 'profile' ? 'Your profile' : dialog === 'workspace' ? 'Create a workspace' : 'Create a task'}</h2>
  <button className="tw-button" aria-label="Close dialog" onClick={() => setDialog(null)}>✕</button>
  </div>
 {dialog === 'profile' && <div className="tw-profile-details">
    <div className="tw-avatar">{initials}</div>
    <h3>{user!.name}</h3>
    <dl>
    <dt>Email</dt>
    <dd>{user!.email}</dd>
    <dt>User ID</dt>
    <dd>{user!.username}</dd>
    <dt>Role</dt>
    <dd>{user!.role.replaceAll('_', ' ')}</dd>
    <dt>Current team</dt>
    <dd>{workspace?.team || 'No team selected'}</dd>
    <dt>Current project</dt>
    <dd>{workspace?.project || 'No project selected'}</dd>
    </dl>
    </div>}
 {dialog === 'workspace' && <form onSubmit={createWorkspace}>
    <p>Add a team and project to your personal workspace.</p>
    <label>Team name<input name="team" maxLength={100} required autoFocus placeholder="e.g. Development Team"/>
    </label>
    <label>Project name<input name="project" maxLength={100} required placeholder="e.g. TeamSpace"/>
    </label>
    <label>Team members (optional)<input name="members" maxLength={1000} placeholder="Names, separated by commas"/>
    </label>
    <button className="tw-button tw-primary" type="submit">Create workspace</button>
    </form>}
 {dialog === 'task' && <form onSubmit={createTask}>
    <p>{workspace?.team} / {workspace?.project}</p>
    <label>Task title<input name="title" maxLength={200} required autoFocus placeholder="What needs to be done?"/>
    </label>
    <label>Assign to<select name="assignee" defaultValue={String(user!.id)} disabled={!canAssign}>{canAssign && <option value="">Unassigned</option>}<option value={String(user!.id)}>{user!.name} (you)</option>{workspace?.members?.map(name => <option key={name} value={`member:${name}`}>{name}</option>)}</select>
    </label>
    <label>Due date<input name="due" type="date"/>
    </label>
    <button className="tw-button tw-primary" type="submit">Create task</button>
    </form>}{error && <p role="alert" className="tw-error">{error}</p>}</dialog>
  </main>;
}
