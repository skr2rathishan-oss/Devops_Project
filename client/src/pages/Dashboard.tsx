import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { getTasks, getMyTasks } from '../services/taskService';
import type { Task } from '../types';

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus('loading');
      try {
        const data = user?.role === 'team_member' ? await getMyTasks() : await getTasks();
        if (!cancelled) {
          setTasks(data);
          setStatus('ready');
        }
      } catch {
        if (!cancelled) setStatus('error');
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.role]);

  const summary = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  return (
    <Layout>
      <h1 className="page-title">Dashboard</h1>

      {status === 'loading' && <p className="page-state">Loading your tasks…</p>}
      {status === 'error' && <p className="page-state page-state--error">Could not load tasks. Try refreshing.</p>}

      {status === 'ready' && (
        <div className="summary-grid">
          <div className="summary-card">
            <span className="summary-card__value">{summary.total}</span>
            <span className="summary-card__label">Total tasks</span>
          </div>
          <div className="summary-card">
            <span className="summary-card__value">{summary.pending}</span>
            <span className="summary-card__label">Pending</span>
          </div>
          <div className="summary-card">
            <span className="summary-card__value">{summary.inProgress}</span>
            <span className="summary-card__label">In progress</span>
          </div>
          <div className="summary-card">
            <span className="summary-card__value">{summary.completed}</span>
            <span className="summary-card__label">Completed</span>
          </div>
        </div>
      )}
    </Layout>
  );
}
