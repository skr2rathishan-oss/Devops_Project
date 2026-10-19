import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { dateKey, isCalendarDate, monthDays, readEvents, readWorkspaceDeadlines, saveEvents } from '../src/services/calendarStorage.ts';

const storage = new Map();
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
  getItem: key => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
} });
beforeEach(() => storage.clear());

test('month grid spans six complete Monday-first weeks across year boundaries', () => {
  const days = monthDays(new Date(2027, 0, 1));
  assert.equal(days.length, 42);
  assert.equal(dateKey(days[0]), '2026-12-28');
  assert.equal(dateKey(days.at(-1)), '2027-02-07');
  assert.equal(days[0].getDay(), 1);
  assert.equal(days.at(-1).getDay(), 0);
  assert.equal(new Set(days.map(dateKey)).size, 42);
});

test('month grid includes leap day and dates remain local calendar dates', () => {
  assert.ok(monthDays(new Date(2028, 1, 1)).some(day => dateKey(day) === '2028-02-29'));
  assert.equal(dateKey(new Date(2026, 9, 19, 0, 5)), '2026-10-19');
  assert.ok(isCalendarDate('2028-02-29'));
  for (const value of ['2026-02-29', '2026-02-30', '2026-13-01', '2026-1-01', 'invalid', null]) {
    assert.equal(isCalendarDate(value), false);
  }
});

test('events survive a read after saving and remain isolated between accounts', () => {
  const event = { id: 'meeting', title: 'Planning', date: '2026-10-20', time: '09:30', notes: 'Sprint goals', kind: 'event' };
  assert.deepEqual(readEvents(1), []);
  saveEvents(1, [event]);
  assert.deepEqual(readEvents(1), [event]);
  assert.deepEqual(readEvents(2), []);
  saveEvents(1, [{ ...event, title: 'Updated planning', date: '2026-10-21' }]);
  assert.equal(readEvents(1)[0].title, 'Updated planning');
  saveEvents(1, []);
  assert.deepEqual(readEvents(1), []);
});

test('unreadable saved events are rejected without overwriting storage', () => {
  for (const raw of ['bad json', '{}', '[null]', JSON.stringify([{ id: 'bad', title: 'Bad date', date: '2026-02-30', time: '', notes: '', kind: 'event' }])]) {
    storage.set('teamspace-calendar-v1-1', raw);
    assert.throws(() => readEvents(1));
    assert.equal(storage.get('teamspace-calendar-v1-1'), raw);
  }
});

test('workspace deadlines preserve task dates, completion, and personal assignments', () => {
  storage.set('teamspace-workspaces-v1-1', JSON.stringify({
    workspaces: [{ id: 'development', team: 'Development', project: 'TeamSpace' }],
    tasks: [
      { id: 'mine', title: 'Ship calendar', due: '2026-10-19', workspaceId: 'development', assignee: '1', status: 'completed' },
      { id: 'other', title: 'Review', due: '2026-10-20', workspaceId: 'development', assignee: 'member:Alex', status: 'pending' },
      { id: 'undated', title: 'Backlog', due: '', workspaceId: 'development', assignee: '1', status: 'pending' },
      { id: 'invalid', title: 'Invalid date', due: '2026-02-30', assignee: '1' },
      null,
    ],
  }));
  const deadlines = readWorkspaceDeadlines(1, false);
  assert.equal(deadlines.length, 2);
  assert.deepEqual(deadlines[0], { id: 'task-mine', title: 'Ship calendar', date: '2026-10-19', time: '', notes: 'Development / TeamSpace', kind: 'task', completed: true });
  assert.equal(readWorkspaceDeadlines(1, true).length, 1);
  assert.deepEqual(readWorkspaceDeadlines(2, false), []);
  assert.equal(JSON.parse(storage.get('teamspace-workspaces-v1-1')).tasks.length, 5);
});

test('storage write failures propagate so the UI can retain the unsaved form', () => {
  const original = globalThis.localStorage;
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    setItem() { throw new Error('Storage quota exceeded'); },
  } });
  try { assert.throws(() => saveEvents(1, []), /quota/); }
  finally { Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: original }); }
});
