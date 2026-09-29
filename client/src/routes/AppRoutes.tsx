import { useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

import AuthLayout from "../components/AuthLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";

import LoginPage from "../pages/loginPage";
import RegisterPage from "../pages/RegisterPage";
import Dashboard from "../pages/Dashboard";
import Tasks from "../pages/Tasks";
import MyTasks from "../pages/MyTasks";
import Users from "../pages/Users";
import Teams from "../pages/Teams";

// Wires LoginPage's callbacks to the auth context and the router.
function LoginRoute() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // A message can be handed over from another route, e.g. after registering.
  const notice = (location.state as { message?: string } | null)?.message ?? "";

  async function handleLogin(identifier: string, password: string) {
    try {
      await login(identifier.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Incorrect email or password.");
    }
  }

  return (
    <LoginPage
      onLogin={handleLogin}
      onGoRegister={() => navigate("/register")}
      message={error || notice}
    />
  );
}

function RegisterRoute() {
  const navigate = useNavigate();

  return (
    <RegisterPage
      // TODO: call the server's register endpoint once authService exposes one.
      onRegister={() =>
        navigate("/login", {
          state: { message: "Registration successful! Please sign in." },
        })
      }
      onGoLogin={() => navigate("/login")}
    />
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public pages share the team-photo layout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/register" element={<RegisterRoute />} />
      </Route>

      {/* Signed-in pages */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute allowedRoles={["admin", "team_leader"]}>
            <Tasks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-tasks"
        element={
          <ProtectedRoute allowedRoles={["team_member"]}>
            <MyTasks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teams"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Teams />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
