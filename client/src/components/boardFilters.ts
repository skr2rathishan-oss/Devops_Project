// Dashboard board filters live in the URL (/dashboard?q=…&priority=high…) so the navbar search,
// the sidebar's projects / filters / tags and the Filter panel all drive the same board,
// and a filtered board can be bookmarked or refreshed.
import type { Task } from '../types';
import { PRIORITY_ORDER, STATUS_ORDER, applyTaskFilters, isDueSoon, isOverdue } from './taskMeta';
import type { AssigneeFilter, TaskFilterValues } from './taskMeta';

export type BoardTag = 'urgent' | 'review' | 'frontend' | 'backend';

// The sidebar's TAGS. Tasks have no tag column, so each tag is a rule over real task data.
export const BOARD_TAGS: { id: BoardTag; label: string }[] = [
  { id: 'urgent', label: 'Urgent' },
  { id: 'review', label: 'Review' },
  { id: 'frontend', label: 'Frontend' },
  { id: 'backend', label: 'Backend' },
];

const TAG_KEYWORDS: Record<'frontend' | 'backend', RegExp> = {
  frontend: /\b(front-?end|ui|ux|page|css|react|layout|design)\b/i,
  backend: /\b(back-?end|api|server|database|db|sql|endpoint)\b/i,
};

export interface BoardFilters extends TaskFilterValues {
  teamId: number | null;
  dueThisWeek: boolean;
  mine: boolean;
  tag: BoardTag | null;
}

function parseAssignee(value: string | null): AssigneeFilter {
  if (!value || value === 'all') return 'all';
  if (value === 'unassigned') return 'unassigned';
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : 'all';
}

export function readBoardFilters(params: URLSearchParams): BoardFilters {
  const status = params.get('status');
  const priority = params.get('priority');
  const team = Number(params.get('team'));
  const tag = params.get('tag');
  return {
    search: params.get('q') ?? '',
    status: STATUS_ORDER.find((s) => s === status) ?? 'all',
    priority: PRIORITY_ORDER.find((p) => p === priority) ?? 'all',
    assignee: parseAssignee(params.get('assignee')),
    teamId: Number.isInteger(team) && team > 0 ? team : null,
    dueThisWeek: params.get('due') === 'week',
    mine: params.get('mine') === '1',
    tag: BOARD_TAGS.find((t) => t.id === tag)?.id ?? null,
  };
}

export function hasActiveFilters(f: BoardFilters): boolean {
  return (
    f.search.trim() !== '' ||
    f.status !== 'all' ||
    f.priority !== 'all' ||
    f.assignee !== 'all' ||
    f.teamId !== null ||
    f.dueThisWeek ||
    f.mine ||
    f.tag !== null
  );
}

function matchesTag(task: Task, tag: BoardTag): boolean {
  if (tag === 'urgent') return isOverdue(task) || isDueSoon(task, 2);
  if (tag === 'review') return task.status === 'review';
  return TAG_KEYWORDS[tag].test(`${task.title} ${task.description}`);
}

export function applyBoardFilters(tasks: Task[], f: BoardFilters, userId: number): Task[] {
  return applyTaskFilters(tasks, f).filter((task) => {
    if (f.teamId !== null && task.assignedTeamId !== f.teamId) return false;
    if (f.dueThisWeek && !isDueSoon(task, 7)) return false;
    if (f.mine && task.assignedTo !== userId) return false;
    if (f.tag && !matchesTag(task, f.tag)) return false;
    return true;
  });
}

// Query string for the dashboard with `key` set to `value` (or removed when value is null),
// keeping every other filter. Used by links, so it returns the full "/dashboard?…" path.
export function dashboardHref(current: URLSearchParams, key: string, value: string | null): string {
  const next = new URLSearchParams(current);
  if (value === null) next.delete(key);
  else next.set(key, value);
  const query = next.toString();
  return query ? `/dashboard?${query}` : '/dashboard';
}

// Writes the Filter panel's values back into the URL, keeping the sidebar-only filters.
export function withPanelFilters(current: URLSearchParams, values: TaskFilterValues): URLSearchParams {
  const next = new URLSearchParams(current);
  const set = (key: string, value: string) => (value && value !== 'all' ? next.set(key, value) : next.delete(key));
  set('q', values.search);
  set('status', values.status);
  set('priority', values.priority);
  set('assignee', String(values.assignee));
  return next;
}
