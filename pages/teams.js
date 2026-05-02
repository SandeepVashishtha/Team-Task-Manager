import { useEffect, useState } from 'react';
import { getUsers, updateUserRole, deactivateUser } from '../lib/api';
import { useAuth } from '../context/AuthContext';

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

export default function Teams() {
  const { token, role: myRole } = useAuth();
  const [users, setUsers]   = useState([]);
  const [total, setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const isAdmin = myRole === 'admin';

  function load() {
    if (!token) { setLoading(false); return; }
    if (!isAdmin) { setLoading(false); setUsers([]); setTotal(0); setError('Admin access required to view users.'); return; }
    setError('');
    setLoading(true);
    const params = {};
    if (search)     params.search = search;
    if (roleFilter) params.role   = roleFilter;
    getUsers(token, params)
      .then(res => {
        setUsers(res?.users || []);
        setTotal(res?.total || 0);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [token, search, roleFilter, isAdmin]); // eslint-disable-line

  async function handleRoleChange(userId, newRole) {
    try {
      const res = await updateUserRole(token, userId, newRole);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (e) { alert(e.message); }
  }

  async function handleDeactivate(userId, name) {
    if (!confirm(`Deactivate user "${name}"?`)) return;
    try {
      await deactivateUser(token, userId);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: false } : u));
    } catch (e) { alert(e.message); }
  }

  return (
    <main style={{ padding: '0 48px 48px', maxWidth: 1280 }}>
      {/* Header */}
      <section style={{ paddingTop: 16, marginBottom: 24 }}>
        <p className="text-label-caps" style={{ color: 'var(--accent)', marginBottom: 4 }}>ORGANIZATION</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 400, color: 'var(--text)', letterSpacing: '-0.02em' }}>
          Team
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          {total} member{total !== 1 ? 's' : ''} in your organisation
        </p>
      </section>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="topbar-search" style={{ minWidth: 200 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--text-subtle)' }}>search</span>
          <input
            id="teams-search"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select id="teams-role" className="form-select" style={{ maxWidth: 140, padding: '8px 12px', fontSize: 13 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.3, display: 'block', marginBottom: 12 }}>group</span>
          <div className="empty-title">No users found</div>
          <p>Try adjusting filters or invite team members.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} style={{ opacity: u.isActive === false ? 0.5 : 1 }}>
                  <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar">{getInitials(u.name || u.email)}</div>
                      <span style={{ fontWeight: 600, color: 'var(--text)' }}>{u.name || ''}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{u.email}</td>
                  <td>
                    {isAdmin ? (
                      <select
                        className="form-select"
                        style={{ fontSize: 12, padding: '4px 8px', maxWidth: 120 }}
                        value={u.role}
                        onChange={e => handleRoleChange(u._id, e.target.value)}
                      >
                        <option value="admin">admin</option>
                        <option value="member">member</option>
                      </select>
                    ) : (
                      <span className={`badge badge-${u.role}`}>{u.role}</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${u.isActive !== false ? 'badge-active' : 'badge-archived'}`}>
                      {u.isActive !== false ? 'active' : 'inactive'}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ''}
                  </td>
                  {isAdmin && (
                    <td>
                      {u.isActive !== false && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeactivate(u._id, u.name || u.email)}
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
