import { useEffect, useState } from 'react';
import { getTasks, createTask, updateTask, updateTaskStatus, deleteTask, getProjects } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const STATUSES   = ['todo', 'in-progress', 'review', 'completed'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const STATUS_LABELS = { todo: 'To Do', 'in-progress': 'In Progress', review: 'Review', completed: 'Done' };

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

  // View toggles
  const [view, setView] = useState('kanban'); // 'list' | 'kanban'

  // Filters
  const [statusFilter, setStatusFilter]     = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchFilter, setSearchFilter]     = useState('');
  const [overdueFilter, setOverdueFilter]   = useState(false);

  // Modal
  const [editTask, setEditTask]   = useState(null);
  const [showModal, setShowModal] = useState(false);

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
        const rawTasks = taskRes?.tasks;
        const rawProjects = projRes?.projects;
        setTasks(Array.isArray(rawTasks) ? rawTasks : []);
        setProjects(Array.isArray(rawProjects) ? rawProjects : []);
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

  // Drag handlers for Kanban
  function onDragStart(e, taskId) {
    e.dataTransfer.setData('text/plain', taskId);
  }

  async function onDropToColumn(e, status) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;
    const task = tasks.find(t => t._id === id);
    if (!task) return;
    if (task.status === status) return;
    try {
      const res = await updateTaskStatus(token, id, status);
      setTasks(prev => prev.map(t => t._id === id ? (res.task || t) : t));
    } catch (err) { alert(err.message || 'Unable to move task'); }
  }

  function allowDrop(e) { e.preventDefault(); }

  function handleSaved(saved) {
    setTasks(prev => {
      const exists = prev.find(t => t._id === saved._id);
      if (exists) return prev.map(t => t._id === saved._id ? saved : t);
      return [saved, ...prev];
    });
  }

  const tasksByStatus = STATUSES.reduce((acc, s) => {
    acc[s] = tasks.filter(t => t.status === s);
    return acc;
  }, {});

  const priorityColors = {
    high: 'var(--danger)',
    urgent: '#B91C1C',
    medium: 'var(--warning)',
    low: 'var(--success)',
  };

  return (
    <>
      <main style={{ padding: '0 48px 48px', maxWidth: 1280 }}>
        {/* Header */}
        <section style={{ paddingTop: 16, marginBottom: 24, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <p className="text-label-caps" style={{ color: 'var(--accent)', marginBottom: 4 }}>TASK MANAGEMENT</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 400, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              All Tasks
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              {tasks.length} task{tasks.length !== 1 ? 's' : ''} across your workspace
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* View toggle */}
            <div style={{ display: 'flex', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', padding: 3, gap: 2 }}>
              <button
                className={`btn btn-sm ${view === 'kanban' ? '' : 'btn-ghost'}`}
                onClick={() => setView('kanban')}
                style={view === 'kanban' ? { background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)' } : {}}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>view_column</span>
                Board
              </button>
              <button
                className={`btn btn-sm ${view === 'list' ? '' : 'btn-ghost'}`}
                onClick={() => setView('list')}
                style={view === 'list' ? { background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)' } : {}}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>view_list</span>
                List
              </button>
            </div>
            {token && (
              <button id="new-task-btn" className="btn btn-primary" onClick={() => { setEditTask(null); setShowModal(true); }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                New Task
              </button>
            )}
          </div>
        </section>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="topbar-search" style={{ minWidth: 200 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--text-subtle)' }}>search</span>
            <input
              id="tasks-search"
              placeholder="Search tasks…"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
            />
          </div>
          <select id="tasks-status" className="form-select" style={{ maxWidth: 140, padding: '8px 12px', fontSize: 13 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select id="tasks-priority" className="form-select" style={{ maxWidth: 140, padding: '8px 12px', fontSize: 13 }} value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            <option value="">All priorities</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer' }}>
            <input id="tasks-overdue" type="checkbox" checked={overdueFilter} onChange={e => setOverdueFilter(e.target.checked)} style={{ accentColor: 'var(--accent)' }} />
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
            <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.3, display: 'block', marginBottom: 12 }}>task_alt</span>
            <div className="empty-title">No tasks found</div>
            <p>Try adjusting filters or create a new task.</p>
          </div>
        ) : (
          view === 'kanban' ? (
            /* Kanban View */
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${STATUSES.length}, 1fr)`, gap: 16, alignItems: 'start' }}>
              {STATUSES.map(status => (
                <div key={status} onDrop={e => onDropToColumn(e, status)} onDragOver={allowDrop}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{STATUS_LABELS[status]}</span>
                      <span style={{
                        minWidth: 20, height: 20, borderRadius: 6,
                        background: 'var(--bg-hover)', border: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
                        padding: '0 4px',
                      }}>
                        {tasksByStatus[status].length}
                      </span>
                    </div>
                    <button onClick={() => { setEditTask(null); setShowModal(true); }} style={{
                      width: 22, height: 22, borderRadius: '50%',
                      border: '1px solid var(--border)', background: 'var(--bg-card)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: 'var(--text-subtle)',
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {tasksByStatus[status].map(t => (
                      <div
                        key={t._id}
                        draggable
                        onDragStart={e => onDragStart(e, t._id)}
                        style={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)',
                          padding: 16,
                          marginBottom: 8,
                          cursor: 'grab',
                          transition: 'all 0.2s ease',
                        }}
                        className="card"
                      >
                        {/* Tag + priority */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{
                            padding: '2px 8px', borderRadius: 4,
                            fontSize: 10, fontWeight: 700,
                            background: 'var(--bg-hover)', color: 'var(--text-muted)',
                          }}>
                            {t.project?.name || t.status}
                          </span>
                          {(t.priority === 'high' || t.priority === 'urgent') && (
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: priorityColors[t.priority] }}></span>
                          )}
                        </div>

                        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>{t.title}</h4>

                        {t.description && (
                          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.5 }}>
                            {t.description.slice(0, 60)}{(t.description?.length ?? 0) > 60 ? '…' : ''}
                          </p>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {t.dueDate && (
                              <span style={{ fontSize: 11, color: t.isOverdue ? 'var(--danger)' : 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: 3 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>schedule</span>
                                {new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ padding: 4 }}
                              onClick={() => { setEditTask(t); setShowModal(true); }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span>
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ padding: 4, color: 'var(--danger)' }}
                              onClick={() => handleDelete(t._id)}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
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
                        <div style={{ fontWeight: 600, color: 'var(--text)' }}>{t.title}</div>
                        {t.description && (
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                            {t.description.slice(0, 60)}{(t.description?.length ?? 0) > 60 ? '…' : ''}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t.project?.name || ''}</td>
                      <td>
                        <select
                          className="form-select"
                          style={{ fontSize: 12, padding: '4px 8px', minWidth: 120 }}
                          value={t.status}
                          onChange={e => handleStatusChange(t, e.target.value)}
                        >
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td>
                        <span className={`badge badge-${t.priority}`}>{t.priority}</span>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {t.assignedTo?.name || t.assignedTo?.email || ''}
                      </td>
                      <td style={{ fontSize: 13, color: t.isOverdue ? 'var(--danger)' : 'var(--text-muted)' }}>
                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : ''}
                        {t.isOverdue && ' ⚠'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => { setEditTask(t); setShowModal(true); }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span>
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(t._id)}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </main>

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
