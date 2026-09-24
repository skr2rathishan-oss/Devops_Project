import api from './api';
import type { Task, TaskFormValues, TaskStatus } from '../types';

export async function getTasks(): Promise<Task[]> {
  const { data } = await api.get<Task[]>('/tasks');
  return data;
}

export async function getMyTasks(): Promise<Task[]> {
  const { data } = await api.get<Task[]>('/tasks/mine');
  return data;
}

export async function createTask(values: TaskFormValues): Promise<Task> {
  const { data } = await api.post<Task>('/tasks', values);
  return data;
}

export async function updateTask(id: number, values: TaskFormValues): Promise<Task> {
  const { data } = await api.put<Task>(`/tasks/${id}`, values);
  return data;
}

export async function updateTaskStatus(id: number, status: TaskStatus): Promise<Task> {
  const { data } = await api.put<Task>(`/tasks/${id}`, { status });
  return data;
}

export async function deleteTask(id: number): Promise<void> {
  await api.delete(`/tasks/${id}`);
}
