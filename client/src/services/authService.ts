import axios from 'axios';
import api from './api';
import type { AuthResponse, RegisterValues, User } from '../types';

// `identifier` is either the email or the User ID.
export async function login(identifier: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', { identifier, password });
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
}

// Creates the account only; the user signs in afterwards.
export async function register(values: RegisterValues): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', values);
  return data;
}

export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem('token');
}

// Prefer the server's message (e.g. "This User ID is already taken").
export function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    if (!error.response) return 'Cannot reach the server. Please try again later.';
    return error.response.data?.message || fallback;
  }
  return fallback;
}
