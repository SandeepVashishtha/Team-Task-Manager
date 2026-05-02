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
    <>
      <div className="page-header" style={{ paddingTop: 60 }}>
        <div style={{ maxWidth: 640 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 14px', borderRadius: 20,
            background: 'rgba(99,102,241,.1)', border: '1px solid rgba(99,102,241,.3)',
            fontSize: 12, color: 'var(--accent)', fontWeight: 600, marginBottom: 20
          }}>
            ⚡ Team Task Manager — Role-Based Collaboration
          </div>
          <h1 className="page-title" style={{ fontSize: 42, marginBottom: 16, lineHeight: 1.15 }}>
            Manage your team&apos;s work,<br />
            <span style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              beautifully.
            </span>
          </h1>
          <p style={{ fontSize: 17, color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.7 }}>
            TaskFlow brings projects, tasks, and your whole team together in one premium workspace — with Kanban boards, role-based access, and real-time stats.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/auth/signup" className="btn btn-primary btn-lg">Get started free →</Link>
            <Link href="/auth/login"  className="btn btn-secondary btn-lg">Sign in</Link>
          </div>
        </div>
      </div>

      <div className="page-body" style={{ paddingTop: 60 }}>
        <div className="grid-stats" style={{ marginBottom: 48 }}>
          {[
            { icon: '📁', title: 'Projects', desc: 'Create, organise, and track projects with deadlines and member roles.' },
            { icon: '✅', title: 'Tasks', desc: 'Assign tasks, set priorities, and move them across a Kanban board.' },
            { icon: '👥', title: 'Teams', desc: 'Invite members, assign roles, and manage your whole organisation.' },
            { icon: '📊', title: 'Dashboard', desc: 'Real-time overview of progress, overdue items, and upcoming deadlines.' },
          ].map(f => (
            <div key={f.title} className="card">
              <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{f.title}</div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="card card-glow" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>Ready to get started?</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
            Create an account and connect to your backend API.
          </p>
          <Link href="/auth/signup" className="btn btn-primary btn-lg">Create free account</Link>
        </div>
      </div>
    </>
  );
}
