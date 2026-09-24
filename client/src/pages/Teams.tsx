import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Layout from '../components/Layout';
import { getTeams, createTeam } from '../services/teamService';
import { getUsers } from '../services/userService';
import type { Team, User } from '../types';

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [newTeamName, setNewTeamName] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setStatus('loading');
    try {
      const [teamData, userData] = await Promise.all([getTeams(), getUsers()]);
      setTeams(teamData);
      setUsers(userData);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!newTeamName.trim()) {
      setFormError('Give the team a name.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      await createTeam(newTeamName.trim());
      setNewTeamName('');
      await load();
    } catch {
      setFormError('Could not create the team. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <h1 className="page-title">Teams</h1>

      <form className="inline-form inline-form--row" onSubmit={handleSubmit}>
        {formError && <p className="form-error">{formError}</p>}
        <label className="field">
          <span>New team name</span>
          <input className="input" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} disabled={submitting} />
        </label>
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? 'Creating…' : 'Add team'}
        </button>
      </form>

      {status === 'loading' && <p className="page-state">Loading teams…</p>}
      {status === 'error' && <p className="page-state page-state--error">Could not load teams. Try refreshing.</p>}
      {status === 'ready' && teams.length === 0 && <p className="page-state">No teams yet.</p>}

      {status === 'ready' && teams.length > 0 && (
        <div className="team-grid">
          {teams.map((team) => (
            <div key={team.id} className="team-card">
              <h3 className="team-card__title">{team.name}</h3>
              <ul className="team-card__members">
                {users
                  .filter((u) => u.teamId === team.id)
                  .map((member) => (
                    <li key={member.id}>{member.name}</li>
                  ))}
                {users.filter((u) => u.teamId === team.id).length === 0 && (
                  <li className="team-card__empty">No members yet</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
