# Local database (MySQL Workbench)

## 1. Start MySQL
Windows: open **Services**, find **MySQL80**, click **Start**.

## 2. Run the scripts in MySQL Workbench
Connect as `root` (the **Local instance MySQL80** connection), then for each file:
**File → Open SQL Script…**, and run it with the lightning-bolt button (Ctrl+Shift+Enter).

| Order | File | What it does |
|---|---|---|
| 1 | `setup_local.sql` | Creates the `app_db` database and the `app_user` login |
| 2 | `init.sql` | Creates the `teams`, `users`, `tasks`, `notes` and `calendar_events` tables |
| 3 | `seed.sql` | Optional: adds test accounts and sample tasks |

Click the refresh icon in the **Schemas** panel to see `app_db`.

`init.sql` is safe to re-run: on an existing database it only adds the tables that are missing
(e.g. `tasks`). With Docker, the scripts in `database/` only run when the `mysql_data` volume is
empty, so either run `docker compose down -v` (this wipes all data) or run `init.sql` manually.

A database created before the "review" status, Quick Notes and the calendar existed also needs
`migrations/001_review_status_notes_calendar.sql` (safe to re-run, keeps all data).

## 3. Configure and check the server
`server/.env` must have `DB_USER=app_user`, `DB_PASSWORD=app_password`, `DB_NAME=app_db`
(copy `server/.env.example` if the file is missing, and set a long random `JWT_SECRET`).

```
cd server
npm install
npm run db:check
```

## 4. Run the app
```
cd server && npm run dev     # http://localhost:5000
cd client && npm run dev     # http://localhost:5173
```

## Test accounts (from `seed.sql`)
Password for all: `Test@1234`. Log in with either the email or the User ID.

| User ID | Email | Role |
|---|---|---|
| admin | admin@test.com | admin |
| leader | leader@test.com | team_leader |
| member | member@test.com | team_member |

## Useful queries
```sql
USE app_db;
SELECT id, name, username, email, role, team_id, created_at FROM users;
SELECT id, title, status, assigned_to, created_by FROM tasks;
DELETE FROM users WHERE email = 'someone@test.com';   -- remove a test signup
```

A user who created tasks can't be deleted until those tasks are deleted (`created_by` is `ON DELETE RESTRICT`).
Deleting a user who is only assigned tasks leaves those tasks unassigned.

To start over: `DROP DATABASE app_db;`, then run steps 1 to 3 again.
