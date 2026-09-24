import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  const links = [{ to: '/dashboard', label: 'Dashboard' }];

  if (user.role === 'admin' || user.role === 'team_leader') {
    links.push({ to: '/tasks', label: 'Tasks' });
  }
  if (user.role === 'team_member') {
    links.push({ to: '/my-tasks', label: 'My Tasks' });
  }
  if (user.role === 'admin') {
    links.push({ to: '/users', label: 'Users' });
    links.push({ to: '/teams', label: 'Teams' });
  }

  return (
    <nav className="sidebar">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => `sidebar__link${isActive ? ' sidebar__link--active' : ''}`}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
