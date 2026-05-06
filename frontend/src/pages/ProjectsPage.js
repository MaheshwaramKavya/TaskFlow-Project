import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../components/AuthContext';
import { Btn, Modal, Input, Textarea } from '../components/UI';
import * as api from '../api';

function ProjectForm({ project, onSave, onClose }) {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const colors = ['#ff7a1a','#ff3d00','#ffc857','#1bb7ff','#ff5f87','#42f59b','#4da3ff'];
  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
    color: project?.color || colors[0],
    member_ids: project?.member_ids || [user?.id],
  });

  useEffect(() => { api.getUsers().then(r => setAllUsers(r.data)).catch(() => {}); }, []);

  const toggle = (uid) => setForm(f => ({
    ...f, member_ids: f.member_ids.includes(uid) ? f.member_ids.filter(m => m !== uid) : [...f.member_ids, uid]
  }));

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (project) await api.updateProject(project.id, form);
    else await api.createProject(form);
    onSave();
    onClose();
  };

  return (
    <Modal title={project ? 'Edit Project' : 'New Project'} onClose={onClose}>
      <Input label="Project Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Project name" />
      <Textarea label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What is this project about?" />
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#8e9bb8', marginBottom: 8, textTransform: 'uppercase' }}>Color</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {colors.map(c => (
            <button key={c} onClick={() => setForm({ ...form, color: c })} style={{
              width: 30, height: 30, borderRadius: '50%', background: c, cursor: 'pointer',
              border: form.color === c ? '3px solid #f6fbff' : '3px solid transparent',
              boxShadow: `0 0 16px ${c}66`
            }} />
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#8e9bb8', marginBottom: 8, textTransform: 'uppercase' }}>Members</label>
        {allUsers.map(u => (
          <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '7px 10px', borderRadius: 8, background: form.member_ids.includes(u.id) ? 'rgba(255,122,26,0.14)' : 'transparent', marginBottom: 4, color: '#dce9ff' }}>
            <input type="checkbox" checked={form.member_ids.includes(u.id)} onChange={() => toggle(u.id)} />
            <span style={{ fontSize: 14, fontWeight: 700 }}>{u.name}</span>
            <span style={{ fontSize: 11, color: u.role === 'admin' ? '#ff3d00' : '#ff7a1a', fontWeight: 800, textTransform: 'uppercase' }}>{u.role}</span>
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={handleSave}>Save Project</Btn>
      </div>
    </Modal>
  );
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editProject, setEditProject] = useState(null);

  const refresh = useCallback(() => {
    api.getProjects().then(r => setProjects(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    refresh();
    api.getTasks().then(r => setTasks(r.data)).catch(() => {});
  }, [refresh]);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this project and all its tasks?')) {
      await api.deleteProject(id);
      refresh();
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 className="page-title" style={{ margin: 0, fontSize: 26, fontWeight: 900 }}>Projects</h2>
        {user && <Btn onClick={() => { setEditProject(null); setShowForm(true); }}>New Project</Btn>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {projects.map(p => {
          const ptasks = tasks.filter(t => t.project_id === p.id);
          const done = ptasks.filter(t => t.status === 'completed').length;
          const pct = ptasks.length ? Math.round(done / ptasks.length * 100) : 0;
          return (
            <div key={p.id} className="project-card" style={{ borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ height: 6, background: `linear-gradient(90deg, ${p.color}, #ff7a1a)`, boxShadow: `0 0 20px ${p.color}` }} />
              <div style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 9 }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#f6fbff' }}>{p.name}</h3>
                  {user?.role === 'admin' && (
                    <div style={{ display: 'flex', gap: 5 }}>
                      <Btn variant="ghost" size="sm" onClick={() => { setEditProject(p); setShowForm(true); }}>Edit</Btn>
                      <Btn variant="ghost" size="sm" style={{ color: '#ff89a7' }} onClick={() => handleDelete(p.id)}>Delete</Btn>
                    </div>
                  )}
                </div>
                <p style={{ margin: '0 0 15px', fontSize: 13, color: '#aeb9d3', lineHeight: 1.5 }}>{p.description}</p>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: '#8e9bb8', fontWeight: 800 }}>Progress</span>
                    <span style={{ fontSize: 12, color: p.color, fontWeight: 900 }}>{pct}%</span>
                  </div>
                  <div style={{ height: 7, background: 'rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ width: pct + '%', height: '100%', background: `linear-gradient(90deg, ${p.color}, #ff7a1a)`, borderRadius: 10 }} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#aeb9d3', fontWeight: 700 }}>{p.member_count || 0} member{p.member_count !== 1 ? 's' : ''}</span>
                  <span style={{ fontSize: 12, color: '#8e9bb8', fontWeight: 800 }}>{ptasks.length} task{ptasks.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          );
        })}
        {projects.length === 0 && (
          <div className="glass-panel" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 20px', color: '#8e9bb8', borderRadius: 14 }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>◇</div>
            <p style={{ margin: 0 }}>No projects yet.</p>
          </div>
        )}
      </div>

      {showForm && <ProjectForm project={editProject} onSave={refresh} onClose={() => { setShowForm(false); setEditProject(null); }} />}
    </div>
  );
}
