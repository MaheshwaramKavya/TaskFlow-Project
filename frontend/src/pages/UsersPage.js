import React, { useEffect, useState } from 'react';
import { Badge, Avatar } from '../components/UI';
import * as api from '../api';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    api.getUsers().then(r => setUsers(r.data)).catch(() => {});
    api.getTasks().then(r => setTasks(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h2 className="page-title" style={{ margin: '0 0 20px', fontSize: 26, fontWeight: 900 }}>Team Members</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
        {users.map(u => {
          const userTasks = tasks.filter(t => t.assignee_id === u.id);
          const done = userTasks.filter(t => t.status === 'completed').length;
          const initials = u.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
          const color = u.role === 'admin' ? '#ff3d00' : '#ff7a1a';
          return (
            <div key={u.id} className="user-card" style={{ borderRadius: 14, padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <Avatar initials={initials} size={44} color={color} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 900, fontSize: 15, color: '#f6fbff' }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: '#8e9bb8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                </div>
              </div>
              <Badge label={u.role} color={color} />
              <div style={{ marginTop: 16, display: 'flex', gap: 20 }}>
                <Metric label="Assigned" value={userTasks.length} color="#f6fbff" />
                <Metric label="Done" value={done} color="#42f59b" />
                <Metric label="Open" value={userTasks.length - done} color="#ffc857" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Metric({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 21, fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: 11, color: '#8e9bb8', fontWeight: 800 }}>{label}</div>
    </div>
  );
}
