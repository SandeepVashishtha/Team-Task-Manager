import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/projects',  icon: '📁', label: 'Projects'  },
  { href: '/tasks',     icon: '✅', label: 'Tasks'     },
  { href: '/teams',     icon: '👥', label: 'Teams'     },
];

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

export default function Sidebar() {
  const { user, role, logout } = useAuth();
  const router = useRouter();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">⚡</div>
        <div className="sidebar-logo-text">
          TaskFlow
          <span>Team Task Manager</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {NAV.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link${router.pathname.startsWith(item.href) ? ' active' : ''}`}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User footer */}
      <div className="sidebar-footer">
        {user ? (
          <div className="user-card">
            <div className="avatar">{getInitials(user.name || user.email)}</div>
            <div className="user-info">
              <div className="user-name">{user.name || user.email}</div>
              <div className="user-role">{role}</div>
            </div>
            <button className="logout-btn" title="Logout" onClick={logout}>
              ⏻
            </button>
          </div>
        ) : (
          <Link href="/auth/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Sign in
          </Link>
        )}
      </div>
    </aside>
  );
}
