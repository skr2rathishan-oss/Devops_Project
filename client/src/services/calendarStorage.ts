export type CalendarEntry = {
  id: string;
  title: string;
  date: string;
  time: string;
  notes: string;
  kind: 'event' | 'task';
  completed?: boolean;
};

export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function isCalendarDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && dateKey(date) === value;
}

export function monthDays(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, index) => new Date(first.getFullYear(), first.getMonth(), 1 - offset + index));
}

export function readEvents(userId: number): CalendarEntry[] {
  const raw: unknown = JSON.parse(localStorage.getItem(`teamspace-calendar-v1-${userId}`) || '[]');
  if (!Array.isArray(raw) || !raw.every(entry => entry && typeof entry.id === 'string' &&
    typeof entry.title === 'string' && isCalendarDate(entry.date) &&
    typeof entry.time === 'string' && (!entry.time || /^([01]\d|2[0-3]):[0-5]\d$/.test(entry.time)) &&
    typeof entry.notes === 'string' && entry.kind === 'event')) {
    throw new Error('Saved calendar events could not be read.');
  }
  return raw;
}

export function saveEvents(userId: number, events: CalendarEntry[]) {
  localStorage.setItem(`teamspace-calendar-v1-${userId}`, JSON.stringify(events));
}

// Match the per-user workspace used by TaskWorkspace, without changing its data.
export function readWorkspaceDeadlines(userId: number, personal: boolean): CalendarEntry[] {
  const data = JSON.parse(localStorage.getItem(`teamspace-workspaces-v1-${userId}`) || 'null');
  if (data === null) return [];
  if (!Array.isArray(data.tasks) || !Array.isArray(data.workspaces)) {
    throw new Error('Saved workspace tasks could not be read.');
  }
  return data.tasks.filter((task: Record<string, unknown> | null) => task &&
    typeof task.id === 'string' && typeof task.title === 'string' && isCalendarDate(task.due) &&
    (!personal || task.assignee === String(userId)))
    .map((task: { id: string; title: string; due: string; status: string; workspaceId: string }) => {
      const workspace = data.workspaces.find((item: { id: string } | null) => item?.id === task.workspaceId);
      return {
        id: `task-${task.id}`, title: task.title, date: task.due, time: '',
        notes: workspace ? `${workspace.team} / ${workspace.project}` : 'Workspace task',
        kind: 'task' as const, completed: task.status === 'completed',
      };
    });
}
