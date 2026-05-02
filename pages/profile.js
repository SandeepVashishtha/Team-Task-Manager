import { useEffect, useState } from 'react';
import { authMe, updateMyProfile } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Profile(){
  const { token, user, login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', avatar: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (user) setForm({ name: user.name || '', email: user.email || '', avatar: user.avatar || '' });
    else if (token) {
      authMe(token).then(res => {
        const u = res.user;
        setForm({ name: u.name || '', email: u.email || '', avatar: u.avatar || '' });
      }).catch(()=>{});
    }
  }, [user, token]);

  async function handleSave(e){
    e.preventDefault(); setMsg(''); setLoading(true);
    try{
      const res = await updateMyProfile(token, { name: form.name, avatar: form.avatar });
      const updated = res.user || res;
      // refresh context
      login({ token, user: updated });
      setMsg('Profile updated');
    }catch(err){ setMsg(err.message || 'Update failed'); }
    finally{ setLoading(false); }
  }

  return (
    <main style={{ padding: '0 48px 48px', maxWidth: 680 }}>
      <section style={{ paddingTop: 16, marginBottom: 32 }}>
        <p className="text-label-caps" style={{ color: 'var(--accent)', marginBottom: 4 }}>ACCOUNT</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 400, color: 'var(--text)', letterSpacing: '-0.02em' }}>
          Profile
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Your account details</p>
      </section>

      {msg && <div className="alert" style={{ background: msg.includes('failed') ? 'rgba(220,38,38,.05)' : 'rgba(22,163,74,.05)', border: `1px solid ${msg.includes('failed') ? 'rgba(220,38,38,.15)' : 'rgba(22,163,74,.15)'}`, color: msg.includes('failed') ? '#B91C1C' : '#15803D' }}>{msg}</div>}

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 28 }}>
        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div className="avatar avatar-lg">
              {(form.name || form.email || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text)' }}>{form.name || 'Your name'}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{form.email || 'you@example.com'}</div>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Full name</label>
            <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" value={form.email} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">Avatar URL</label>
            <input className="form-input" placeholder="https://example.com/avatar.jpg" value={form.avatar} onChange={e => setForm({...form, avatar: e.target.value})} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" type="button" onClick={() => { setForm({ name: user?.name || '', email: user?.email || '', avatar: user?.avatar || '' }); setMsg(''); }}>Reset</button>
            <button className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Save changes'}</button>
          </div>
        </form>
      </div>
    </main>
  );
}
