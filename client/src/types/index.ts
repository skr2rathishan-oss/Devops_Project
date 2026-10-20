export type Role = 'admin' | 'team_leader' | 'team_member';

export type TaskStatus = 'pending' | 'in_progress' | 'review' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Team {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: Role;
  teamId: number | null;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: number | null;
  assignedToName?: string;
  // Team of the assignee; null when unassigned or the assignee has no team.
  assignedTeamId?: number | null;
  createdBy: number;
  dueDate: string | null;
  createdAt: string;
  // Last change to the row; optional so older API responses still type-check.
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Roles a user can pick for themselves on the register page.
export type SelfRegisterRole = Exclude<Role, 'admin'>;

export interface RegisterValues {
  name: string;
  username: string;
  email: string;
  password: string;
  role: SelfRegisterRole;
}

export interface TaskFormValues {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: number | '';
  dueDate: string;
}

// Dashboard "Quick Notes" (one per user).
export interface Note {
  content: string;
  updatedAt: string | null;
}

// A personal calendar event. `date` is 'YYYY-MM-DD'; `time` is 'HH:MM' or '' for all-day.
export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  notes: string;
}

export type CalendarEventValues = Omit<CalendarEvent, 'id'>;
