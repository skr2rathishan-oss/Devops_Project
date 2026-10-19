import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="navbar">
      <div className="brand">
        <div className="logo">T</div>

        <div>
          <h2>TeamSpace</h2>
          <span>Development Workspace</span>
        </div>
      </div>

      <div className="search-container">
        <span>⌕</span>

        <input
          type="text"
          placeholder="Search tasks, projects or team members..."
        />
      </div>

      <div className="nav-actions">
        <button className="quick-add">+ Quick Add</button>

        <button className="icon-button">
          🔔
          <span className="notification-dot"></span>
        </button>

        <div className="profile">
          <div className="avatar">
            {user?.name
              .split(' ')
              .map((part) => part[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>

          <div>
            <strong>{user?.name}</strong>
            <span>{user?.role.replace('_', ' ')}</span>
          </div>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          Back to login
        </button>
      </div>
    </header>
  );
}

export default Navbar;