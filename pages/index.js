import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Home() {
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (token) router.replace('/dashboard');
  }, [token]); // eslint-disable-line

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: 32,
    }}>
      <div style={{ maxWidth: 560, textAlign: 'center' }}>
        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{
            fontSize: 14, fontWeight: 800, letterSpacing: '-0.01em',
            textTransform: 'uppercase', color: 'var(--text)', marginBottom: 4,
          }}>
            TEAM TASK MANAGER
          </h2>
          <p style={{ fontSize: 12, color: 'var(--accent-light)' }}>Creative Workspace</p>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: '3.2rem',
          fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.02em',
          color: 'var(--text)', marginBottom: 16,
        }}>
          Manage your team&apos;s work,<br />
          <span style={{ color: 'var(--accent)' }}>beautifully.</span>
        </h1>

        <p style={{
          fontSize: 15, color: 'var(--text-muted)',
          marginBottom: 36, lineHeight: 1.7,
        }}>
          Team Task Manager brings projects, tasks, and your whole team together in one premium workspace — with Kanban boards, role-based access, and real-time stats.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth/signup" className="btn btn-primary btn-lg" style={{ padding: '14px 32px' }}>
            Get started free →
          </Link>
          <Link href="/auth/login" className="btn btn-secondary btn-lg" style={{ padding: '14px 32px' }}>
            Sign in
          </Link>
        </div>

        {/* Feature cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 16, marginTop: 56, textAlign: 'left',
        }}>
          {[
            { icon: 'folder_open', title: 'Projects', desc: 'Create, organise, and track projects with deadlines and member roles.' },
            { icon: 'check_circle', title: 'Tasks', desc: 'Assign tasks, set priorities, and move them across a Kanban board.' },
            { icon: 'group', title: 'Teams', desc: 'Invite members, assign roles, and manage your whole organisation.' },
            { icon: 'bar_chart', title: 'Dashboard', desc: 'Real-time overview of progress, overdue items, and upcoming deadlines.' },
          ].map(f => (
            <div key={f.title} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: 20,
              transition: 'all 0.2s ease',
            }} className="card">
              <span className="material-symbols-outlined" style={{
                fontSize: 24, color: 'var(--accent-light)', marginBottom: 10, display: 'block',
              }}>{f.icon}</span>
              <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 14 }}>{f.title}</div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
