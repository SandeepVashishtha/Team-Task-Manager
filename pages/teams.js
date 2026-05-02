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

  function load() {
    if (!token) { setLoading(false); return; }
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

  useEffect(() => { load(); }, [token, search, roleFilter]); // eslint-disable-line

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

  const isAdmin = myRole === 'admin';

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Team</h1>
          <p className="page-subtitle">{total} member{total !== 1 ? 's' : ''} in your organisation</p>
        </div>
      </div>

      <div className="page-body">
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <input
            id="teams-search"
            className="form-input"
            style={{ maxWidth: 260 }}
            placeholder="🔍  Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select id="teams-role" className="form-select" style={{ maxWidth: 160 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
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
            <div className="empty-icon">👥</div>
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
                        <span style={{ fontWeight: 600 }}>{u.name || '—'}</span>
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
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
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
      </div>
    </>
  );
}
