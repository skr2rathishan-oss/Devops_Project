# TeamSpace — Client

React + TypeScript + Vite front end for the team task management system.

## Getting started

```bash
cd client
npm install
cp .env.example .env   # then set VITE_API_BASE_URL if the server is not on localhost:5000
npm run dev
```

The app runs at http://localhost:5173 and talks to the server API at `VITE_API_BASE_URL`
(default `http://localhost:5000/api`).

## Scripts

| Command           | What it does                              |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Start the dev server with hot reload      |
| `npm run build`   | Type-check and build for production (`dist/`) |
| `npm run preview` | Serve the production build locally        |
| `npm run lint`    | Lint the source with oxlint               |

## Routes

| Path        | Access                  |
| ----------- | ----------------------- |
| `/login`    | Public                  |
| `/register` | Public                  |
| `/dashboard`| Any signed-in user      |
| `/tasks`    | Admin, Team Leader      |
| `/my-tasks` | Any signed-in user      |
| `/users`    | Admin                   |
| `/teams`    | Admin                   |

## Personal task workspace

The dashboard retains the original light layout with the Kanban board and sidebars.
Click **My Tasks** in the sidebar (or the main content on mobile) to open the
light interface supplied in `MyTasks.tsx` and `MyTasks.css`. This page uses the
provided sample profile and five sample tasks. The team selector filters the
tasks, and changing a task's status updates totals and progress. Changes on this
sample page reset when it is reloaded or left; it does not use the task API.

The separate Team Tasks page retains the dark TeamSpace interface.
On Team Tasks, choose **Add workspace** to enter a team and project name.
Optional team member names can be entered as a comma-separated list. These are
local assignment labels, not linked user accounts or verified memberships.

Create a task, select its due date, and change its status to To do, In progress,
or Completed. Admins and team leaders can assign tasks to themselves, a member
label, or leave them unassigned. Personal
counts and the progress ring only include tasks assigned to the signed-in user
in the selected workspace. Switching workspaces preserves each project's tasks.
View Profile displays the authenticated user's details and selected workspace.

Workspace data is stored in localStorage separately for each signed-in user on
this browser. It survives refreshes and sign-out but is not synchronized between
accounts, browsers, or devices. Authentication still uses the existing server.
The server currently exposes only authentication routes; shared tasks, membership
authorization, invitations, and project APIs must be implemented before using this
as a shared team management system. Existing `/users` and `/teams` API pages are
separate from this local workspace.

Validation: `npm run build` checks TypeScript and produces the Vite bundle;
`npm run lint` checks the client sources.

## Project structure

```
src/
  components/   Shared UI (layouts, navbar, sidebar, route guard, task card/form)
  context/      AuthContext — current user and login/logout
  pages/        One component per route
  routes/       AppRoutes — all route definitions
  services/     Axios API client and per-resource API calls
  types/        Shared TypeScript types
```
