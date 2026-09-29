import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import { useAuth } from '../context/AuthContext';
import { getTasks, createTask, updateTask, deleteTask } from '../services/taskService';
import { getUsers } from '../services/userService';
import type { Task, TaskFormValues, User } from '../types';

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function loadTasks() {
    setStatus('loading');
    try {
      const [taskData, userData] = await Promise.all([getTasks(), getUsers()]);
      setTasks(taskData);
      setUsers(userData);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  function openCreateForm() {
    setEditingTask(null);
    setShowForm(true);
  }

  function openEditForm(task: Task) {
    setEditingTask(task);
    setShowForm(true);
  }

  async function handleSubmit(values: TaskFormValues) {
    if (editingTask) {
      await updateTask(editingTask.id, values);
    } else {
      await createTask(values);
    }
    setShowForm(false);
    await loadTasks();
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this task?')) return;
    await deleteTask(id);
    await loadTasks();
  }

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Tasks</h1>
        <button type="button" className="btn btn--primary" onClick={openCreateForm}>
          New task
        </button>
      </div>

      {status === 'loading' && <p className="page-state">Loading tasks…</p>}
      {status === 'error' && <p className="page-state page-state--error">Could not load tasks. Try refreshing.</p>}
      {status === 'ready' && tasks.length === 0 && <p className="page-state">No tasks yet. Create the first one.</p>}

      {status === 'ready' && tasks.length > 0 && (
        <div className="task-grid">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              role={user!.role}
              onEdit={openEditForm}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal-backdrop">
          <div className="modal">
            <TaskForm
              initialTask={editingTask}
              users={users}
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </Layout>
  );
}
