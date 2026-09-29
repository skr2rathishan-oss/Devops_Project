export type Role = 'admin' | 'team_leader' | 'team_member';

export type TaskStatus = 'pending' | 'in_progress' | 'completed';
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
  createdBy: number;
  dueDate: string | null;
  createdAt: string;
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
