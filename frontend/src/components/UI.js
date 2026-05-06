import React from 'react';

export function Avatar({ initials, size = 32, color = '#ff1088' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${color}, #ff0080)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 800, color: '#fff', flexShrink: 0,
      letterSpacing: 0, boxShadow: `0 0 25px ${color}88, 0 0 50px ${color}44`
    }}>{initials}</div>
  );
}

export function Badge({ label, color }) {
  return (
    <span style={{
      padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800,
      background: color + '15', color, letterSpacing: 0.5,
      textTransform: 'uppercase', border: `1px solid ${color}55`,
      boxShadow: `0 0 10px ${color}20`
    }}>{label}</span>
  );
}

export function Modal({ title, onClose, children, fullScreen = false }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.68)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(10px)', padding: 18
    }} onClick={onClose}>
      <div className="glass-panel" style={{
        borderRadius: 16, padding: 28,
        width: fullScreen ? '100%' : 500,
        maxWidth: fullScreen ? '98vw' : '92vw',
        maxHeight: fullScreen ? '98vh' : '90vh',
        height: fullScreen ? '98vh' : 'auto',
        overflowY: 'auto'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#f6fbff' }}>{title}</h3>
          <button onClick={onClose} style={{
            width: 34, height: 34, background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
            cursor: 'pointer', fontSize: 18, color: '#dce9ff', lineHeight: 1
          }}>x</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 800, color: '#a9b8d8',
  marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5
};

const fieldStyle = {
  width: '100%', padding: '11px 12px', borderRadius: 8, fontSize: 14,
  outline: 'none', boxSizing: 'border-box'
};

export function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={labelStyle}>{label}</label>}
      <input className="modal-field" style={fieldStyle} {...props} />
    </div>
  );
}

export function Select({ label, children, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={labelStyle}>{label}</label>}
      <select className="modal-field" style={fieldStyle} {...props}>{children}</select>
    </div>
  );
}

export function Textarea({ label, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={labelStyle}>{label}</label>}
      <textarea className="modal-field" style={{ ...fieldStyle, resize: 'vertical', minHeight: 86 }} {...props} />
    </div>
  );
}

export function Btn({ children, variant = 'primary', size = 'md', style: extra = {}, ...props }) {
  const sizes = {
    sm: { padding: '6px 12px', fontSize: 12 },
    md: { padding: '10px 18px', fontSize: 14 },
    lg: { padding: '14px 24px', fontSize: 16 }
  };
  const variants = {
    primary: { background: 'linear-gradient(135deg, #00d4ff, #8b00ff)', color: '#050812', border: 'none', fontWeight: 700, letterSpacing: '0.5px' },
    danger: { background: '#ff1060', color: '#fff', border: 'none', fontWeight: 700 },
    ghost: { background: 'rgba(0, 212, 255, 0.08)', color: '#00d4ff', border: '1px solid rgba(0, 212, 255, 0.25)' },
    outline: { background: 'transparent', color: '#00d4ff', border: '1.5px solid rgba(0, 212, 255, 0.35)' },
  };
  return (
    <button style={{
      borderRadius: 8, fontWeight: 800, cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', gap: 6,
      transition: 'transform 0.15s, opacity 0.15s, box-shadow 0.15s',
      boxShadow: variant === 'primary' ? '0 0 25px rgba(0, 212, 255, 0.3), 0 0 50px rgba(139, 0, 255, 0.15)' : 'none',
      ...sizes[size], ...variants[variant], ...extra
    }} {...props}>{children}</button>
  );
}
