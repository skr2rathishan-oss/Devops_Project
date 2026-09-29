import { Outlet, useLocation, useNavigate } from "react-router-dom";

// Import your team photograph
import teamPhoto from "../assets/teamPhoto.png";

export default function AuthLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="auth-shell">

      {/* LEFT SIDE: TEAM PHOTO */}

      <aside
        className="auth-hero"
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(52, 25, 55, 0.55),
              rgba(52, 25, 55, 0.65)
            ),
            url(${teamPhoto})
          `,
        }}
      >

        {/* Brand */}

        <div className="brand">
          <span className="brand-icon">✓</span>
          <span>TeamSpace</span>
        </div>

        {/* Main heading */}

        <div className="hero-content">

          <p className="hero-tag">
            TEAM TASK MANAGEMENT
          </p>

          <h2>
            Work together.
            <br />
            Achieve more.
          </h2>

          <p className="hero-description">
            Organize tasks, track project progress,
            and collaborate with your team in one place.
          </p>

          {/* Project Overview Card */}

          <div className="preview-card">

            <div className="preview-header">
              <strong>Project Overview</strong>
              <span>● Active</span>
            </div>

            <div className="preview-row">
              <span>Project progress</span>
              <strong>75%</strong>
            </div>

            <div className="progress-track">
              <div className="progress-fill"></div>
            </div>

            <div className="preview-stats">

              <div>
                <strong>12</strong>
                <small>Total Tasks</small>
              </div>

              <div>
                <strong>9</strong>
                <small>Completed</small>
              </div>

              <div>
                <strong>3</strong>
                <small>Pending</small>
              </div>

            </div>

          </div>

        </div>

        <p className="hero-footer">
          Manage your team. Simplify your workflow.
        </p>

      </aside>

      {/* RIGHT SIDE: LOGIN / REGISTER */}

      <main className="auth-panel">

        {/* Navigation */}

        <nav className="auth-nav">

          <button
            className={pathname === "/login" ? "active" : ""}
            onClick={() => navigate("/login")}
          >
            Login
          </button>

          <button
            className={pathname === "/register" ? "active" : ""}
            onClick={() => navigate("/register")}
          >
            Register
          </button>

        </nav>

        {/* Display selected page */}

        <Outlet />

      </main>

    </div>
  );
}
