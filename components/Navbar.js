import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/tasks': 'Tasks',
  '/teams': 'Teams',
  '/profile': 'Profile',
  '/settings': 'Settings',
};

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
  const pageTitle = PAGE_TITLES[router.pathname] || 'Team Task Manager';

  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{pageTitle}</span>
        <div className="topbar-search">
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--text-subtle)' }}>search</span>
          <input placeholder="Search tasks, projects..." />
        </div>
      </div>
      <div className="topbar-actions">
        <button className="topbar-btn" title="Notifications">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>notifications</span>
        </button>
        <button className="topbar-btn" title="Help">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>help</span>
        </button>
        {user && (
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--accent)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#fff'
          }}>
            {(user.name || user.email || '?').charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}
