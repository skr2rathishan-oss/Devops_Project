
import { useState, type FormEvent } from "react";

type LoginPageProps = {
  onLogin: (identifier: string, password: string) => void;
  onGoRegister: () => void;
  message: string;
};

export default function LoginPage({
  onLogin,
  onGoRegister,
  message,
}: LoginPageProps) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onLogin(identifier, password);
  }

  return (
    <div className="form-container">

      <p className="eyebrow">WELCOME BACK</p>

      <h1>Sign in</h1>

      <p className="subtitle">
        Sign in to manage your team's tasks.
      </p>

      <form onSubmit={handleSubmit}>

        <div className="form-group">
          <label htmlFor="login-identifier">
            Email or User ID
          </label>

          <input
            id="login-identifier"
            type="text"
            placeholder="Enter your email or User ID"
            value={identifier}
            onChange={(event) =>
              setIdentifier(event.target.value)
            }
            autoComplete="username"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="login-password">
            Password
          </label>

          <input
            id="login-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            autoComplete="current-password"
            required
          />
        </div>

        {message && (
          <p className="form-message" role="status">
            {message}
          </p>
        )}

        <button type="submit" className="primary-button">
          Sign In
        </button>

      </form>

      <p className="switch-text">
        Don't have an account?{" "}
        <button
          type="button"
          className="text-link"
          onClick={onGoRegister}
        >
          Register here
        </button>
      </p>

    </div>
  );
}
