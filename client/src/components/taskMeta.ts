// Labels and date helpers shared by the dashboard and the team tasks page.
// Statuses and priorities mirror the ENUMs in database/init.sql.
import type { Role, Task, TaskPriority, TaskStatus, User } from '../types';

export const STATUS_ORDER: TaskStatus[] = ['pending', 'in_progress', 'review', 'completed'];
export const PRIORITY_ORDER: TaskPriority[] = ['high', 'medium', 'low'];

// The wording the dashboard design uses for each status.
export const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  completed: 'Done',
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  team_leader: 'Team leader',
  team_member: 'Team member',
};

export function canManageTasks(role: Role): boolean {
  return role === 'admin' || role === 'team_leader';
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

// Today's date as 'YYYY-MM-DD' in the viewer's time zone, comparable with Task.dueDate.
function todayKey(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function dayNumber(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number);
  return Date.UTC(y, m - 1, d) / 86400000;
}

// Whole days from today until the due date (negative = overdue), or null without a due date.
export function daysUntilDue(task: Task): number | null {
  if (!task.dueDate) return null;
  return dayNumber(task.dueDate) - dayNumber(todayKey());
}

export function isOverdue(task: Task): boolean {
  const days = daysUntilDue(task);
  return task.status !== 'completed' && days !== null && days < 0;
}

// Open tasks due between today and `withinDays` days from now.
export function isDueSoon(task: Task, withinDays = 7): boolean {
  const days = daysUntilDue(task);
  return task.status !== 'completed' && days !== null && days >= 0 && days <= withinDays;
}

export function formatDueDate(dueDate: string): string {
  return new Date(`${dueDate}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// "Oct 02", the format the task cards use.
export function formatShortDate(dueDate: string): string {
  return new Date(`${dueDate}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
}

export function describeDeadline(task: Task): string {
  if (task.status === 'completed') return 'Finished';
  const days = daysUntilDue(task);
  if (days === null) return 'No due date';
  if (days < 0) return `${-days} day${days === -1 ? '' : 's'} overdue`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `Due in ${days} days`;
}

export function timeAgo(timestamp: string): string {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(timestamp).getTime()) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(timestamp).toLocaleDateString();
}

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  review: number;
  completed: number;
  overdue: number;
  dueSoon: number;
  progress: number;
}

export function getTaskStats(tasks: Task[]): TaskStats {
  const count = (status: TaskStatus) => tasks.filter((t) => t.status === status).length;
  const completed = count('completed');
  return {
    total: tasks.length,
    pending: count('pending'),
    inProgress: count('in_progress'),
    review: count('review'),
    completed,
    overdue: tasks.filter(isOverdue).length,
    dueSoon: tasks.filter((t) => isDueSoon(t)).length,
    progress: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
  };
}

// Open work first: earliest due date first (no due date last), then higher priority.
export function sortByDueDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.dueDate !== b.dueDate) {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate < b.dueDate ? -1 : 1;
    }
    return PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority);
  });
}

export type AssigneeFilter = 'all' | 'unassigned' | number;

export interface TaskFilterValues {
  search: string;
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  assignee: AssigneeFilter;
}

export const EMPTY_FILTERS: TaskFilterValues = {
  search: '',
  status: 'all',
  priority: 'all',
  assignee: 'all',
};

export function applyTaskFilters(tasks: Task[], filters: TaskFilterValues): Task[] {
  const search = filters.search.trim().toLowerCase();
  return tasks.filter((task) => {
    if (filters.status !== 'all' && task.status !== filters.status) return false;
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    if (filters.assignee === 'unassigned' && task.assignedTo !== null) return false;
    if (typeof filters.assignee === 'number' && task.assignedTo !== filters.assignee) return false;
    if (!search) return true;
    return (
      task.title.toLowerCase().includes(search) ||
      task.description.toLowerCase().includes(search) ||
      (task.assignedToName ?? '').toLowerCase().includes(search)
    );
  });
}

export interface AssigneeOption {
  id: number;
  name: string;
}

// Everyone the viewer can assign to, plus anyone already assigned to a visible task.
export function getAssigneeOptions(tasks: Task[], users: User[]): AssigneeOption[] {
  const byId = new Map<number, string>();
  for (const user of users) byId.set(user.id, user.name);
  for (const task of tasks) {
    if (task.assignedTo !== null && !byId.has(task.assignedTo)) {
      byId.set(task.assignedTo, task.assignedToName ?? `User #${task.assignedTo}`);
    }
  }
  return [...byId].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
}
