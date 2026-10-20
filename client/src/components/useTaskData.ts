import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createTask, deleteTask, getMyTasks, getTasks, updateTask, updateTaskStatus } from '../services/taskService';
import { getUsers } from '../services/userService';
import { getAuthErrorMessage } from '../services/authService';
import type { Task, TaskFormValues, TaskStatus, User } from '../types';
import { canManageTasks } from './taskMeta';

export type LoadState = 'loading' | 'ready' | 'error';

type FetchResult = { ok: true; tasks: Task[]; users: User[] } | { ok: false; error: string };

async function fetchTaskData(canManage: boolean): Promise<FetchResult> {
  try {
    const [tasks, users] = await Promise.all([
      canManage ? getTasks() : getMyTasks(),
      // The assignee list is optional; the tasks are still usable without it.
      canManage ? getUsers().catch(() => [] as User[]) : Promise.resolve([] as User[]),
    ]);
    return { ok: true, tasks, users };
  } catch (err) {
    return { ok: false, error: getAuthErrorMessage(err, 'Could not load tasks. Please try again.') };
  }
}

// Loads the tasks the signed-in user may see and keeps them in sync with every change.
// Admins and team leaders get GET /tasks (their whole scope) plus the users they can assign to;
// team members only have GET /tasks/mine.
export function useTaskData() {
  const { user } = useAuth();
  const canManage = user ? canManageTasks(user.role) : false;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');

  const applyResult = useCallback((result: FetchResult) => {
    if (result.ok) {
      setTasks(result.tasks);
      setUsers(result.users);
      setLoadError('');
      setLoadState('ready');
    } else {
      setLoadError(result.error);
      setLoadState('error');
    }
  }, []);

  const reload = useCallback(async () => {
    applyResult(await fetchTaskData(canManage));
  }, [canManage, applyResult]);

  useEffect(() => {
    let active = true;
    void fetchTaskData(canManage).then((result) => {
      if (active) applyResult(result);
    });
    return () => {
      active = false;
    };
  }, [canManage, applyResult]);

  function replaceTask(saved: Task) {
    setTasks((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
  }

  // Errors propagate so the form can show the server's message next to the fields.
  async function saveTask(values: TaskFormValues, id?: number) {
    if (id === undefined) {
      const created = await createTask(values);
      setTasks((prev) => [created, ...prev]);
    } else {
      replaceTask(await updateTask(id, values));
    }
  }

  async function changeStatus(task: Task, status: TaskStatus) {
    if (task.status === status) return;
    setActionError('');
    try {
      replaceTask(await updateTaskStatus(task.id, status));
    } catch (err) {
      setActionError(getAuthErrorMessage(err, `Could not update "${task.title}".`));
    }
  }

  async function removeTask(task: Task) {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
    setActionError('');
    try {
      await deleteTask(task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (err) {
      setActionError(getAuthErrorMessage(err, `Could not delete "${task.title}".`));
    }
  }

  return {
    user,
    canManage,
    tasks,
    users,
    loadState,
    loadError,
    actionError,
    clearActionError: () => setActionError(''),
    reload,
    saveTask,
    changeStatus,
    removeTask,
  };
}
