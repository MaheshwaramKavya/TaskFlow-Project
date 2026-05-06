import React from 'react';
import { useAuth } from './AuthContext';
import { Avatar, Badge, Btn } from './UI';

export default function Sidebar({ page, onNavigate }) {
  const { user, logoutUser } = useAuth();

  const navItems = [
    { id: 'dashboard', icon: '▦', label: 'Dashboard' },
    { id: 'tasks', icon: '✓', label: 'Tasks' },
    { id: 'projects', icon: '◇', label: 'Projects' },
    { id: 'profile', icon: '👤', label: 'Profile' },
    ...(user?.role === 'admin' ? [{ id: 'users', icon: '◎', label: 'Users' }] : []),
  ];

  return (
    <aside className="glass-panel" style={{
      width: 248, flexShrink: 0, display: 'flex', flexDirection: 'column',
      padding: '26px 14px', height: '100vh', position: 'sticky', top: 0,
      borderTop: 0, borderBottom: 0, borderLeft: 0, borderRadius: 0,
      zIndex: 2
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 10px', marginBottom: 34 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: 'linear-gradient(135deg, #ff7a1a, #ff3d00 62%, #1bb7ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 17, color: '#06101d', fontWeight: 900,
          boxShadow: '0 0 28px rgba(255,122,26,0.38)'
        }}>T</div>
        <span style={{ fontWeight: 900, fontSize: 17, color: '#f6fbff', letterSpacing: 0 }}>TaskFlow</span>
      </div>

      <nav style={{ flex: 1 }}>
        {navItems.map(item => {
          const active = page === item.id;
          return (
            <button key={item.id} onClick={() => onNavigate(item.id)} style={{
              width: '100%', padding: '11px 12px', display: 'flex',
              alignItems: 'center', gap: 11, borderRadius: 10, cursor: 'pointer',
              marginBottom: 6, textAlign: 'left',
              background: active ? 'linear-gradient(90deg, rgba(255,122,26,0.2), rgba(255,61,0,0.12))' : 'transparent',
              border: active ? '1px solid rgba(255,122,26,0.46)' : '1px solid transparent',
              color: active ? '#f6fbff' : '#8e9bb8',
              fontWeight: active ? 800 : 600, fontSize: 14
            }}>
              <span style={{
                fontSize: 16, width: 24, height: 24, borderRadius: 7,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: active ? '#ff7a1a' : '#8e9bb8',
                background: active ? 'rgba(255,122,26,0.12)' : 'rgba(255,255,255,0.04)'
              }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div style={{ borderTop: '1px solid rgba(255,122,26,0.18)', paddingTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px' }}>
          <Avatar initials={user?.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || '??'} size={36}
            color={user?.role === 'admin' ? '#ff3d00' : '#ff7a1a'} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#f6fbff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <Badge label={user?.role || 'member'} color={user?.role === 'admin' ? '#ff3d00' : '#ff7a1a'} />
          </div>
        </div>
        <Btn variant="ghost" style={{ width: '100%', marginTop: 8, justifyContent: 'center', color: '#ff89a7' }} onClick={logoutUser}>
          Sign Out
        </Btn>
      </div>
    </aside>
  );
}
