import api from './api';
import type { User, Role } from '../types';

export interface CreateUserValues {
  name: string;
  email: string;
  password: string;
  role: Role;
  teamId: number | '';
}

export async function getUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>('/users');
  return data;
}

export async function createUser(values: CreateUserValues): Promise<User> {
  const { data } = await api.post<User>('/users', values);
  return data;
}

export interface UpdateUserValues {
  role?: Role;
  teamId?: number | '';
}

// Admin only: change a user's role and/or team ('' removes them from their team).
export async function updateUser(id: number, values: UpdateUserValues): Promise<User> {
  const { data } = await api.put<User>(`/users/${id}`, values);
  return data;
}
