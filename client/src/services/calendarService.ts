import api from './api';
import type { CalendarEvent, CalendarEventValues } from '../types';

export async function getEvents(): Promise<CalendarEvent[]> {
  const { data } = await api.get<CalendarEvent[]>('/events');
  return data;
}

export async function createEvent(values: CalendarEventValues): Promise<CalendarEvent> {
  const { data } = await api.post<CalendarEvent>('/events', values);
  return data;
}

export async function updateEvent(id: number, values: CalendarEventValues): Promise<CalendarEvent> {
  const { data } = await api.put<CalendarEvent>(`/events/${id}`, values);
  return data;
}

export async function deleteEvent(id: number): Promise<void> {
  await api.delete(`/events/${id}`);
}
