import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authChangePassword } from '../lib/api';

export default function Settings(){
  const { token } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function handleChange(e){
    e.preventDefault(); setMsg('');
    if (newPassword !== confirm) { setMsg('Passwords do not match'); return; }
    setLoading(true);
    try{
      const res = await authChangePassword(token, currentPassword, newPassword);
      setMsg(res.message || 'Password changed');
      setCurrentPassword(''); setNewPassword(''); setConfirm('');
    }catch(err){ setMsg(err.message || 'Unable to change password'); }
    finally{ setLoading(false); }
  }

  return (
    <main style={{ padding: '0 48px 48px', maxWidth: 680 }}>
      <section style={{ paddingTop: 16, marginBottom: 32 }}>
        <p className="text-label-caps" style={{ color: 'var(--accent)', marginBottom: 4 }}>SECURITY</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 400, color: 'var(--text)', letterSpacing: '-0.02em' }}>
          Settings
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Account and security</p>
      </section>

      {msg && <div className="alert" style={{ background: msg.includes('match') || msg.includes('Unable') ? 'rgba(220,38,38,.05)' : 'rgba(22,163,74,.05)', border: `1px solid ${msg.includes('match') || msg.includes('Unable') ? 'rgba(220,38,38,.15)' : 'rgba(22,163,74,.15)'}`, color: msg.includes('match') || msg.includes('Unable') ? '#B91C1C' : '#15803D' }}>{msg}</div>}

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: 'var(--text)' }}>Change Password</h3>
        <form onSubmit={handleChange}>
          <div className="form-group">
            <label className="form-label">Current password</label>
            <input type="password" className="form-input" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">New password</label>
            <input type="password" className="form-input" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm new password</label>
            <input type="password" className="form-input" value={confirm} onChange={e => setConfirm(e.target.value)} required />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Change password'}</button>
          </div>
        </form>
      </div>
    </main>
  );
}
