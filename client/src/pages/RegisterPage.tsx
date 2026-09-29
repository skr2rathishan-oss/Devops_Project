
import { useState, type FormEvent } from "react";

export type Registration = {
  fullname: string;
  userId: string;
  password: string;
  email: string;
  role: "Member" | "Team Leader";
};

type RegisterPageProps = {
  onRegister: (account: Registration) => void;
  onGoLogin: () => void;
};

export default function RegisterPage({
  onRegister,
  onGoLogin,
}: RegisterPageProps) {

  const [fullname, setFullname] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const [role, setRole] =
    useState<Registration["role"]>("Member");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onRegister({
      fullname: fullname.trim(),
      userId: userId.trim(),
      password,
      email: email.trim(),
      role,
    });
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
                event.target.value as Registration["role"]
              )
            }
          >
            <option value="Member">Team Member</option>
            <option value="Team Leader">Team Leader</option>
          </select>
        </div>

        <button type="submit" className="primary-button">
          Create Account
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