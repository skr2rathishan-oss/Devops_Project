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
