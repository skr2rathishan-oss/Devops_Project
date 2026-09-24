
import { useState } from "react";

import LoginPage from "./pages/loginPage";

import RegisterPage, {
  type Registration,
} from "./pages/RegisterPage";

// Import your team photograph
import teamPhoto from "./assets/teamPhoto.png";

import "./App.css";

type Page = "login" | "register" | "dashboard";

function App() {
  const [page, setPage] = useState<Page>("login");

  // Temporary demo account
  const [account, setAccount] =
    useState<Registration | null>(null);

  const [message, setMessage] = useState("");

  // Registration
  function handleRegister(newAccount: Registration) {
    setAccount(newAccount);

    setMessage(
      "Registration successful! Please sign in."
    );

    setPage("login");
  }

  // Login
  function handleLogin(
    identifier: string,
    password: string
  ) {
    if (account === null) {
      setMessage(
        "No account found. Please register first."
      );
      return;
    }

    const enteredID = identifier.trim().toLowerCase();

    const correctUser =
      enteredID === account.userId.toLowerCase() ||
      enteredID === account.email.toLowerCase();

    const correctPassword =
      password === account.password;

    if (correctUser && correctPassword) {
      setMessage("");
      setPage("dashboard");
    } else {
      setMessage(
        "Incorrect User ID, email, or password."
      );
    }
  }

  // Logout
  function handleLogout() {
    setMessage("You have signed out.");
    setPage("login");
  }

  // Navigation
  function goToLogin() {
    setMessage("");
    setPage("login");
  }

  function goToRegister() {
    setMessage("");
    setPage("register");
  }

  // Temporary Dashboard
  if (page === "dashboard" && account) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-card">

          <p className="eyebrow">
            TEAM TASK MANAGEMENT SYSTEM
          </p>

          <h1>Welcome, {account.fullname}!</h1>

          <p>You have successfully signed in.</p>

          <p>
            Your role: <strong>{account.role}</strong>
          </p>

          <p className="subtitle">
            Your full dashboard will be added next.
          </p>

          <button
            className="primary-button"
            onClick={handleLogout}
          >
            Sign Out
          </button>

        </div>
      </div>
    );
  }

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
            className={page === "login" ? "active" : ""}
            onClick={goToLogin}
          >
            Login
          </button>

          <button
            className={page === "register" ? "active" : ""}
            onClick={goToRegister}
          >
            Register
          </button>

        </nav>

        {/* Display selected page */}

        {page === "login" ? (

          <LoginPage
            onLogin={handleLogin}
            onGoRegister={goToRegister}
            message={message}
          />

        ) : (

          <RegisterPage
            onRegister={handleRegister}
            onGoLogin={goToLogin}
          />

        )}

      </main>

    </div>
  );
}

export default App;