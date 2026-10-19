import "../App.css";

function Home() {
  const totalTasks = 12;
  const completedTasks = 8;
  const remainingTasks = totalTasks - completedTasks;

  const progress = Math.round(
    (completedTasks / totalTasks) * 100
  );

  return (
    <div className="home-page">

      {/* Welcome Section */}
      <div className="home-header">
        <div>
          <p className="home-small-title">MY WORKSPACE</p>

          <h1>
            Welcome back, Subhashini 👋
          </h1>

          <p>
            Here's an overview of your tasks and project progress.
          </p>
        </div>

        <button className="home-add-task">
          + Add Task
        </button>
      </div>

      {/* Statistics */}
      <div className="home-stats">

        <div className="home-stat-card">
          <div className="stat-icon">📋</div>

          <div>
            <p>My Tasks</p>
            <h2>{totalTasks}</h2>
            <span>Total assigned tasks</span>
          </div>
        </div>

        <div className="home-stat-card">
          <div className="stat-icon">✓</div>

          <div>
            <p>Completed</p>
            <h2>{completedTasks}</h2>
            <span>Tasks completed</span>
          </div>
        </div>

        <div className="home-stat-card">
          <div className="stat-icon">⏳</div>

          <div>
            <p>Remaining</p>
            <h2>{remainingTasks}</h2>
            <span>Tasks remaining</span>
          </div>
        </div>

        <div className="home-stat-card">
          <div className="stat-icon">📅</div>

          <div>
            <p>Due Soon</p>
            <h2>2</h2>
            <span>Next 7 days</span>
          </div>
        </div>

      </div>

      {/* Progress + Deadlines */}
      <div className="home-middle">

        {/* Progress */}
        <div className="home-panel progress-panel">

          <div className="panel-heading">
            <div>
              <h2>My Progress</h2>
              <p>Your overall task completion</p>
            </div>
          </div>

          <div
            className="progress-circle"
            style={{
              background: `conic-gradient(
                #eb5d39 ${progress * 3.6}deg,
                #e9edf5 0deg
              )`,
            }}
          >
            <div className="progress-circle-inner">
              <strong>{progress}%</strong>
              <span>Completed</span>
            </div>
          </div>

          <h3>
            {completedTasks} of {totalTasks} tasks completed
          </h3>

          <p className="progress-message">
            Keep going! You're making good progress.
          </p>

        </div>

        {/* Upcoming deadlines */}
        <div className="home-panel">

          <div className="panel-heading">
            <div>
              <h2>Upcoming Deadlines</h2>
              <p>Tasks that need your attention</p>
            </div>

            <button>View All</button>
          </div>

          <div className="deadline-item">

            <div className="deadline-icon">📱</div>

            <div className="deadline-info">
              <strong>Dashboard UI</strong>
              <span>Development Project</span>
            </div>

            <div className="deadline-days urgent-days">
              <strong>2</strong>
              <span>days left</span>
            </div>

          </div>

          <div className="deadline-item">

            <div className="deadline-icon">⚙️</div>

            <div className="deadline-info">
              <strong>REST API Testing</strong>
              <span>Development Project</span>
            </div>

            <div className="deadline-days">
              <strong>4</strong>
              <span>days left</span>
            </div>

          </div>

          <div className="deadline-item">

            <div className="deadline-icon">🗄️</div>

            <div className="deadline-info">
              <strong>Database Integration</strong>
              <span>Development Project</span>
            </div>

            <div className="deadline-days">
              <strong>6</strong>
              <span>days left</span>
            </div>

          </div>

        </div>

      </div>

      {/* My Tasks */}
      <div className="home-panel my-task-section">

        <div className="panel-heading">
          <div>
            <h2>My Current Tasks</h2>
            <p>Tasks currently assigned to you</p>
          </div>

          <button>View All Tasks</button>
        </div>

        <div className="home-task-row">

          <div>
            <strong>Dashboard UI</strong>
            <span>Development</span>
          </div>

          <span className="task-status progress-status">
            In Progress
          </span>

          <span className="task-priority high-priority">
            High
          </span>

          <span>📅 Oct 08</span>

          <strong>2 days left</strong>

        </div>

        <div className="home-task-row">

          <div>
            <strong>REST API Testing</strong>
            <span>Development</span>
          </div>

          <span className="task-status todo-status">
            To Do
          </span>

          <span className="task-priority medium-priority">
            Medium
          </span>

          <span>📅 Oct 10</span>

          <strong>4 days left</strong>

        </div>

        <div className="home-task-row">

          <div>
            <strong>Database Integration</strong>
            <span>Development</span>
          </div>

          <span className="task-status review-status">
            Review
          </span>

          <span className="task-priority medium-priority">
            Medium
          </span>

          <span>📅 Oct 12</span>

          <strong>6 days left</strong>

        </div>

      </div>

      {/* Completed Work */}
      <div className="home-panel completed-section">

        <div className="panel-heading">
          <div>
            <h2>Recently Completed</h2>
            <p>Your latest completed work</p>
          </div>
        </div>

        <div className="completed-list">

          <div>
            <span className="complete-check">✓</span>

            <section>
              <strong>Login Page</strong>
              <p>Completed Oct 05</p>
            </section>
          </div>

          <div>
            <span className="complete-check">✓</span>

            <section>
              <strong>Navigation Component</strong>
              <p>Completed Oct 04</p>
            </section>
          </div>

          <div>
            <span className="complete-check">✓</span>

            <section>
              <strong>Authentication Setup</strong>
              <p>Completed Oct 03</p>
            </section>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Home;