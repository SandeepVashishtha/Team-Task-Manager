import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProject, deleteProject, getTasks, createTask, updateProject, addProjectMember, removeProjectMember, getUsers } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const STATUSES = ['todo', 'in-progress', 'review', 'completed'];
const PROJECT_STATUSES = ['active', 'completed', 'on-hold', 'archived'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const STATUS_LABELS = { todo: 'To Do', 'in-progress': 'In Progress', review: 'Review', completed: 'Done' };
const STATUS_ICONS = { todo: 'radio_button_unchecked', 'in-progress': 'autorenew', review: 'visibility', completed: 'check_circle' };

function TaskCard({ task, token, onStatusChange }) {
  return (
    <div className="card" style={{ padding: 16, marginBottom: 10, cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span className={`badge badge-${task.status === 'in-progress' ? 'inprogress' : task.status}`}>{task.status}</span>
        {(task.priority === 'high' || task.priority === 'urgent') && (
          <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--danger)' }}>priority_high</span>
        )}
      </div>
      <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>{task.title}</h4>
      {task.description && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.5 }}>
          {task.description.slice(0, 80)}{task.description.length > 80 ? '...' : ''}
        </p>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        {task.dueDate && (
          <span style={{ fontSize: 11, color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
        {task.assignedTo && (
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>
            {(task.assignedTo.name || task.assignedTo.email || '?').charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}

function AddTaskModal({ token, projectId, members, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await createTask(token, { title, description: desc, projectId, priority, dueDate: dueDate || undefined, assignedTo: assignedTo || undefined });
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
          <button className="modal-close" onClick={onClose}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span></button>
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
                <option key={m.user?._id || m._id} value={m.user?._id || m._id}>{m.user?.name || m.user?.email || m.name || m.email}</option>
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

function EditProjectModal({ token, project, onClose, onSaved }) {
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [status, setStatus] = useState(project?.status || 'active');
  const [deadline, setDeadline] = useState(project?.deadline ? project.deadline.slice(0, 10) : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await updateProject(token, project._id, {
        name,
        description,
        status,
        deadline: deadline || undefined,
      });
      onSaved(res.project || res);
      onClose();
    } catch (err) { setError(err.message || 'Unable to update project'); }
    finally { setLoading(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Edit Project</div>
          <button className="modal-close" onClick={onClose}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span></button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project name *</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                {PROJECT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Deadline</label>
              <input type="date" className="form-input" value={deadline} onChange={e => setDeadline(e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Save changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddMemberModal({ token, projectId, onClose, onAdded }) {
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('member');
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    if (!token) { setUsersLoading(false); return; }
    setUsersLoading(true);
    setUsersError('');
    getUsers(token, { limit: 200 })
      .then(res => {
        if (!mounted) return;
        setUsers(res?.users || []);
      })
      .catch(err => {
        if (!mounted) return;
        setUsersError(err.message || 'Unable to load users');
        setUsers([]);
      })
      .finally(() => { if (mounted) setUsersLoading(false); });
    return () => { mounted = false; };
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await addProjectMember(token, projectId, userId, role);
      onAdded();
      onClose();
    } catch (err) { setError(err.message || 'Unable to add member'); }
    finally { setLoading(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Add Member</div>
          <button className="modal-close" onClick={onClose}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span></button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">User *</label>
            {users.length > 0 ? (
              <select className="form-select" value={userId} onChange={e => setUserId(e.target.value)} required>
                <option value="">Select a user</option>
                {users.map(u => (
                  <option key={u._id} value={u._id}>
                    {u.name || u.email} {u.email ? `(${u.email})` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <input className="form-input" placeholder="Paste user ID" value={userId} onChange={e => setUserId(e.target.value)} required />
            )}
            {usersLoading && (
              <div style={{ fontSize: 12, color: 'var(--text-subtle)', marginTop: 6 }}>
                Loading users...
              </div>
            )}
            {usersError && (
              <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 6 }}>
                {usersError}. You can paste a user ID instead.
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
              <option value="member">member</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={loading}>{loading ? 'Adding…' : 'Add member'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectPage() {
  const router = useRouter();
  const { id } = router.query;
  const { token, role, user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  function loadAll() {
    if (!id || !token) return;
    setLoading(true);
    Promise.all([getProject(token, id), getTasks(token, { projectId: id })])
      .then(([projRes, taskRes]) => { setProject(projRes?.project || projRes); setTasks(taskRes?.tasks || []); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadAll(); }, [id, token]); // eslint-disable-line

  function handleTaskStatusChange(updatedTask) { setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t)); }
  function handleTaskCreated(task) { setTasks(prev => [task, ...prev]); }

  async function handleDeleteProject() {
    if (!confirm(`Delete project "${project?.name}"? This will also delete all its tasks.`)) return;
    try { await deleteProject(token, id); router.push('/projects'); }
    catch (e) { alert(e.message); }
  }

  async function handleRemoveMember(userId, name) {
    if (!confirm(`Remove ${name || 'this member'} from the project?`)) return;
    try {
      await removeProjectMember(token, id, userId);
      loadAll();
    } catch (e) { alert(e.message); }
  }

  const tasksByStatus = STATUSES.reduce((acc, s) => { acc[s] = tasks.filter(t => t.status === s); return acc; }, {});
  const ownerId = project?.owner?._id?.toString() || project?.owner?.toString();
  const myUserId = user?._id?.toString();
  const myMember = project?.members?.find(m => (m.user?._id?.toString() || m._id?.toString()) === myUserId);
  const isOwner = !!myUserId && ownerId === myUserId;
  // Check both context role and user object role to handle stale localStorage
  const isGlobalAdmin = role === 'admin' || user?.role === 'admin';
  const isProjectAdmin = isGlobalAdmin || isOwner || myMember?.role === 'admin';
  // Only the project owner or a global admin can delete (matches backend rule)
  const canDelete = isOwner || isGlobalAdmin;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  return (
    <>
      <main style={{ padding: '0 48px 48px', maxWidth: 1280 }}>
        <section style={{ paddingTop: 16, marginBottom: 32 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Link href="/projects" style={{ color: 'var(--accent)' }}>Projects</Link>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>chevron_right</span>
            {project?.name}
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 8 }}>
            {project?.name || 'Project'}
          </h2>
          {project?.description && <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 600 }}>{project.description}</p>}
        </section>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Project meta */}
        {project && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className={`badge badge-${project.status === 'on-hold' ? 'onhold' : project.status}`}>{project.status}</span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person</span>
                Owner: <strong style={{ color: 'var(--text)' }}>{project.owner?.name || project.owner?.email || 'Unknown'}</strong>
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>group</span>
                {project.members?.length || 0} members
              </span>
              {project.deadline && (
                <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>calendar_today</span>
                  Deadline: <strong style={{ color: 'var(--warning)' }}>{new Date(project.deadline).toLocaleDateString()}</strong>
                </span>
              )}
              <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>assignment</span>
                {tasks.length} tasks
              </span>
              {isProjectAdmin && (
                <button className="btn btn-secondary btn-sm" onClick={() => setShowEditModal(true)}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span>
                  Edit
                </button>
              )}
            </div>
          </div>
        )}

        {project && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Members</h3>
              {isProjectAdmin && (
                <button className="btn btn-primary btn-sm" onClick={() => setShowMemberModal(true)}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>person_add</span>
                  Add member
                </button>
              )}
            </div>
            {(project.members || []).length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No members yet.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                {project.members.map(m => {
                  const u = m.user || m;
                  const isOwner = u?._id && u._id.toString() === ownerId;
                  return (
                    <div key={u?._id || `${u?.email}-${m?.role}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: 12, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{u?.name || u?.email || 'User'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m?.role}{isOwner ? ' • owner' : ''}</div>
                      </div>
                      {isProjectAdmin && !isOwner && (
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleRemoveMember(u._id, u.name || u.email)}>
                          Remove
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Kanban board */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${STATUSES.length}, 1fr)`, gap: 20, alignItems: 'start' }}>
          {STATUSES.map(s => (
            <div key={s}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--text-muted)' }}>{STATUS_ICONS[s]}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{STATUS_LABELS[s]}</span>
                  <span style={{ minWidth: 20, height: 20, borderRadius: 6, background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', padding: '0 4px' }}>
                    {tasksByStatus[s].length}
                  </span>
                </div>
                <button onClick={() => setShowTaskModal(true)} style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-subtle)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {tasksByStatus[s].length === 0 ? (
                  <p style={{ fontSize: 12, color: 'var(--text-subtle)', textAlign: 'center', padding: '24px 0' }}>No tasks</p>
                ) : tasksByStatus[s].map(t => (
                  <TaskCard key={t._id} task={t} token={token} onStatusChange={handleTaskStatusChange} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Actions bar */}
        <div style={{ display: 'flex', gap: 10, marginTop: 32, justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span> Add Task
          </button>
          {canDelete && (
            <button id="delete-project-btn" className="btn btn-danger" onClick={handleDeleteProject}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span> Delete Project
            </button>
          )}
        </div>
      </main>

      {showTaskModal && (
        <AddTaskModal token={token} projectId={id} members={project?.members || []} onClose={() => setShowTaskModal(false)} onCreated={handleTaskCreated} />
      )}
      {showEditModal && project && (
        <EditProjectModal token={token} project={project} onClose={() => setShowEditModal(false)} onSaved={updated => setProject(updated)} />
      )}
      {showMemberModal && project && (
        <AddMemberModal token={token} projectId={id} onClose={() => setShowMemberModal(false)} onAdded={loadAll} />
      )}
    </>
  );
}
