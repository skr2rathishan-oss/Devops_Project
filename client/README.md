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
| `/my-tasks` | Team Member             |
| `/users`    | Admin                   |
| `/teams`    | Admin                   |

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
