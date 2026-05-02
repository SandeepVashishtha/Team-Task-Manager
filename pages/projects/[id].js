import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getProject,
  updateProject,
  deleteProject,
  getTasks,
  createTask,
  updateTaskStatus,
  addProjectMember,
  removeProjectMember,
  getUsers,
} from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const STATUSES = ['todo', 'in-progress', 'review', 'completed'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const STATUS_LABELS = { todo: '📋 Todo', 'in-progress': '🔄 In Progress', review: '👁 Review', completed: '✅ Done' };

function statusBadge(s) {
  const map = { todo: 'badge-todo', 'in-progress': 'badge-inprogress', review: 'badge-review', completed: 'badge-completed' };
  return <span className={`badge ${map[s] || 'badge-todo'}`}>{s}</span>;
}
function priorityBadge(p) {
  const map = { low: 'badge-low', medium: 'badge-medium', high: 'badge-high', urgent: 'badge-urgent' };
  return <span className={`badge ${map[p] || 'badge-medium'}`}>{p}</span>;
}

function TaskCard({ task, token, onStatusChange }) {
  const [updating, setUpdating] = useState(false);

  async function cycleStatus() {
    const idx = STATUSES.indexOf(task.status);
    const next = STATUSES[(idx + 1) % STATUSES.length];
    setUpdating(true);
    try {
      const res = await updateTaskStatus(token, task._id, next);
      onStatusChange(res.task);
    } catch (e) { alert(e.message); }
    finally { setUpdating(false); }
  }

  return (
    <div className="task-card">
      <div className="task-card-title">{task.title}</div>
      {task.description && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
          {task.description.slice(0, 80)}{task.description.length > 80 ? '…' : ''}
        </p>
      )}
      <div className="task-card-meta">
        {priorityBadge(task.priority)}
        {task.dueDate && (
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            📅 {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
        {task.assignedTo && (
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            👤 {task.assignedTo.name || task.assignedTo.email}
          </span>
        )}
      </div>
      <button
        className="btn btn-ghost btn-sm"
        style={{ marginTop: 8, fontSize: 11, padding: '3px 8px' }}
        onClick={cycleStatus}
        disabled={updating}
      >
        {updating ? '…' : '⟳ Advance'}
      </button>
    </div>
  );
}

function AddTaskModal({ token, projectId, members, onClose, onCreated }) {
  const [title, setTitle]         = useState('');
  const [desc, setDesc]           = useState('');
  const [priority, setPriority]   = useState('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await createTask(token, {
        title, description: desc, projectId,
        priority, dueDate: dueDate || undefined,
        assignedTo: assignedTo || undefined,
      });
      onCreated(res.task);
      onClose();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Add Task</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input id="task-title" className="form-input" placeholder="Task title" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea id="task-desc" className="form-textarea" value={desc} onChange={e => setDesc(e.target.value)} />
          </div>
          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select id="task-priority" className="form-select" value={priority} onChange={e => setPriority(e.target.value)}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input id="task-due" type="date" className="form-input" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Assign to</label>
            <select id="task-assign" className="form-select" value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
              <option value="">Unassigned</option>
              {members.map(m => (
                <option key={m.user?._id || m._id} value={m.user?._id || m._id}>
                  {m.user?.name || m.user?.email || m.name || m.email}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button id="task-submit" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectPage() {
  const router = useRouter();
  const { id } = router.query;
  const { token, role } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [tab, setTab] = useState('kanban'); // kanban | list

  function loadAll() {
    if (!id || !token) return;
    setLoading(true);
    Promise.all([
      getProject(token, id),
      getTasks(token, { projectId: id }),
    ])
      .then(([projRes, taskRes]) => {
        setProject(projRes?.project || projRes);
        setTasks(taskRes?.tasks || []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadAll(); }, [id, token]); // eslint-disable-line

  function handleTaskStatusChange(updatedTask) {
    setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
  }

  function handleTaskCreated(task) {
    setTasks(prev => [task, ...prev]);
  }

  async function handleDeleteProject() {
    if (!confirm(`Delete project "${project?.name}"? This will also delete all its tasks.`)) return;
    try {
      await deleteProject(token, id);
      router.push('/projects');
    } catch (e) { alert(e.message); }
  }

  const tasksByStatus = STATUSES.reduce((acc, s) => {
    acc[s] = tasks.filter(t => t.status === s);
    return acc;
  }, {});

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  );

  return (
    <>
      <div className="page-header">
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
            <Link href="/projects" style={{ color: 'var(--accent)' }}>Projects</Link> / {project?.name}
          </div>
          <h1 className="page-title">{project?.name || 'Project'}</h1>
          {project?.description && (
            <p className="page-subtitle">{project.description}</p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>+ Add Task</button>
          {role === 'admin' && (
            <button className="btn btn-danger" onClick={handleDeleteProject}>🗑 Delete</button>
          )}
        </div>
      </div>

      <div className="page-body">
        {error && <div className="alert alert-error">{error}</div>}

        {/* Project meta */}
        {project && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className={`badge badge-${project.status === 'on-hold' ? 'onhold' : project.status}`}>
                {project.status}
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                👤 Owner: <strong style={{ color: 'var(--text)' }}>{project.owner?.name || project.owner?.email || 'Unknown'}</strong>
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                👥 {project.members?.length || 0} members
              </span>
              {project.deadline && (
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  📅 Deadline: <strong style={{ color: 'var(--warning)' }}>{new Date(project.deadline).toLocaleDateString()}</strong>
                </span>
              )}
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                📋 {tasks.length} tasks
              </span>
            </div>
          </div>
        )}

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
          {[['kanban', '🗂 Kanban'], ['list', '📋 List']].map(([v, label]) => (
            <button
              key={v}
              className={`btn ${tab === v ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setTab(v)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Kanban view */}
        {tab === 'kanban' && (
          <div className="kanban-board">
            {STATUSES.map(s => (
              <div key={s} className="kanban-col">
                <div className="kanban-col-header">
                  <div className="kanban-col-title">
                    {STATUS_LABELS[s]}
                    <span className="kanban-count">{tasksByStatus[s].length}</span>
                  </div>
                </div>
                {tasksByStatus[s].length === 0 ? (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>Empty</p>
                ) : (
                  tasksByStatus[s].map(t => (
                    <TaskCard key={t._id} task={t} token={token} onStatusChange={handleTaskStatusChange} />
                  ))
                )}
              </div>
            ))}
          </div>
        )}

        {/* List view */}
        {tab === 'list' && (
          tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✅</div>
              <div className="empty-title">No tasks yet</div>
              <p>Click &quot;Add Task&quot; to create the first task.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Task</th><th>Status</th><th>Priority</th><th>Assigned</th><th>Due</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(t => (
                    <tr key={t._id}>
                      <td style={{ fontWeight: 500 }}>{t.title}</td>
                      <td>{statusBadge(t.status)}</td>
                      <td>{priorityBadge(t.priority)}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                        {t.assignedTo?.name || t.assignedTo?.email || '—'}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {showTaskModal && (
        <AddTaskModal
          token={token}
          projectId={id}
          members={project?.members || []}
          onClose={() => setShowTaskModal(false)}
          onCreated={handleTaskCreated}
        />
      )}
    </>
  );
}
