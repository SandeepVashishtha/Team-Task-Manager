// Base URL: set NEXT_PUBLIC_API_URL in .env.local (e.g. http://localhost:5000/api)
const BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://team-task-manager-backend-express-dxa7e6enc8ddeae4.westindia-01.azurewebsites.net/api').replace(/\/$/, '');

/**
 * Core fetch wrapper — maps to Swagger server definition.
 * Throws on non-2xx; always parses JSON.
 */
export async function apiFetch(path, { token, method = 'GET', body, ...rest } = {}) {
  const headers = { 'Content-Type': 'application/json', ...(rest.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let json;
  try { json = await res.json(); } catch { json = null; }

  if (!res.ok) {
    const err = new Error(json?.message || `API error ${res.status}`);
    err.status = res.status;
    err.json = json;
    throw err;
  }
  return json;
}

// ── Auth ────────────────────────────────────────────────────────────────────
// POST /auth/signup  → { success, token, user }
export const authSignup = (name, email, password, role = 'member') =>
  apiFetch('/auth/signup', { method: 'POST', body: { name, email, password, role } });

// POST /auth/login  → { success, token, user }
export const authLogin = (email, password) =>
  apiFetch('/auth/login', { method: 'POST', body: { email, password } });

// GET /auth/me  → { success, user }
export const authMe = (token) =>
  apiFetch('/auth/me', { token });

// PUT /auth/change-password  → { success, message }
export const authChangePassword = (token, currentPassword, newPassword) =>
  apiFetch('/auth/change-password', { method: 'PUT', token, body: { currentPassword, newPassword } });

// ── Users ───────────────────────────────────────────────────────────────────
// GET /users  → { success, total, page, pages, users[] }
export const getUsers = (token, params = {}) => {
  const q = new URLSearchParams(params).toString();
  return apiFetch('/users' + (q ? `?${q}` : ''), { token });
};

// GET /users/:id  → { success, user }
export const getUserById = (token, id) =>
  apiFetch(`/users/${id}`, { token });

// PUT /users/profile/me  → { success, user }
export const updateMyProfile = (token, data) =>
  apiFetch('/users/profile/me', { method: 'PUT', token, body: data });

// PUT /users/:id/role  → { success, user }
export const updateUserRole = (token, id, role) =>
  apiFetch(`/users/${id}/role`, { method: 'PUT', token, body: { role } });

// DELETE /users/:id  → { success }
export const deactivateUser = (token, id) =>
  apiFetch(`/users/${id}`, { method: 'DELETE', token });

// ── Projects ────────────────────────────────────────────────────────────────
// GET /projects  → { success, total, projects[] }
export const getProjects = (token, params = {}) => {
  const q = new URLSearchParams(params).toString();
  return apiFetch('/projects' + (q ? `?${q}` : ''), { token });
};

// POST /projects  → { success, project }
export const createProject = (token, data) =>
  apiFetch('/projects', { method: 'POST', token, body: data });

// GET /projects/:id  → { success, project, taskStats }
export const getProject = (token, id) =>
  apiFetch(`/projects/${id}`, { token });

// PUT /projects/:id  → { success, project }
export const updateProject = (token, id, data) =>
  apiFetch(`/projects/${id}`, { method: 'PUT', token, body: data });

// DELETE /projects/:id  → { success }
export const deleteProject = (token, id) =>
  apiFetch(`/projects/${id}`, { method: 'DELETE', token });

// POST /projects/:id/members  → { success }
export const addProjectMember = (token, id, userId, role = 'member') =>
  apiFetch(`/projects/${id}/members`, { method: 'POST', token, body: { userId, role } });

// DELETE /projects/:id/members/:userId  → { success }
export const removeProjectMember = (token, id, userId) =>
  apiFetch(`/projects/${id}/members/${userId}`, { method: 'DELETE', token });

// ── Tasks ───────────────────────────────────────────────────────────────────
// GET /tasks  → { success, total, tasks[] }
export const getTasks = (token, params = {}) => {
  const q = new URLSearchParams(params).toString();
  return apiFetch('/tasks' + (q ? `?${q}` : ''), { token });
};

// POST /tasks  → { success, task }
export const createTask = (token, data) =>
  apiFetch('/tasks', { method: 'POST', token, body: data });

// GET /tasks/:id  → { success, task }
export const getTask = (token, id) =>
  apiFetch(`/tasks/${id}`, { token });

// PUT /tasks/:id  → { success, task }
export const updateTask = (token, id, data) =>
  apiFetch(`/tasks/${id}`, { method: 'PUT', token, body: data });

// PATCH /tasks/:id/status  → { success, task }
export const updateTaskStatus = (token, id, status) =>
  apiFetch(`/tasks/${id}/status`, { method: 'PATCH', token, body: { status } });

// DELETE /tasks/:id  → { success }
export const deleteTask = (token, id) =>
  apiFetch(`/tasks/${id}`, { method: 'DELETE', token });

// ── Dashboard ────────────────────────────────────────────────────────────────
// GET /dashboard  → { success, dashboard }
export const getDashboard = (token) =>
  apiFetch('/dashboard', { token });

// ── Health ───────────────────────────────────────────────────────────────────
export const healthCheck = () =>
  apiFetch('/health', {});

export default apiFetch;
