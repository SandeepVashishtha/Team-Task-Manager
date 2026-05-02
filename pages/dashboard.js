import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDashboard } from '../lib/api';
import { useAuth } from '../context/AuthContext';

function StatCard({ icon, iconClass, value, label }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${iconClass}`}>{icon}</div>
      <div>
        <div className="stat-val">{value ?? '—'}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

function statusBadge(s) {
  const map = { todo: 'badge-todo', 'in-progress': 'badge-inprogress', review: 'badge-review', completed: 'badge-completed' };
  return <span className={`badge ${map[s] || 'badge-todo'}`}>{s}</span>;
}

function priorityBadge(p) {
  const map = { low: 'badge-low', medium: 'badge-medium', high: 'badge-high', urgent: 'badge-urgent' };
  return <span className={`badge ${map[p] || 'badge-medium'}`}>{p}</span>;
}

export default function Dashboard() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    let mounted = true;
    getDashboard(token)
      .then(res => { if (mounted) setData(res?.dashboard || null); })
      .catch(e => { if (mounted) setError(e.message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [token]);

  const ov = data?.overview || {};
  const byStatus = data?.tasksByStatus || {};
  const recent = data?.recentTasks || [];
  const upcoming = data?.upcomingDeadlines || [];

  const completedPct = ov.totalTasks
    ? Math.round((ov.completedTasks / ov.totalTasks) * 100)
    : 0;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your team&apos;s progress and tasks</p>
        </div>
        <Link href="/projects" className="btn btn-primary">
          + New Project
        </Link>
      </div>

      <div className="page-body">
        {!token && (
          <div className="alert alert-error">
            Please <Link href="/auth/login" style={{ color: '#fff', textDecoration: 'underline' }}>sign in</Link> to view your dashboard.
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid-stats" style={{ marginBottom: 28 }}>
              <StatCard icon="📁" iconClass="indigo"  value={ov.totalProjects}    label="Total Projects" />
              <StatCard icon="🚀" iconClass="violet"  value={ov.activeProjects}   label="Active Projects" />
              <StatCard icon="✅" iconClass="green"   value={ov.completedTasks}   label="Completed Tasks" />
              <StatCard icon="📋" iconClass="sky"     value={ov.totalTasks}       label="Total Tasks" />
              <StatCard icon="⏰" iconClass="red"     value={ov.overdueTasks}     label="Overdue" />
              <StatCard icon="🎯" iconClass="amber"   value={ov.myAssignedTasks}  label="Assigned to Me" />
            </div>

            {/* Progress + status */}
            <div className="grid-cols-2" style={{ marginBottom: 28 }}>
              <div className="card">
                <div style={{ marginBottom: 14, fontWeight: 700 }}>Overall Completion</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-fill" style={{ width: `${completedPct}%` }} />
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{completedPct}%</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {ov.completedTasks || 0} of {ov.totalTasks || 0} tasks completed
                </p>
              </div>

              <div className="card">
                <div style={{ marginBottom: 14, fontWeight: 700 }}>Tasks by Status</div>
                {['todo', 'in-progress', 'review', 'completed'].map(s => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    {statusBadge(s)}
                    <span style={{ fontWeight: 600 }}>{byStatus[s] || 0}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent tasks */}
            {recent.length > 0 && (
              <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ fontWeight: 700 }}>Recent Tasks</div>
                  <Link href="/tasks" className="btn btn-ghost btn-sm">View all →</Link>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Task</th><th>Status</th><th>Priority</th><th>Due</th></tr></thead>
                    <tbody>
                      {recent.slice(0, 5).map(t => (
                        <tr key={t._id}>
                          <td style={{ fontWeight: 500 }}>{t.title}</td>
                          <td>{statusBadge(t.status)}</td>
                          <td>{priorityBadge(t.priority)}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                            {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Upcoming deadlines */}
            {upcoming.length > 0 && (
              <div className="card">
                <div style={{ fontWeight: 700, marginBottom: 16 }}>Upcoming Deadlines</div>
                {upcoming.slice(0, 5).map(t => (
                  <div key={t._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{t.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.project?.name || 'No project'}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {priorityBadge(t.priority)}
                      <span style={{ fontSize: 12, color: 'var(--warning)' }}>
                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!data && !loading && token && (
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <div className="empty-title">No data yet</div>
                <p>Create some projects and tasks to see your dashboard stats.</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
