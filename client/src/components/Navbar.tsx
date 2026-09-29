import { useAuth } from '../context/AuthContext';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  team_leader: 'Team Leader',
  team_member: 'Team Member',
};

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <span className="navbar__title">Team Task Board</span>
      <div className="navbar__user">
        <div className="navbar__identity">
          <span className="navbar__name">{user?.name}</span>
          <span className="navbar__role">{user ? ROLE_LABELS[user.role] : ''}</span>
        </div>
        <button type="button" className="btn btn--ghost" onClick={logout}>
          Log out
        </button>
      </div>
    </header>
  );
}
