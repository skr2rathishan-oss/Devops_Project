import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Layout from '../components/Layout';
import { getUsers, createUser, updateUser } from '../services/userService';
import type { UpdateUserValues } from '../services/userService';
import { getTeams } from '../services/teamService';
import { getAuthErrorMessage } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import type { User, Team, Role } from '../types';

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'team_leader', label: 'Team Leader' },
  { value: 'team_member', label: 'Team Member' },
];

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user: currentUser } = useAuth();
  const [savingId, setSavingId] = useState<number | null>(null);
  const [rowError, setRowError] = useState('');

  // Saves a role or team change straight away and shows the server's copy of the user.
  async function handleUpdate(target: User, values: UpdateUserValues) {
    setSavingId(target.id);
    setRowError('');
    try {
      const saved = await updateUser(target.id, values);
      setUsers((prev) => prev.map((u) => (u.id === saved.id ? saved : u)));
    } catch (err) {
      setRowError(getAuthErrorMessage(err, `Could not update ${target.name}. Try again.`));
    } finally {
      setSavingId(null);
    }
  }

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('team_member');
  const [teamId, setTeamId] = useState<number | ''>('');

  async function load() {
    setStatus('loading');
    try {
      const [userData, teamData] = await Promise.all([getUsers(), getTeams()]);
      setUsers(userData);
      setTeams(teamData);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setName('');
    setEmail('');
    setPassword('');
    setRole('team_member');
    setTeamId('');
    setFormError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setFormError('Name, email, and password are all required.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      await createUser({ name, email, password, role, teamId });
      resetForm();
      setShowForm(false);
      await load();
    } catch (err) {
      setFormError(getAuthErrorMessage(err, 'Could not create the user. Check the details and try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Users</h1>
        <button type="button" className="btn btn--primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Close' : 'New user'}
        </button>
      </div>

      {showForm && (
        <form className="inline-form" onSubmit={handleSubmit}>
          {formError && <p className="form-error">{formError}</p>}
          <div className="field-row">
            <label className="field">
              <span>Name</span>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} disabled={submitting} />
            </label>
            <label className="field">
              <span>Email</span>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={submitting} />
            </label>
          </div>
          <div className="field-row">
            <label className="field">
              <span>Temporary password</span>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={submitting} />
            </label>
            <label className="field">
              <span>Role</span>
              <select className="input" value={role} onChange={(e) => setRole(e.target.value as Role)} disabled={submitting}>
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="field">
            <span>Team</span>
            <select className="input" value={teamId} onChange={(e) => setTeamId(e.target.value ? Number(e.target.value) : '')} disabled={submitting}>
              <option value="">No team</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create user'}
          </button>
        </form>
      )}

      {status === 'loading' && <p className="page-state">Loading users…</p>}
      {status === 'error' && <p className="page-state page-state--error">Could not load users. Try refreshing.</p>}

      {status === 'ready' && rowError && <p className="form-error" role="alert">{rowError}</p>}

      {status === 'ready' && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Team</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <select
                    className="input"
                    aria-label={`Role of ${u.name}`}
                    value={u.role}
                    // Admins can't demote themselves (the server refuses it too).
                    disabled={savingId === u.id || u.id === currentUser?.id}
                    onChange={(e) => void handleUpdate(u, { role: e.target.value as Role })}
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    className="input"
                    aria-label={`Team of ${u.name}`}
                    value={u.teamId ?? ''}
                    disabled={savingId === u.id}
                    onChange={(e) => void handleUpdate(u, { teamId: e.target.value ? Number(e.target.value) : '' })}
                  >
                    <option value="">No team</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}
