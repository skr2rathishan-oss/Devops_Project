import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyTasks } from '../services/taskService';
import { ROLE_LABELS, canManageTasks, initials, isDueSoon, isOverdue } from './taskMeta';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [alertCount, setAlertCount] = useState(0);

  // The bell's dot means: some of my open tasks are overdue or due within two days.
  useEffect(() => {
    let active = true;
    getMyTasks()
      .then((tasks) => {
        if (active) setAlertCount(tasks.filter((t) => isOverdue(t) || isDueSoon(t, 2)).length);
      })
      .catch(() => {
        /* The dot is a hint only; the pages show their own load errors. */
      });
    return () => {
      active = false;
    };
  }, []);

  const onDashboard = pathname === '/dashboard';
  const search = onDashboard ? (searchParams.get('q') ?? '') : '';

  // Searching filters the dashboard board; from another page it opens the dashboard.
  function handleSearch(value: string) {
    if (onDashboard) {
      const next = new URLSearchParams(searchParams);
      if (value) next.set('q', value);
      else next.delete('q');
      setSearchParams(next, { replace: true });
    } else if (value) {
      navigate(`/dashboard?q=${encodeURIComponent(value)}`);
    }
  }

  // Admins and team leaders add a task; team members (who can't create tasks) add a calendar event.
  function handleQuickAdd() {
    if (user && canManageTasks(user.role)) navigate('/dashboard?new=task');
    else navigate('/calendar?new=event');
  }

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
          aria-label="Search tasks"
          value={search}
          onChange={(event) => handleSearch(event.target.value)}
        />
      </div>

      <div className="nav-actions">
        <button className="quick-add" onClick={handleQuickAdd}>+ Quick Add</button>

        <button
          className="icon-button"
          onClick={() => navigate('/my-tasks')}
          title={
            alertCount
              ? `${alertCount} of your tasks ${alertCount === 1 ? 'is' : 'are'} overdue or due soon`
              : 'No urgent tasks'
          }
          aria-label={alertCount ? `${alertCount} urgent tasks` : 'No urgent tasks'}
        >
          🔔
          {alertCount > 0 && <span className="notification-dot"></span>}
        </button>

        <div className="profile">
          <div className="avatar">{user ? initials(user.name) : ''}</div>

          <div>
            <strong>{user?.name}</strong>
            <span>{user ? ROLE_LABELS[user.role].toLowerCase() : ''}</span>
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
