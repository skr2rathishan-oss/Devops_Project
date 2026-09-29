import api from './api';
import type { Team } from '../types';

export async function getTeams(): Promise<Team[]> {
  const { data } = await api.get<Team[]>('/teams');
  return data;
}

export async function createTeam(name: string): Promise<Team> {
  const { data } = await api.post<Team>('/teams', { name });
  return data;
}
