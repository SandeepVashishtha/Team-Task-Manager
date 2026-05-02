import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProjects, createProject } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

function ProjectCard({ project }) {
  const memberCount = project.members?.length || 0;
  const statusLabel = project.status?.replace('-', ' ') || 'active';

  return (
    <Link href={`/projects/${project._id}`} style={{ display: 'block', textDecoration: 'none' }}>
      <div className="card" style={{ cursor: 'pointer', marginBottom: 0 }}>
        {project.status && (
          <div style={{ marginBottom: 10 }}>
            <span className={`badge badge-${project.status === 'on-hold' ? 'onhold' : project.status}`}>{statusLabel}</span>
          </div>
        )}
        <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>{project.name}</h4>
        {project.description && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12 }}>
            {project.description.slice(0, 80)}{project.description.length > 80 ? '...' : ''}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--text-subtle)' }}>group</span>
            <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
          </div>
          {project.deadline && (
            <span style={{ fontSize: 11, color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
              {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
        <div style={{ marginTop: 12, height: 3, background: 'var(--bg-hover)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 2, background: 'var(--accent-light)', width: `${project.progress || Math.floor(Math.random() * 60 + 20)}%`, transition: 'width 0.4s ease' }} />
        </div>
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
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">New Project</div>
          <button className="modal-close" onClick={onClose}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
          </button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project name *</label>
            <input id="proj-name" className="form-input" placeholder="e.g. Brand Identity" value={name} onChange={e => setName(e.target.value)} required />
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
      <main style={{ padding: '0 48px 48px', maxWidth: 1280 }}>
        <section style={{ paddingTop: 16, marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>Projects</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{projects.length} project{projects.length !== 1 ? 's' : ''} found</p>
        </section>

        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="topbar-search" style={{ minWidth: 200 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--text-subtle)' }}>search</span>
            <input id="projects-search" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select id="projects-status" className="form-select" style={{ maxWidth: 160, padding: '8px 12px', fontSize: 13 }} value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
            <option value="archived">Archived</option>
          </select>
          {token && (
            <button id="new-project-btn" className="btn btn-primary" onClick={() => setShowModal(true)} style={{ marginLeft: 'auto' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span> New Project
            </button>
          )}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.3, display: 'block', marginBottom: 12 }}>folder_open</span>
            <div className="empty-title">No projects yet</div>
            <p>Create your first project to get started.</p>
            {token && <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowModal(true)}>+ New Project</button>}
          </div>
        ) : (
          <div className="grid-cards">{projects.map(p => <ProjectCard key={p._id} project={p} />)}</div>
        )}
      </main>

      {showModal && <CreateModal token={token} onClose={() => setShowModal(false)} onCreated={p => setProjects(prev => [p, ...prev])} />}
    </>
  );
}
