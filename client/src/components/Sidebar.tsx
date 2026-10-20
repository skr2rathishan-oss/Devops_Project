import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTeams } from '../services/teamService';
import type { Team } from '../types';
import { BOARD_TAGS, dashboardHref, readBoardFilters } from './boardFilters';

const menuClass = ({ isActive }: { isActive: boolean }) => `menu-item${isActive ? ' active' : ''}`;

function Sidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    let active = true;
    getTeams()
      .then((data) => {
        if (active) setTeams(data);
      })
      .catch(() => {
        /* PROJECTS just stays empty if teams can't be loaded. */
      });
    return () => {
      active = false;
    };
  }, []);

  // Projects, filters and tags filter the dashboard board, so they only show as
  // selected while on the dashboard; from other pages they open it with that filter.
  const params = pathname === '/dashboard' ? searchParams : new URLSearchParams();
  const filters = readBoardFilters(params);
  const isAdmin = user?.role === 'admin';
  const isManager = isAdmin || user?.role === 'team_leader';

  // "Team": admins manage every team; everyone else sees their own team's board.
  function openTeam() {
    if (isAdmin) navigate('/teams');
    else if (user?.teamId) navigate(`/dashboard?team=${user.teamId}`);
  }

  function toggleLink(key: string, value: string, active: boolean) {
    return dashboardHref(params, key, active ? null : value);
  }

  return (
    <aside className="sidebar">
      <nav className="sidebar-menu">
        <NavLink to="/dashboard" end className={menuClass}>
          <span>▦</span>
          Dashboard
        </NavLink>

        <NavLink to="/my-tasks" className={menuClass}>
          <span>✓</span>
          My Tasks
        </NavLink>

        <NavLink to="/calendar" className={menuClass}>
          <span>▣</span>
          Calendar
        </NavLink>

        <button
          className={`menu-item${pathname === '/teams' ? ' active' : ''}`}
          onClick={openTeam}
          disabled={!isAdmin && !user?.teamId}
          title={!isAdmin && !user?.teamId ? 'You are not in a team yet' : undefined}
        >
          <span>♟</span>
          Team
        </button>

        {isManager && (
          <NavLink to="/tasks" className={menuClass}>
            <span>☰</span>
            Team Tasks
          </NavLink>
        )}

        {isAdmin && (
          <NavLink to="/users" className={menuClass}>
            <span>👤</span>
            Users
          </NavLink>
        )}
      </nav>

      <div className="sidebar-section">
        <div className="sidebar-title">
          <span>PROJECTS</span>
          {isAdmin && (
            <button onClick={() => navigate('/teams')} title="Add a team" aria-label="Add a team">
              +
            </button>
          )}
        </div>

        {teams.map((team) => {
          const active = filters.teamId === team.id;
          return (
            <Link
              key={team.id}
              className={`project-item${active ? ' active' : ''}`}
              to={toggleLink('team', String(team.id), active)}
            >
              <span className="project-dot"></span>
              {team.name}
            </Link>
          );
        })}
      </div>

      <div className="sidebar-section">
        <div className="sidebar-title">
          <span>FILTERS</span>
        </div>

        <Link
          className={`filter-item${filters.priority === 'high' ? ' active' : ''}`}
          to={toggleLink('priority', 'high', filters.priority === 'high')}
        >
          🔥 High Priority
        </Link>
        <Link
          className={`filter-item${filters.dueThisWeek ? ' active' : ''}`}
          to={toggleLink('due', 'week', filters.dueThisWeek)}
        >
          📅 Due This Week
        </Link>
        <Link className={`filter-item${filters.mine ? ' active' : ''}`} to={toggleLink('mine', '1', filters.mine)}>
          👤 Assigned to Me
        </Link>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-title">
          <span>TAGS</span>
        </div>

        <div className="tags">
          {BOARD_TAGS.map((tag) => {
            const active = filters.tag === tag.id;
            return (
              <Link key={tag.id} className={active ? 'active' : undefined} to={toggleLink('tag', tag.id, active)}>
                <span>{tag.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
