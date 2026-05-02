import { useEffect, useState } from 'react';
import { getTasks, createTask, updateTask, updateTaskStatus, deleteTask, getProjects } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const STATUSES   = ['todo', 'in-progress', 'review', 'completed'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

function statusBadge(s) {
  const map = { todo: 'badge-todo', 'in-progress': 'badge-inprogress', review: 'badge-review', completed: 'badge-completed' };
  return <span className={`badge ${map[s] || 'badge-todo'}`}>{s}</span>;
}
function priorityBadge(p) {
  const map = { low: 'badge-low', medium: 'badge-medium', high: 'badge-high', urgent: 'badge-urgent' };
  return <span className={`badge ${map[p] || 'badge-medium'}`}>{p}</span>;
}

function TaskModal({ token, task, projects, onClose, onSaved }) {
  const editing = !!task;
  const [title, setTitle]         = useState(task?.title || '');
  const [desc, setDesc]           = useState(task?.description || '');
  const [projectId, setProjectId] = useState(task?.project?._id || '');
  const [priority, setPriority]   = useState(task?.priority || 'medium');
  const [status, setStatus]       = useState(task?.status || 'todo');
  const [dueDate, setDueDate]     = useState(task?.dueDate ? task.dueDate.slice(0, 10) : '');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      let res;
      if (editing) {
        res = await updateTask(token, task._id, { title, description: desc, priority, status, dueDate: dueDate || undefined });
        onSaved(res.task || res);
      } else {
        if (!projectId) { setError('Please select a project'); setLoading(false); return; }
        res = await createTask(token, { title, description: desc, projectId, priority, dueDate: dueDate || undefined });
        onSaved(res.task);
      }
      onClose();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{editing ? 'Edit Task' : 'New Task'}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input id="task-modal-title" className="form-input" placeholder="Task title" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea id="task-modal-desc" className="form-textarea" value={desc} onChange={e => setDesc(e.target.value)} />
          </div>
          {!editing && (
            <div className="form-group">
              <label className="form-label">Project *</label>
              <select id="task-modal-project" className="form-select" value={projectId} onChange={e => setProjectId(e.target.value)}>
                <option value="">Select project…</option>
                {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
          )}
          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select id="task-modal-priority" className="form-select" value={priority} onChange={e => setPriority(e.target.value)}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            {editing && (
              <div className="form-group">
                <label className="form-label">Status</label>
                <select id="task-modal-status" className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input id="task-modal-due" type="date" className="form-input" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button id="task-modal-submit" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : editing ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Tasks() {
  const { token } = useAuth();
  const [tasks, setTasks]       = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // Filters
  const [statusFilter, setStatusFilter]     = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchFilter, setSearchFilter]     = useState('');
  const [overdueFilter, setOverdueFilter]   = useState(false);

  // Modal
  const [editTask, setEditTask]   = useState(null);
  const [showModal, setShowModal] = useState(false);

  function load() {
    if (!token) { setLoading(false); return; }
    setLoading(true);
    const params = {};
    if (statusFilter)   params.status = statusFilter;
    if (priorityFilter) params.priority = priorityFilter;
    if (searchFilter)   params.search = searchFilter;
    if (overdueFilter)  params.overdue = true;
    params.assignedTo = 'me';
    Promise.all([
      getTasks(token, params),
      getProjects(token),
    ])
      .then(([taskRes, projRes]) => {
        setTasks(taskRes?.tasks || []);
        setProjects(projRes?.projects || []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  // Initial + filter changes: also fetch all tasks (not just mine) for full view
  function loadAll() {
    if (!token) { setLoading(false); return; }
    setLoading(true);
    const params = {};
    if (statusFilter)   params.status = statusFilter;
    if (priorityFilter) params.priority = priorityFilter;
    if (searchFilter)   params.search = searchFilter;
    if (overdueFilter)  params.overdue = true;
    Promise.all([
      getTasks(token, params),
      getProjects(token),
    ])
      .then(([taskRes, projRes]) => {
        setTasks(taskRes?.tasks || []);
        setProjects(projRes?.projects || []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadAll(); }, [token, statusFilter, priorityFilter, searchFilter, overdueFilter]); // eslint-disable-line

  async function handleDelete(id) {
    if (!confirm('Delete this task?')) return;
    try {
      await deleteTask(token, id);
      setTasks(prev => prev.filter(t => t._id !== id));
    } catch (e) { alert(e.message); }
  }

  async function handleStatusChange(task, newStatus) {
    try {
      const res = await updateTaskStatus(token, task._id, newStatus);
      setTasks(prev => prev.map(t => t._id === task._id ? (res.task || t) : t));
    } catch (e) { alert(e.message); }
  }

  function handleSaved(saved) {
    setTasks(prev => {
      const exists = prev.find(t => t._id === saved._id);
      if (exists) return prev.map(t => t._id === saved._id ? saved : t);
      return [saved, ...prev];
    });
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        {token && (
          <button id="new-task-btn" className="btn btn-primary" onClick={() => { setEditTask(null); setShowModal(true); }}>
            + New Task
          </button>
        )}
      </div>

      <div className="page-body">
        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            id="tasks-search"
            className="form-input"
            style={{ maxWidth: 240 }}
            placeholder="🔍  Search tasks…"
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
          />
          <select id="tasks-status" className="form-select" style={{ maxWidth: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select id="tasks-priority" className="form-select" style={{ maxWidth: 160 }} value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            <option value="">All priorities</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer' }}>
            <input id="tasks-overdue" type="checkbox" checked={overdueFilter} onChange={e => setOverdueFilter(e.target.checked)} />
            Overdue only
          </label>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <div className="empty-title">No tasks found</div>
            <p>Try adjusting filters or create a new task.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Assigned</th>
                  <th>Due</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{t.title}</div>
                      {t.description && (
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {t.description.slice(0, 60)}{t.description.length > 60 ? '…' : ''}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t.project?.name || '—'}</td>
                    <td>
                      <select
                        className="form-select"
                        style={{ fontSize: 12, padding: '4px 8px' }}
                        value={t.status}
                        onChange={e => handleStatusChange(t, e.target.value)}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>{priorityBadge(t.priority)}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {t.assignedTo?.name || t.assignedTo?.email || '—'}
                    </td>
                    <td style={{ fontSize: 13, color: t.isOverdue ? 'var(--danger)' : 'var(--text-muted)' }}>
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
                      {t.isOverdue && ' ⚠'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => { setEditTask(t); setShowModal(true); }}
                        >✏️</button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(t._id)}
                        >🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <TaskModal
          token={token}
          task={editTask}
          projects={projects}
          onClose={() => { setShowModal(false); setEditTask(null); }}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
