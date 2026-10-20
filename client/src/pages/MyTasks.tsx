
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyTasks, updateTaskStatus } from "../services/taskService";
import { getTeams } from "../services/teamService";
import { getAuthErrorMessage } from "../services/authService";
import { ROLE_LABELS, STATUS_ORDER, daysUntilDue, initials } from "../components/taskMeta";
import type { Task, TaskStatus, Team } from "../types";
import "./MyTasks.css";

// The wording this page uses for each status.
const STATUS_TEXT: Record<TaskStatus, string> = {
  pending: "To Do",
  in_progress: "In Progress",
  review: "Review",
  completed: "Completed",
};

function remainingText(task: Task) {
  if (task.status === "completed") return "Finished";
  const days = daysUntilDue(task);
  if (days === null) return "No deadline";
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return "Due today";
  return `${days} days left`;
}

function MyTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    // Teams only name the user's team; the page still works without them.
    Promise.all([getMyTasks(), getTeams().catch(() => [] as Team[])])
      .then(([taskData, teamData]) => {
        if (!active) return;
        setTasks(taskData);
        setTeams(teamData);
        setLoadState("ready");
      })
      .catch((err: unknown) => {
        if (!active) return;
        setMessage(getAuthErrorMessage(err, "Could not load your tasks. Please try again."));
        setLoadState("error");
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  if (!user) return null;

  // Tasks assigned to you always belong to your own team, so the selector shows that team.
  const teamName = teams.find((team) => team.id === user.teamId)?.name ?? "No team";

  const total = tasks.length;
  const completed = tasks.filter((task) => task.status === "completed").length;
  const remaining = total - completed;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  function retry() {
    setMessage("");
    setLoadState("loading");
    setReloadKey((key) => key + 1);
  }

  const updateStatus = async (task: Task, newStatus: TaskStatus) => {
    setSavingId(task.id);
    setMessage("");
    try {
      const updated = await updateTaskStatus(task.id, newStatus);
      setTasks((previous) => previous.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setMessage(getAuthErrorMessage(err, `Could not update "${task.title}". Please try again.`));
    } finally {
      setSavingId(null);
    }
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

          <select id="team-select">
            <option>{teamName}</option>
          </select>
        </div>
      </div>

      <section className="mytasks-profile">
        <div className="mytasks-avatar">{initials(user.name)}</div>

        <div>
          <h2>{user.name}</h2>
          <p>{ROLE_LABELS[user.role].replace(/\b\w/g, (letter) => letter.toUpperCase())}</p>
          <span>{teamName}</span>
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
          <p>Task completion in {teamName}</p>
        </div>

        <div
          className="mytasks-progress-circle"
          style={{
            background: `conic-gradient(
              #e98b26 ${progress}%,
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

        {message && (
          <p role="alert">
            {message}{" "}
            {loadState === "error" && (
              <button type="button" className="mytasks-back-link" onClick={retry}>
                Try again
              </button>
            )}
          </p>
        )}

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
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>{teams.find((team) => team.id === task.assignedTeamId)?.name ?? teamName}</td>

                  <td>
                    <select
                      aria-label={`Status of ${task.title}`}
                      value={task.status}
                      disabled={savingId === task.id}
                      onChange={(event) =>
                        void updateStatus(task, event.target.value as TaskStatus)
                      }
                    >
                      {STATUS_ORDER.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_TEXT[status]}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>{task.dueDate ?? "—"}</td>

                  <td>{remainingText(task)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loadState === "loading" && <p>Loading your tasks…</p>}

        {loadState === "ready" && tasks.length === 0 && (
          <p>No tasks assigned to you yet.</p>
        )}
      </section>
    </div>
  );
}

export default MyTasks;
