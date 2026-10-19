import { NavLink } from 'react-router-dom';

function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="sidebar-menu">
        <NavLink to="/dashboard" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
          <span>▦</span>
          Dashboard
        </NavLink>

        <NavLink to="/my-tasks" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
          <span>✓</span>
          My Tasks
        </NavLink>

        <NavLink to="/calendar" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
          <span>▣</span>
          Calendar
        </NavLink>

        <button className="menu-item">
          <span>♟</span>
          Team
        </button>
      </nav>

      <div className="sidebar-section">
        <div className="sidebar-title">
          <span>PROJECTS</span>
          <button>+</button>
        </div>

        <button className="project-item">
          <span className="project-dot"></span>
          Development
        </button>

        <button className="project-item">
          <span className="project-dot"></span>
          Marketing
        </button>

        <button className="project-item">
          <span className="project-dot"></span>
          UI/UX Design
        </button>

        <button className="project-item">
          <span className="project-dot"></span>
          Research
        </button>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-title">
          <span>FILTERS</span>
        </div>

        <button className="filter-item">🔥 High Priority</button>
        <button className="filter-item">📅 Due This Week</button>
        <button className="filter-item">👤 Assigned to Me</button>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-title">
          <span>TAGS</span>
        </div>

        <div className="tags">
          <span>Urgent</span>
          <span>Review</span>
          <span>Frontend</span>
          <span>Backend</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
