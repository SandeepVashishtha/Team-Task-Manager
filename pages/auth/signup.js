import { useRouter } from 'next/router';
import { useState } from 'react';
import Link from 'next/link';
import { authSignup } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function Signup() {
  const router = useRouter();
  const { login } = useAuth();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState('member');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await authSignup(name, email, password, role);
      // res = { success, token, user }
      login({ token: res.token, user: res.user, role: res.user?.role || role });
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{
            fontSize: 14, fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: '-0.01em', color: 'var(--text)',
          }}>
            TEAM TASK MANAGER
          </div>
        </div>
        <h1 className="auth-title" style={{ textAlign: 'center' }}>Create account</h1>
        <p className="auth-subtitle" style={{ textAlign: 'center' }}>Join your team on Team Task Manager</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full name</label>
            <input
              id="signup-name"
              type="text"
              className="form-input"
              placeholder="Your Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              id="signup-email"
              type="email"
              className="form-input"
              placeholder="you@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="signup-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              id="signup-role"
              className="form-select"
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            id="signup-submit"
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: 14, marginTop: 4 }}
            disabled={loading}
          >
            {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Create account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
