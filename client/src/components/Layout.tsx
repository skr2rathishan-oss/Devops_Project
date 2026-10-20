import type { ReactNode } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import '../App.css';
import './ui.css';

// The dashboard's navbar and sidebar around pages that have no right-hand panel
// (team tasks, users, teams).
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="app">
      <Navbar />
      <div className="dashboard-layout dashboard-layout--no-aside">
        <Sidebar />
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
