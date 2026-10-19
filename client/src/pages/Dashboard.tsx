import '../App.css';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import KanbanBoard from '../components/KanbanBoard';
import RightSidebar from '../components/RightSidebar';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="app">
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <main className="main-content">
          <div className="page-heading">
            <div>
              <p className="small-title">WORKSPACE</p>
              <h1>Task Management Dashboard</h1>
              <p className="subtitle">Manage your team's tasks, deadlines and progress.</p>
            </div>
            <button className="add-task-button">+ Add Task</button>
          </div>
          <Link className="dashboard-my-tasks" to="/my-tasks">✓ My Tasks →</Link>
          <div className="section-heading">
            <div>
              <h2>Development Board</h2>
              <p>Track tasks across your current project.</p>
            </div>
            <button className="filter-button">Filter</button>
          </div>
          <KanbanBoard />
        </main>
        <RightSidebar />
      </div>
      <footer className="footer">
        <div><strong>Project Progress</strong><span> 68%</span></div>
        <div className="progress-container"><div className="progress-bar" /></div>
        <div className="footer-links">
          <button>Export Report</button><button>Settings</button><button>Integrations</button>
        </div>
      </footer>
    </div>
  );
}
