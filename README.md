# Team Task Manager 
A Next.js frontend for a team task and project management application. It provides authenticated screens for dashboard, projects, tasks, teams, and account management, and integrates with a REST API backend.

## Links

- Repository: https://github.com/SandeepVashishtha/Team-Task-Manager
- Live demo: https://team-task-manager-sable.vercel.app/

## Features

- Authentication flow with login and signup
- Role-aware navigation and admin actions
- Project management with members and tasks
- Task management with status and priority
- Dashboard summary and stats
- Teams directory with role management (admin)

## Tech Stack

- Next.js
- React
- Tailwind CSS (utility classes and global styles)
- REST API integration via fetch

## Requirements

- Node.js 18 or newer
- npm 9 or newer

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

Create `.env.local` in the project root:

```
NEXT_PUBLIC_API_URL=https://your-api.example.com/api
```

3. Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## Scripts

- `npm run dev` Start the development server
- `npm run build` Create a production build
- `npm run start` Start the production server
- `npm run lint` Run lint checks

## Project Structure

```
components/    Reusable UI components
context/       Auth context and session state
lib/           API wrapper and helpers
pages/         Next.js routes
styles/        Global styles
```

## Environment Variables

- `NEXT_PUBLIC_API_URL` Base URL for the backend API, including the `/api` suffix.

Example:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Backend Integration

The frontend expects a backend that exposes these endpoints (examples):

- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me`
- `GET /dashboard`
- `GET /projects`, `POST /projects`, `GET /projects/:id`, `PUT /projects/:id`, `DELETE /projects/:id`
- `GET /tasks`, `POST /tasks`, `GET /tasks/:id`, `PUT /tasks/:id`, `PATCH /tasks/:id/status`, `DELETE /tasks/:id`
- `GET /users`, `PUT /users/:id/role`, `DELETE /users/:id`

See [lib/api.js](lib/api.js) for the full list of client calls.

## Roles and Access

- Members can view and manage their own tasks and projects.
- Admins can access team management and broader project controls.
- The UI hides the Teams navigation for members.

## Validation Notes

Signup includes basic password validation (minimum length and required character types) and confirmation matching on the client side.

## Troubleshooting

- 500 errors from `/dashboard` or `/tasks` indicate backend errors. Check server logs for stack traces.
- If authentication fails, verify `NEXT_PUBLIC_API_URL` and backend CORS settings.
- If no data appears, confirm your API base URL includes `/api`.
- For any issues, check browser console for errors and network requests for API responses.
