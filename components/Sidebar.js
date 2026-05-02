import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { href: '/dashboard', icon: 'dashboard',      label: 'Dashboard' },
  { href: '/projects',  icon: 'folder_open',     label: 'Projects' },
  { href: '/tasks',     icon: 'task_alt',        label: 'Tasks' },
  { href: '/teams',     icon: 'group',           label: 'Teams' },
  { href: '/profile',   icon: 'person',          label: 'Profile' },
  { href: '/settings',  icon: 'settings',        label: 'Settings' },
];

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

export default function Sidebar() {
  const { user, role, logout, token } = useAuth();
  const router = useRouter();
  const navItems = role === 'member' ? NAV.filter(item => item.href !== '/teams') : NAV;

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <div className="sidebar-logo-text">
            Team Task Manager
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link${router.pathname.startsWith(item.href) ? ' active' : ''}`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{item.icon}</span>
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
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
            </button>
          </div>
        ) : (
          <Link href="/auth/login" className="sidebar-signin-btn">
            Sign in
          </Link>
        )}
      </div>
    </aside>
  );
}
