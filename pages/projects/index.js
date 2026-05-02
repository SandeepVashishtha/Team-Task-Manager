import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProjects, createProject } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const STATUS_COLORS = {
  active:    'badge-active',
  completed: 'badge-completed',
  'on-hold': 'badge-onhold',
  archived:  'badge-archived',
};

function ProjectCard({ project }) {
  const statusCls = STATUS_COLORS[project.status] || 'badge-active';
  const memberCount = project.members?.length || 0;
  return (
    <Link href={`/projects/${project._id}`} className="card" style={{ display: 'block', cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{project.name}</div>
        <span className={`badge ${statusCls}`}>{project.status}</span>
      </div>
      {project.description && (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>
          {project.description.slice(0, 100)}{project.description.length > 100 ? '…' : ''}
        </p>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--text-muted)' }}>
        <span>👥 {memberCount} member{memberCount !== 1 ? 's' : ''}</span>
        {project.deadline && (
          <span>📅 {new Date(project.deadline).toLocaleDateString()}</span>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 11 }}>
          {new Date(project.createdAt).toLocaleDateString()}
        </span>
      </div>
    </Link>
  );
}

function CreateModal({ token, onClose, onCreated }) {
  const [name, setName]         = useState('');
  const [desc, setDesc]         = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await createProject(token, { name, description: desc, deadline: deadline || undefined });
      onCreated(res.project);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">New Project</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project name *</label>
            <input id="proj-name" className="form-input" placeholder="e.g. Website Redesign" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea id="proj-desc" className="form-textarea" placeholder="What is this project about?" value={desc} onChange={e => setDesc(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Deadline</label>
            <input id="proj-deadline" type="date" className="form-input" value={deadline} onChange={e => setDeadline(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button id="proj-submit" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Projects() {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]  = useState(true);
  const [error, setError]      = useState('');
  const [search, setSearch]    = useState('');
  const [status, setStatus]    = useState('');
  const [showModal, setShowModal] = useState(false);

  function load() {
    if (!token) { setLoading(false); return; }
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (status) params.status = status;
    getProjects(token, params)
      .then(res => setProjects(res?.projects || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [token, search, status]); // eslint-disable-line

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} found</p>
        </div>
        {token && (
          <button id="new-project-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
            + New Project
          </button>
        )}
      </div>

      <div className="page-body">
        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <input
            id="projects-search"
            className="form-input"
            style={{ maxWidth: 260 }}
            placeholder="🔍  Search projects…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select id="projects-status" className="form-select" style={{ maxWidth: 180 }} value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <div className="empty-title">No projects yet</div>
            <p>Create your first project to get started.</p>
            {token && (
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowModal(true)}>
                + New Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid-cards">
            {projects.map(p => <ProjectCard key={p._id} project={p} />)}
          </div>
        )}
      </div>

      {showModal && (
        <CreateModal
          token={token}
          onClose={() => setShowModal(false)}
          onCreated={p => setProjects(prev => [p, ...prev])}
        />
      )}
    </>
  );
}
