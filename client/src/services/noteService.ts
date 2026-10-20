import api from './api';
import type { Note } from '../types';

export async function getMyNote(): Promise<Note> {
  const { data } = await api.get<Note>('/notes/me');
  return data;
}

export async function saveMyNote(content: string): Promise<Note> {
  const { data } = await api.put<Note>('/notes/me', { content });
  return data;
}
