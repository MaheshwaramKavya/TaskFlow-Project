import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import * as api from '../api';

export default function AuthPage() {
  const { loginUser } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setNotice('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const res = await api.login(form.email, form.password);
        loginUser(res.data.user, res.data.token);
      } else {
        if (!form.name.trim()) { setError('Name is required'); setLoading(false); return; }
        const res = await api.signup(form.name, form.email, form.password);
        loginUser(res.data.user, res.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 8, fontSize: 14,
    outline: 'none', boxSizing: 'border-box', marginBottom: 13
  };

  return (
    <div className="auth-shell" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, perspective: 1200
    }}>
      <div className="orbital-scene" aria-hidden="true">
        <div className="cube"><span /><span /><span /></div>
        <div className="poly" />
        <div className="cube-small"><span /><span /><span /></div>
      </div>

      <div className="auth-grid" style={{ width: 980, maxWidth: '100%', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 34, alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <section style={{ minWidth: 0 }}>
          <div style={{
            width: 62, height: 62, borderRadius: 14,
            background: 'linear-gradient(135deg, #69e6ff, #7b5cff 62%, #ff65d0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, color: '#0f1127', fontWeight: 900,
            marginBottom: 22, boxShadow: '0 0 34px rgba(105,230,255,0.28)'
          }}>T</div>
          <h1 style={{ margin: '0 0 14px', color: '#f6fbff', fontSize: 'clamp(38px, 6vw, 72px)', lineHeight: 0.95, fontWeight: 900, letterSpacing: 0 }}>
            TaskFlow
          </h1>
          <p style={{ color: '#aeb9d3', margin: 0, fontSize: 17, lineHeight: 1.6, maxWidth: 520 }}>
            A secure command center for projects, tasks, and automated due-date email reminders.
          </p>
        </section>

        <section className="glass-panel" style={{
          borderRadius: 18, padding: 30,
          transform: 'rotateY(-5deg) rotateX(2deg)',
          transformStyle: 'preserve-3d'
        }}>
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.24)', borderRadius: 10, padding: 4, marginBottom: 24, border: '1px solid rgba(255,122,26,0.18)' }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setNotice(''); }} style={{
                flex: 1, padding: 9, border: 'none', cursor: 'pointer', borderRadius: 8,
                fontWeight: 800, fontSize: 13,
                background: mode === m ? 'linear-gradient(90deg, #69e6ff, #7b5cff)' : 'transparent',
                color: mode === m ? '#0f1127' : '#a9b0d4'
              }}>{m === 'login' ? 'Sign In' : 'Create Account'}</button>
            ))}
          </div>

          {mode === 'signup' && (
            <>
              <label style={label}>Full Name</label>
              <input className="field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" style={inputStyle} />
            </>
          )}

          <label style={label}>Email</label>
          <input className="field" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" placeholder="you@company.io" style={inputStyle} />
          <label style={label}>Password</label>
          <input className="field" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} type="password" placeholder="Password" style={inputStyle}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()} />

          {notice && <div style={{ color: '#ff7a1a', fontSize: 13, marginBottom: 10, fontWeight: 800 }}>{notice}</div>}
          {error && <div style={{ color: '#ff89a7', fontSize: 13, marginBottom: 10, fontWeight: 700 }}>{error}</div>}

          <button className="neon-button" onClick={handleSubmit} disabled={loading} style={{
            width: '100%', padding: 13, borderRadius: 10, fontSize: 15,
            fontWeight: 900, cursor: 'pointer', opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </section>
      </div>
    </div>
  );
}

const label = {
  display: 'block', fontSize: 12, fontWeight: 800, color: '#8e9bb8',
  marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0
};
