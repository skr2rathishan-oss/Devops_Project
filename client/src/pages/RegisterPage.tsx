
import { useState, type FormEvent } from "react";
import type { RegisterValues, SelfRegisterRole } from "../types";

type RegisterPageProps = {
  onRegister: (account: RegisterValues) => Promise<void>;
  onGoLogin: () => void;
  message: string;
};

export default function RegisterPage({
  onRegister,
  onGoLogin,
  message,
}: RegisterPageProps) {

  const [fullname, setFullname] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [role, setRole] =
    useState<SelfRegisterRole>("team_member");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitting(true);
    try {
      await onRegister({
        name: fullname.trim(),
        username: userId.trim(),
        password,
        email: email.trim(),
        role,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="form-container">

      <p className="eyebrow">JOIN OUR TEAM</p>

      <h1>Create an account</h1>

      <p className="subtitle">
        Register to start managing tasks with your team.
      </p>

      <form onSubmit={handleSubmit}>

        <div className="form-group">
          <label htmlFor="register-fullname">
            Full Name
          </label>

          <input
            id="register-fullname"
            type="text"
            placeholder="Enter your full name"
            value={fullname}
            onChange={(event) =>
              setFullname(event.target.value)
            }
            autoComplete="name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="register-userid">
            User ID
          </label>

          <input
            id="register-userid"
            type="text"
            placeholder="Choose a User ID"
            value={userId}
            onChange={(event) =>
              setUserId(event.target.value)
            }
            autoComplete="username"
            pattern="[A-Za-z0-9_.\-]{3,50}"
            title="3-50 characters: letters, numbers, _ . -"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="register-password">
            Password
          </label>

          <input
            id="register-password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            minLength={8}
            autoComplete="new-password"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="register-email">
            Email
          </label>

          <input
            id="register-email"
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            autoComplete="email"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="register-role">
            Role
          </label>

          <select
            id="register-role"
            value={role}
            onChange={(event) =>
              setRole(
                event.target.value as SelfRegisterRole
              )
            }
          >
            <option value="team_member">Team Member</option>
            <option value="team_leader">Team Leader</option>
          </select>
        </div>

        {message && (
          <p className="form-message" role="alert">
            {message}
          </p>
        )}

        <button
          type="submit"
          className="primary-button"
          disabled={submitting}
        >
          {submitting ? "Creating Account…" : "Create Account"}
        </button>

      </form>

      <p className="switch-text">
        Already have an account?{" "}
        <button
          type="button"
          className="text-link"
          onClick={onGoLogin}
        >
          Sign in
        </button>
      </p>

    </div>
  );
}