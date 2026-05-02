# Team Task Manager — Frontend (Next.js)

This repo now contains a frontend scaffold (Next.js + Tailwind) for the Team Task Manager assignment.

Local run:

```bash
# install
npm install

# start dev server
npm run dev
```

Environment:
- Set `NEXT_PUBLIC_API_URL` to your backend base URL (e.g. `https://api.example.com`).

Notes:
- Auth is currently mocked in `pages/auth/*`. When you provide the backend URL and auth endpoints I can wire real login/signup calls.
- Pages added: Home, Dashboard, Projects, Project, Tasks, Teams, Auth (login/signup).
# Team-Task-Manager