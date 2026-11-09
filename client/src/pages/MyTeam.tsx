import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { ROLE_LABELS } from '../components/taskMeta';
import { getMyTeam, type MyTeamOverview } from '../services/teamService';

type TeamState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; overview: MyTeamOverview };

export default function MyTeam() {
  const [state, setState] = useState<TeamState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    getMyTeam()
      .then((overview) => {
        if (active) setState({ status: 'ready', overview });
      })
      .catch(() => {
        if (active) setState({ status: 'error' });
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  function retry() {
    setState({ status: 'loading' });
    setAttempt((previous) => previous + 1);
  }

  const overview = state.status === 'ready' ? state.overview : null;

  return (
    <Layout>
      <header className="page-header">
        <div>
          <h1 className="page-title">My Team</h1>
          <p className="page-subtitle">See your team and its members.</p>
        </div>
      </header>

      {state.status === 'loading' && <p className="page-state" role="status">Loading your team…</p>}
      {state.status === 'error' && (
        <div className="page-state page-state--error">
          <p role="alert">Could not load your team.</p>
          <button type="button" className="btn btn--primary" onClick={retry}>Try again</button>
        </div>
      )}
      {overview && !overview.team && (
        <p className="page-state">You haven’t been assigned to a team yet.</p>
      )}
      {overview?.team && (
        <section className="team-card" aria-labelledby="team-name">
          <h2 id="team-name" className="team-card__title">{overview.team.name}</h2>
          <h3 className="section-title">Members ({overview.members.length})</h3>
          <ul className="team-card__members">
            {overview.members.map((member) => (
              <li key={member.id}>
                <strong>{member.name}</strong> (@{member.username}) · {ROLE_LABELS[member.role]}
              </li>
            ))}
            {overview.members.length === 0 && <li className="team-card__empty">No members yet.</li>}
          </ul>
        </section>
      )}
    </Layout>
  );
}
