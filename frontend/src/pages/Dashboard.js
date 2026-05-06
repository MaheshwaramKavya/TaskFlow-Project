import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { Btn } from '../components/UI';
import * as api from '../api';

const isOverdue = (d) => d && new Date(d) < new Date() && new Date(d).toDateString() !== new Date().toDateString();
const statusColors = { pending: '#ffc857', 'in-progress': '#ff7a1a', completed: '#42f59b' };

export default function Dashboard({ onNavigate }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    api.getProjects().then(r => setProjects(r.data)).catch(() => {});
    api.getTasks().then(r => setTasks(r.data)).catch(() => {});
  }, []);

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => isOverdue(t.due_date) && t.status !== 'completed').length,
  };

  const StatCard = ({ label, value, color, icon }) => (
    <div className="stat-card" style={{ borderRadius: 14, padding: '20px 22px', minHeight: 134 }}>
      <div style={{ fontSize: 22, marginBottom: 10, color }}>{icon}</div>
      <div style={{ fontSize: 30, fontWeight: 900, color, letterSpacing: 0 }}>{value}</div>
      <div style={{ fontSize: 13, color: '#8e9bb8', fontWeight: 700 }}>{label}</div>
    </div>
  );

  return (
    <div>
      <div className="glass-panel" style={{
        borderRadius: 18, padding: 24, marginBottom: 22,
        background: 'linear-gradient(135deg, rgba(255,122,26,0.16), rgba(255,61,0,0.1), rgba(5,5,5,0.86))'
      }}>
        <p style={{ margin: '0 0 8px', color: '#ff7a1a', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0 }}>Workspace Overview</p>
        <h2 className="page-title" style={{ margin: '0 0 6px', fontSize: 30, fontWeight: 900, letterSpacing: 0 }}>
          Good day, {user?.name?.split(' ')[0]}
        </h2>
        <p className="page-subtitle" style={{ margin: 0, fontSize: 15 }}>Live project intelligence across your workspace.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 22 }}>
        <StatCard label="Total Tasks" value={stats.total} color="#f6fbff" icon="▣" />
        <StatCard label="Pending" value={stats.pending} color="#ffc857" icon="◷" />
        <StatCard label="In Progress" value={stats.inProgress} color="#ff7a1a" icon="↻" />
        <StatCard label="Completed" value={stats.completed} color="#42f59b" icon="✓" />
        <StatCard label="Overdue" value={stats.overdue} color="#ff5f87" icon="!" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        <div className="glass-panel" style={{ borderRadius: 14, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#f6fbff' }}>Projects</h3>
            <Btn variant="ghost" size="sm" onClick={() => onNavigate('projects')}>View all</Btn>
          </div>
          {projects.slice(0, 4).map(p => {
            const ptasks = tasks.filter(t => t.project_id === p.id);
            const done = ptasks.filter(t => t.status === 'completed').length;
            const pct = ptasks.length ? Math.round(done / ptasks.length * 100) : 0;
            return (
              <div key={p.id} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, boxShadow: `0 0 14px ${p.color}` }} />
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#dce9ff' }}>{p.name}</span>
                  </div>
                  <span style={{ fontSize: 12, color: '#8e9bb8', fontWeight: 800 }}>{done}/{ptasks.length}</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ width: pct + '%', height: '100%', background: `linear-gradient(90deg, ${p.color}, #ff7a1a)`, borderRadius: 10 }} />
                </div>
              </div>
            );
          })}
          {projects.length === 0 && <p style={{ color: '#8e9bb8', fontSize: 13 }}>No projects yet.</p>}
        </div>

        <div className="glass-panel" style={{ borderRadius: 14, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#f6fbff' }}>Recent Tasks</h3>
            <Btn variant="ghost" size="sm" onClick={() => onNavigate('tasks')}>View all</Btn>
          </div>
          {tasks.slice(0, 5).map(t => {
            const project = projects.find(p => p.id === t.project_id);
            const overdue = isOverdue(t.due_date) && t.status !== 'completed';
            return (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, padding: '10px 11px', borderRadius: 8, background: overdue ? 'rgba(255,95,135,0.13)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColors[t.status], flexShrink: 0, boxShadow: `0 0 12px ${statusColors[t.status]}` }} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: '#dce9ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                {project && <span style={{ fontSize: 11, color: project.color, fontWeight: 800, flexShrink: 0 }}>● {project.name}</span>}
              </div>
            );
          })}
          {tasks.length === 0 && <p style={{ color: '#8e9bb8', fontSize: 13 }}>No tasks yet.</p>}
        </div>
      </div>
    </div>
  );
}
