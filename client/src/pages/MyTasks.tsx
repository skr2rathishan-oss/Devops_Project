
import { useState } from "react";
import { Link } from "react-router-dom";
import "./MyTasks.css";

type Status = "To Do" | "In Progress" | "Review" | "Completed";

type Task = {
  id: number;
  title: string;
  project: string;
  team: string;
  status: Status;
  dueDate: string;
};

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Dashboard UI",
    project: "TeamSpace",
    team: "Development Team",
    status: "In Progress",
    dueDate: "2026-10-16",
  },
  {
    id: 2,
    title: "Login Page",
    project: "TeamSpace",
    team: "Development Team",
    status: "Completed",
    dueDate: "2026-10-10",
  },
  {
    id: 3,
    title: "API Testing",
    project: "TeamSpace",
    team: "Development Team",
    status: "To Do",
    dueDate: "2026-10-18",
  },
  {
    id: 4,
    title: "Database Design",
    project: "TeamSpace",
    team: "Development Team",
    status: "Completed",
    dueDate: "2026-10-12",
  },
  {
    id: 5,
    title: "Website Wireframes",
    project: "Website Redesign",
    team: "UI/UX Team",
    status: "In Progress",
    dueDate: "2026-10-20",
  },
];

const teams = ["Development Team", "UI/UX Team"];

function MyTasks() {
  const [selectedTeam, setSelectedTeam] = useState(teams[0]);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const teamTasks = tasks.filter(
    (task) => task.team === selectedTeam
  );

  const total = teamTasks.length;

  const completed = teamTasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const remaining = total - completed;

  const progress =
    total === 0 ? 0 : Math.round((completed / total) * 100);

  const updateStatus = (taskId: number, newStatus: Status) => {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === taskId
          ? { ...task, status: newStatus }
          : task
      )
    );
  };

  const getDaysRemaining = (date: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadline = new Date(`${date}T00:00:00`);

    return Math.round(
      (deadline.getTime() - today.getTime()) / 86400000
    );
  };

  return (
    <div className="mytasks-page">
      <nav className="mytasks-navigation" aria-label="Task navigation">
        <Link className="mytasks-back-link" to="/dashboard">
          <span aria-hidden="true">←</span>
          Back to Dashboard
        </Link>
        <Link className="mytasks-back-link" to="/calendar">Calendar</Link>
      </nav>

      <div className="mytasks-header">
        <div>
          <h1>My Tasks & Progress</h1>
          <p>Manage your work and track your contributions.</p>
        </div>

        <div className="team-selector">
          <label htmlFor="team-select">Current Team</label>

          <select
            id="team-select"
            value={selectedTeam}
            onChange={(event) =>
              setSelectedTeam(event.target.value)
            }
          >
            {teams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section className="mytasks-profile">
        <div className="mytasks-avatar">SR</div>

        <div>
          <h2>Subhashini Ranshika</h2>
          <p>Frontend Developer</p>
          <span>{selectedTeam}</span>
        </div>
      </section>

      <section className="mytasks-stats">
        <div className="mytasks-stat-card">
          <span>Assigned Tasks</span>
          <h2>{total}</h2>
          <p>Tasks assigned to you</p>
        </div>

        <div className="mytasks-stat-card">
          <span>Completed Tasks</span>
          <h2>{completed}</h2>
          <p>Successfully finished</p>
        </div>

        <div className="mytasks-stat-card">
          <span>Remaining Tasks</span>
          <h2>{remaining}</h2>
          <p>Still to complete</p>
        </div>
      </section>

      <section className="mytasks-progress-card">
        <div>
          <h2>My Progress</h2>
          <p>Task completion in {selectedTeam}</p>
        </div>

        <div
          className="mytasks-progress-circle"
          style={{
            background: `conic-gradient(
              #4f46e5 ${progress}%,
              #e5e7eb ${progress}%
            )`,
          }}
        >
          <div className="mytasks-progress-inner">
            <strong>{progress}%</strong>
            <span>Completed</span>
          </div>
        </div>

        <p>
          {completed} of {total} tasks completed
        </p>
      </section>

      <section className="mytasks-table-card">
        <h2>My Assigned Tasks</h2>

        <div className="mytasks-table-wrapper">
          <table className="mytasks-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Status</th>
                <th>Deadline</th>
                <th>Remaining Days</th>
              </tr>
            </thead>

            <tbody>
              {teamTasks.map((task) => {
                const days = getDaysRemaining(task.dueDate);

                return (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td>{task.project}</td>

                    <td>
                      <select
                        value={task.status}
                        onChange={(event) =>
                          updateStatus(
                            task.id,
                            event.target.value as Status
                          )
                        }
                      >
                        <option>To Do</option>
                        <option>In Progress</option>
                        <option>Review</option>
                        <option>Completed</option>
                      </select>
                    </td>

                    <td>{task.dueDate}</td>

                    <td>
                      {task.status === "Completed"
                        ? "Finished"
                        : days < 0
                        ? `${Math.abs(days)} days overdue`
                        : days === 0
                        ? "Due today"
                        : `${days} days left`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {teamTasks.length === 0 && (
          <p>No tasks assigned in this team.</p>
        )}
      </section>
    </div>
  );
}

export default MyTasks;
