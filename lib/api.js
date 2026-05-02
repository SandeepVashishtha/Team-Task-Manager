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

export const authSignup = (name, email, password, role = 'member') =>
  apiFetch('/auth/signup', { method: 'POST', body: { name, email, password, role } });

export const authLogin = (email, password) =>
  apiFetch('/auth/login', { method: 'POST', body: { email, password } });

export const authMe = (token) =>
  apiFetch('/auth/me', { token });

export const authChangePassword = (token, currentPassword, newPassword) =>
  apiFetch('/auth/change-password', { method: 'PUT', token, body: { currentPassword, newPassword } });


export const getUsers = (token, params = {}) => {
  const q = new URLSearchParams(params).toString();
  return apiFetch('/users' + (q ? `?${q}` : ''), { token });
};

export const getUserById = (token, id) =>
  apiFetch(`/users/${id}`, { token });

export const updateMyProfile = (token, data) =>
  apiFetch('/users/profile/me', { method: 'PUT', token, body: data });

export const updateUserRole = (token, id, role) =>
  apiFetch(`/users/${id}/role`, { method: 'PUT', token, body: { role } });

export const deactivateUser = (token, id) =>
  apiFetch(`/users/${id}`, { method: 'DELETE', token });

export const getProjects = (token, params = {}) => {
  const q = new URLSearchParams(params).toString();
  return apiFetch('/projects' + (q ? `?${q}` : ''), { token });
};

export const createProject = (token, data) =>
  apiFetch('/projects', { method: 'POST', token, body: data });

export const getProject = (token, id) =>
  apiFetch(`/projects/${id}`, { token });

export const updateProject = (token, id, data) =>
  apiFetch(`/projects/${id}`, { method: 'PUT', token, body: data });

export const deleteProject = (token, id) =>
  apiFetch(`/projects/${id}`, { method: 'DELETE', token });

export const addProjectMember = (token, id, userId, role = 'member') =>
  apiFetch(`/projects/${id}/members`, { method: 'POST', token, body: { userId, role } });

export const removeProjectMember = (token, id, userId) =>
  apiFetch(`/projects/${id}/members/${userId}`, { method: 'DELETE', token });

export const getTasks = (token, params = {}) => {
  const q = new URLSearchParams(params).toString();
  return apiFetch('/tasks' + (q ? `?${q}` : ''), { token });
};

export const createTask = (token, data) =>
  apiFetch('/tasks', { method: 'POST', token, body: data });

export const getTask = (token, id) =>
  apiFetch(`/tasks/${id}`, { token });

export const updateTask = (token, id, data) =>
  apiFetch(`/tasks/${id}`, { method: 'PUT', token, body: data });

export const updateTaskStatus = (token, id, status) =>
  apiFetch(`/tasks/${id}/status`, { method: 'PATCH', token, body: { status } });

export const deleteTask = (token, id) =>
  apiFetch(`/tasks/${id}`, { method: 'DELETE', token });


export const getDashboard = (token) =>
  apiFetch('/dashboard', { token });

export const healthCheck = () =>
  apiFetch('/health', {});

export default apiFetch;
