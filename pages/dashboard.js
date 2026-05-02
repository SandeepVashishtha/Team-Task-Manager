import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDashboard, getTasks } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { token, user } = useAuth();
  const [data, setData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    let mounted = true;
    Promise.all([
      getDashboard(token),
      getTasks(token, { assignedTo: 'me', limit: 6 }),
    ])
      .then(([dashRes, taskRes]) => {
        if (mounted) {
          setData(dashRes?.dashboard || null);
          const rawTasks = taskRes?.tasks;
          setTasks(Array.isArray(rawTasks) ? rawTasks : []);
        }
      })
      .catch(err => { if (mounted) setError(err.message || 'Unable to load'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [token]);

  const ov = data?.overview || {};
  const completedPct = ov.totalTasks ? Math.round((ov.completedTasks / ov.totalTasks) * 100) : 0;

  const firstName = user?.name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';


  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  return (
    <main style={{ padding: '0 48px 48px', maxWidth: 1280 }}>
      {/* Hero greeting */}
      <section style={{ marginBottom: 48, display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'flex-end', gap: 32, paddingTop: 16 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.02em' }}>
            {greeting}, {firstName}.
          </h2>
          <p className="font-body-base" style={{ color: 'var(--text-muted)', maxWidth: 500 }}>
            You have <strong style={{ color: 'var(--text)' }}>{ov.myAssignedTasks || tasks.length}</strong> priority tasks today and <strong style={{ color: 'var(--text)' }}>{ov.activeProjects || 0}</strong> active projects.
          </p>
        </div>
      </section>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }}>
        {/* Left: Today's Tasks */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>Today&apos;s Tasks</h3>
            <Link href="/tasks" className="text-label-caps" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}>VIEW ALL</Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tasks.length > 0 ? tasks.slice(0, 5).map((t, i) => (
              <div
                key={t._id || i}
                className="card"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 18px',
                  opacity: t.status === 'completed' ? 0.55 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    border: t.status === 'completed' ? 'none' : '1.5px solid var(--border-strong)',
                    background: t.status === 'completed' ? 'var(--accent)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {t.status === 'completed' && (
                      <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#fff' }}>check</span>
                    )}
                  </div>
                  <div>
                    <h4 style={{
                      fontSize: 14, fontWeight: 500, color: 'var(--text)',
                      textDecoration: t.status === 'completed' ? 'line-through' : 'none',
                    }}>
                      {t.title}
                    </h4>
                    <p style={{ fontSize: 12, color: 'var(--text-subtle)', marginTop: 2 }}>
                      {t.project?.name || (t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '')}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {t.priority && (
                    <span className={`badge badge-${t.priority}`}>
                      {t.priority}
                    </span>
                  )}
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--text-subtle)' }}>drag_indicator</span>
                </div>
              </div>
            )) : (
              <div className="empty-state" style={{ padding: '32px 16px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 40, opacity: 0.3, display: 'block', marginBottom: 8 }}>task_alt</span>
                <div className="empty-title">No tasks assigned</div>
                <p>Create tasks from the Tasks page to get started.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Productivity Overview */}
        <div>
          {/* Stats summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Total Tasks', value: ov.totalTasks || 0, icon: 'assignment', color: 'var(--text)' },
              { label: 'Completed', value: ov.completedTasks || 0, icon: 'check_circle', color: 'var(--success)' },
              { label: 'Overdue', value: ov.overdueTasks || 0, icon: 'warning', color: 'var(--danger)' },
              { label: 'Projects', value: ov.totalProjects || 0, icon: 'folder_open', color: 'var(--text)' },
            ].map(stat => (
              <div key={stat.label} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</span>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--text-subtle)' }}>{stat.icon}</span>
                </div>
                <div style={{ fontSize: 22, fontFamily: 'var(--font-display)', fontWeight: 700, color: stat.color }}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      {Array.isArray(data?.upcomingDeadlines) && data.upcomingDeadlines.length > 0 && (
        <section style={{ marginTop: 48 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>Upcoming Deadlines</h3>
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }} className="no-scrollbar">
            {data.upcomingDeadlines.map(t => (
              <div key={t._id} className="card" style={{ minWidth: 280, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--warning)', fontWeight: 700, marginBottom: 6 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
                  {t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                </div>
                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{t.title}</h4>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.project?.name || ''}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
