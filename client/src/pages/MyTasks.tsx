import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import TaskCard from '../components/TaskCard';
import { useAuth } from '../context/AuthContext';
import { getMyTasks, updateTaskStatus } from '../services/taskService';
import type { Task } from '../types';

export default function MyTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  async function loadTasks() {
    setStatus('loading');
    try {
      setTasks(await getMyTasks());
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function handleStatusChange(id: number, newStatus: Task['status']) {
    await updateTaskStatus(id, newStatus);
    await loadTasks();
  }

  return (
    <Layout>
      <h1 className="page-title">My Tasks</h1>

      {status === 'loading' && <p className="page-state">Loading your tasks…</p>}
      {status === 'error' && <p className="page-state page-state--error">Could not load tasks. Try refreshing.</p>}
      {status === 'ready' && tasks.length === 0 && <p className="page-state">Nothing assigned to you yet.</p>}

      {status === 'ready' && tasks.length > 0 && (
        <div className="task-grid">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              role={user!.role}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </Layout>
  );
}
