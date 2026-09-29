# Local database (MySQL Workbench)

## 1. Start MySQL
Windows: open **Services**, find **MySQL80**, click **Start**.

## 2. Run the scripts in MySQL Workbench
Connect as `root` (the **Local instance MySQL80** connection), then for each file:
**File → Open SQL Script…**, and run it with the lightning-bolt button (Ctrl+Shift+Enter).

| Order | File | What it does |
|---|---|---|
| 1 | `setup_local.sql` | Creates the `app_db` database and the `app_user` login |
| 2 | `init.sql` | Creates the `teams` and `users` tables |
| 3 | `seed.sql` | Optional: adds test accounts |

Click the refresh icon in the **Schemas** panel to see `app_db`.

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
DELETE FROM users WHERE email = 'someone@test.com';   -- remove a test signup
```

To start over: `DROP DATABASE app_db;`, then run steps 1 to 3 again.
