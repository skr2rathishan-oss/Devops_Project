import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { dateKey, isCalendarDate, monthDays, readEvents, readWorkspaceDeadlines, saveEvents } from '../services/calendarStorage';
import type { CalendarEntry } from '../services/calendarStorage';
import '../App.css';
import './Calendar.css';

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const longDate = (date: string) => new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
});

export default function Calendar() {
  const { user } = useAuth();
  // Key the state to the signed-in account, including a possible account switch.
  return user ? <UserCalendar key={user.id} userId={user.id} personal={user.role === 'team_member'} /> : null;
}

function UserCalendar({ userId, personal }: { userId: number; personal: boolean }) {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selected, setSelected] = useState(() => dateKey(new Date()));
  const [events, setEvents] = useState<CalendarEntry[]>([]);
  const [tasks, setTasks] = useState<CalendarEntry[]>([]);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [storageReady, setStorageReady] = useState(false);
  const [editing, setEditing] = useState<CalendarEntry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const today = dateKey(new Date());

  useEffect(() => {
    function load() {
      const errors: string[] = [];
      try { setEvents(readEvents(userId)); setStorageReady(true); }
      catch { setStorageReady(false); errors.push('Your saved events could not be loaded. Check browser storage and reload before making changes.'); }
      try { setTasks(readWorkspaceDeadlines(userId, personal)); }
      catch { errors.push('Workspace deadlines could not be loaded. Your personal events are still available.'); }
      setError(errors.join(' '));
    }
    load();
    window.addEventListener('focus', load);
    window.addEventListener('storage', load);
    return () => { window.removeEventListener('focus', load); window.removeEventListener('storage', load); };
  }, [userId, personal]);

  useEffect(() => {
    if (dialogOpen) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [dialogOpen]);

  const allEntries = [...events, ...tasks];
  const visible = allEntries.filter(entry => (filter === 'all' || entry.kind === filter) &&
    `${entry.title} ${entry.notes}`.toLowerCase().includes(query.toLowerCase().trim()))
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time) || a.title.localeCompare(b.title));
  const selectedEntries = visible.filter(entry => entry.date === selected);
  const monthPrefix = dateKey(month).slice(0, 7);
  const monthEntries = visible.filter(entry => entry.date.startsWith(monthPrefix));
  const upcoming = visible.filter(entry => entry.date >= today && !entry.completed).slice(0, 4);

  function selectDate(date: Date) {
    setSelected(dateKey(date));
    setMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  }

  function changeMonth(delta: number) {
    const next = new Date(month.getFullYear(), month.getMonth() + delta, 1);
    selectDate(next);
  }

  function openEvent(entry: CalendarEntry | null = null) {
    setEditing(entry);
    setFormError('');
    setDialogOpen(true);
  }

  function persist(next: CalendarEntry[]) {
    if (!storageReady) {
      setFormError('Your saved events are unavailable. Reload before making changes.');
      return false;
    }
    try {
      saveEvents(userId, next);
      setEvents(next);
      return true;
    } catch {
      setFormError('Could not save changes. Check that browser storage is available and try again.');
      return false;
    }
  }

  function submitEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!storageReady) return;
    const form = new FormData(event.currentTarget);
    const title = String(form.get('title') || '').trim();
    const date = String(form.get('date') || '');
    if (!title || !isCalendarDate(date)) { setFormError('Enter an event title and a valid date.'); return; }
    const entry: CalendarEntry = {
      id: editing?.id ?? crypto.randomUUID(), title, date,
      time: String(form.get('time') || ''), notes: String(form.get('notes') || '').trim(), kind: 'event',
    };
    if (persist(editing ? events.map(item => item.id === editing.id ? entry : item) : [...events, entry])) {
      selectDate(new Date(`${date}T00:00:00`));
      setDialogOpen(false);
    }
  }

  return <div className="app calendar-page">
    <Navbar />
    <div className="calendar-layout">
      <Sidebar />
      <main className="main-content calendar-main">
        <nav className="calendar-mobile-nav" aria-label="Workspace navigation">
          <Link to="/dashboard">Dashboard</Link><Link to="/my-tasks">My Tasks</Link><Link to="/calendar" aria-current="page">Calendar</Link>
        </nav>
        <div className="page-heading">
          <div><p className="small-title">WORKSPACE</p><h1>Calendar</h1><p className="subtitle">Make room for your plans. Keep every deadline in sight.</p></div>
          <button className="add-task-button" disabled={!storageReady} onClick={() => openEvent()}>+ Add Event</button>
        </div>
        {error && <p className="calendar-error" role="alert">{error}</p>}
        <div className="calendar-summary" aria-label="Monthly overview">
          <div><span className="calendar-summary-icon" aria-hidden="true">▦</span><div><strong>{monthEntries.length}</strong><span>Scheduled this month</span></div></div>
          <div><span className="calendar-summary-icon calendar-task-color" aria-hidden="true">✓</span><div><strong>{monthEntries.filter(entry => entry.kind === 'task').length}</strong><span>Task deadlines</span></div></div>
          <div><span className="calendar-summary-icon calendar-event-color" aria-hidden="true">◷</span><div><strong>{monthEntries.filter(entry => entry.kind === 'event').length}</strong><span>Personal events</span></div></div>
        </div>
        <section className="calendar-panel" aria-label="Monthly calendar">
          <div className="calendar-toolbar">
            <div className="calendar-month-controls">
              <h2 aria-live="polite">{month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h2>
              <div className="calendar-arrows"><button aria-label="Previous month" onClick={() => changeMonth(-1)}>‹</button><button aria-label="Next month" onClick={() => changeMonth(1)}>›</button></div>
              <button className="calendar-today" onClick={() => selectDate(new Date())}>Today</button>
            </div>
            <div className="calendar-filters">
              <input aria-label="Search calendar" type="search" placeholder="Search calendar…" value={query} onChange={event => setQuery(event.target.value)} />
              <select aria-label="Filter calendar" value={filter} onChange={event => setFilter(event.target.value)}><option value="all">All scheduled items</option><option value="task">Task deadlines</option><option value="event">Personal events</option></select>
            </div>
          </div>
          <div className="calendar-scroll">
            <div className="calendar-weekdays" aria-hidden="true">{weekdays.map(day => <span key={day}>{day}</span>)}</div>
            <div className="calendar-grid">
              {monthDays(month).map(date => {
                const key = dateKey(date);
                const entries = visible.filter(entry => entry.date === key);
                return <button key={key} className={`calendar-day${date.getMonth() !== month.getMonth() ? ' is-outside' : ''}${key === selected ? ' is-selected' : ''}`}
                  aria-label={`${longDate(key)}${key === today ? ', today' : ''}, ${entries.length} scheduled ${entries.length === 1 ? 'item' : 'items'}`}
                  aria-pressed={key === selected} aria-current={key === today ? 'date' : undefined} onClick={() => selectDate(date)}>
                  <span className={`calendar-day-number${key === today ? ' is-today' : ''}`}>{date.getDate()}</span>
                  <span className="calendar-day-entries">{entries.slice(0, 2).map(entry => <span key={entry.id} className={`calendar-chip ${entry.kind}${entry.completed ? ' is-complete' : ''}`} title={entry.title}>{entry.time && <span>{entry.time} </span>}{entry.title}</span>)}{entries.length > 2 && <span className="calendar-more">+{entries.length - 2} more</span>}</span>
                </button>;
              })}
            </div>
          </div>
          <div className="calendar-legend"><span><i className="calendar-event-dot" />Personal event</span><span><i className="calendar-task-dot" />Task deadline</span><span>Click a date to view its schedule</span></div>
        </section>
        <p className="calendar-storage-note">Events are saved on this device. Deadlines come from your saved {personal ? 'assigned ' : ''}workspace tasks.</p>
      </main>
      <aside className="calendar-agenda" aria-label="Schedule details">
        <p className="small-title">YOUR SCHEDULE</p>
        <h2>{new Date(`${selected}T00:00:00`).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</h2>
        <p className="calendar-agenda-date">{new Date(`${selected}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric' })} · {selectedEntries.length} scheduled</p>
        <div className="calendar-agenda-list" aria-live="polite">
          {selectedEntries.map(entry => <article className={`calendar-agenda-card ${entry.kind}`} key={entry.id}>
            <span className="calendar-entry-type">{entry.kind === 'task' ? 'Task deadline' : entry.time || 'All-day event'}{entry.completed ? ' · Completed' : ''}</span>
            <h3>{entry.title}</h3>{entry.notes && <p>{entry.notes}</p>}
            {entry.kind === 'event' && <button className="calendar-text-button" disabled={!storageReady} onClick={() => openEvent(entry)}>Edit event</button>}
          </article>)}
          {!selectedEntries.length && <div className="calendar-empty"><span aria-hidden="true">▦</span><h3>A little breathing room</h3><p>{query || filter !== 'all' ? 'No items match your filters on this date.' : 'No events or deadlines on this date.'}</p></div>}
        </div>
        <button className="calendar-add-day" disabled={!storageReady} onClick={() => openEvent()}>+ Add event for this day</button>
        <section className="calendar-upcoming"><h3>Coming up</h3>{upcoming.length ? upcoming.map(entry => <button key={entry.id} onClick={() => selectDate(new Date(`${entry.date}T00:00:00`))}><span className={`calendar-upcoming-dot ${entry.kind}`} /><span><strong>{entry.title}</strong><small>{new Date(`${entry.date}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}{entry.time ? ` · ${entry.time}` : ''}</small></span><span aria-hidden="true">›</span></button>) : <p>No upcoming items{query || filter !== 'all' ? ' matching your filters' : ''}.</p>}</section>
      </aside>
    </div>
    <dialog className="calendar-dialog" ref={dialogRef} onCancel={() => setDialogOpen(false)} onClose={() => setDialogOpen(false)}>
      {dialogOpen && <form key={editing?.id ?? selected} onSubmit={submitEvent}>
        <div className="calendar-dialog-heading"><h2>{editing ? 'Edit event' : 'Add event'}</h2><button type="button" aria-label="Close event form" onClick={() => setDialogOpen(false)}>×</button></div>
        <p>Plan a meeting, a reminder, or time to focus.</p>
        <label>Event title<input name="title" required maxLength={200} autoFocus defaultValue={editing?.title ?? ''} placeholder="e.g. Team planning meeting" /></label>
        <div className="calendar-form-row"><label>Date<input type="date" name="date" required min="1900-01-01" max="9999-12-31" defaultValue={editing?.date ?? selected} /></label><label>Time (optional)<input type="time" name="time" defaultValue={editing?.time ?? ''} /></label></div>
        <label>Notes (optional)<textarea name="notes" rows={3} maxLength={2000} defaultValue={editing?.notes ?? ''} placeholder="Add details for this event…" /></label>
        {formError && <p className="calendar-error" role="alert">{formError}</p>}
        <div className="calendar-dialog-actions">{editing && <button className="calendar-delete" type="button" onClick={() => { if (persist(events.filter(entry => entry.id !== editing.id))) setDialogOpen(false); }}>Delete event</button>}<button className="calendar-today" type="button" onClick={() => setDialogOpen(false)}>Cancel</button><button className="add-task-button" type="submit">{editing ? 'Save changes' : 'Create event'}</button></div>
      </form>}
    </dialog>
  </div>;
}
