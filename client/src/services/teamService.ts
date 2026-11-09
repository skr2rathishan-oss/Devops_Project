import api from './api';
import type { Team, User } from '../types';

export type MyTeamOverview = {
  team: Team | null;
  members: Pick<User, 'id' | 'name' | 'username' | 'role'>[];
};

export async function getTeams(): Promise<Team[]> {
  const { data } = await api.get<Team[]>('/teams');
  return data;
}

export async function getMyTeam(): Promise<MyTeamOverview> {
  const { data } = await api.get<MyTeamOverview>('/teams/me');
  return data;
}

export async function createTeam(name: string): Promise<Team> {
  const { data } = await api.post<Team>('/teams', { name });
  return data;
}
