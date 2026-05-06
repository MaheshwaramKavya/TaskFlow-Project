import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../components/AuthContext';
import { Badge, Btn, Modal, Input, Select, Textarea } from '../components/UI';
import TaskDetailModal from '../components/TaskDetailModal';
import CodeEditor from '../components/CodeEditor';
import * as api from '../api';

const isOverdue = (d) => d && new Date(d) < new Date() && new Date(d).toDateString() !== new Date().toDateString();
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';
const statusColors = { pending: '#ffc857', 'in-progress': '#ff7a1a', completed: '#42f59b' };
const statusLabels = { pending: 'Pending', 'in-progress': 'In Progress', completed: 'Completed' };
const priorityColors = { high: '#ff5f87', medium: '#ffc857', low: '#8e9bb8' };

// Admin-only Task Form (no CodeEditor)
function TaskForm({ task, onSave, onClose }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'pending',
    due_date: task?.due_date?.slice(0, 10) || '',
    priority: task?.priority || 'medium',
    assignee_id: task?.assignee_id || user?.id || '',
    project_id: task?.project_id || '',
  });

  useEffect(() => {
    api.getProjects().then(r => setProjects(r.data)).catch(() => {});
    api.getUsers().then(r => setUsers(r.data)).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!form.title.trim()) return;
    if (task) await api.updateTask(task.id, form);
    else await api.createTask(form);
    onSave();
    onClose();
  };

  return (
    <Modal title={task ? 'Edit Task' : 'New Task'} onClose={onClose}>
      <Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Task title" />
      <Textarea label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the task" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
          {Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </Select>
        <Select label="Priority" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </Select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Admin always sees Assignee */}
        <Select label="Assignee" value={form.assignee_id} onChange={e => setForm({ ...form, assignee_id: parseInt(e.target.value) })}>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </Select>
        <Select label="Project" value={form.project_id} onChange={e => setForm({ ...form, project_id: parseInt(e.target.value) })}>
          <option value="">Select Project</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
      </div>
      <Input label="Due Date" type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
      {/* No CodeEditor for admin form */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={handleSave}>Save Task</Btn>
      </div>
    </Modal>
  );
}

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const isAdmin = user?.role === 'admin';

  const refresh = useCallback(() => {
    api.getTasks().then(r => setTasks(r.data)).catch(() => {});
  }, []);

  const handleTaskUpdate = useCallback((updatedTask) => {
    refresh();
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    setSelectedTask(prev => prev?.id === updatedTask.id ? updatedTask : prev);
  }, [refresh]);

  useEffect(() => {
    refresh();
    api.getProjects().then(r => setProjects(r.data)).catch(() => {});
    api.getUsers().then(r => setUsers(r.data)).catch(() => {});
  }, [refresh]);

  const filtered = tasks.filter(t => {
    const statusOk = filter === 'all' || (filter === 'overdue' ? isOverdue(t.due_date) && t.status !== 'completed' : t.status === filter);
    const projectOk = projectFilter === 'all' || t.project_id === parseInt(projectFilter);
    return statusOk && projectOk;
  });

  const handleStatusChange = async (id, status) => {
    await api.updateTask(id, { status });
    refresh();
    if (selectedTask?.id === id) {
      setSelectedTask({ ...selectedTask, status });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this task?')) {
      await api.deleteTask(id);
      refresh();
    }
  };

  const handleCodeChange = async (taskId, code, code_language) => {
    await api.updateTask(taskId, { code, code_language });
    refresh();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 className="page-title" style={{ margin: 0, fontSize: 26, fontWeight: 900 }}>Tasks</h2>
        {/* New Task button — Admin only */}
        {isAdmin && (
          <Btn onClick={() => { setEditTask(null); setShowForm(true); }}>New Task</Btn>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {[['all','All'],['pending','Pending'],['in-progress','In Progress'],['completed','Completed'],['overdue','Overdue']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{
            padding: '7px 14px', borderRadius: 20, cursor: 'pointer',
            fontSize: 12, fontWeight: 800,
            background: filter === v ? 'linear-gradient(90deg, #ff7a1a, #ff3d00)' : 'rgba(255,255,255,0.07)',
            color: filter === v ? '#120905' : '#dce9ff',
            border: filter === v ? 'none' : '1px solid rgba(255,255,255,0.1)',
            transition: 'all 0.3s ease'
          }}>{l}</button>
        ))}
        <select className="field" value={projectFilter} onChange={e => setProjectFilter(e.target.value)}
          style={{ padding: '7px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer' }}>
          <option value="all">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '48px 20px', color: '#8e9bb8', borderRadius: 16 }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>□</div>
          <p style={{ margin: 0 }}>No tasks found.</p>
        </div>
      ) : filtered.map(t => {
        const project = projects.find(p => p.id === t.project_id);
        const assignee = users.find(u => u.id === t.assignee_id);
        const overdue = isOverdue(t.due_date) && t.status !== 'completed';
        const isAssignedToMe = t.assignee_id === user?.id;

        return (
          <div
            key={t.id}
            className="task-card"
            onClick={() => setSelectedTask(t)}
            style={{
              borderLeft: `4px solid ${project?.color || '#ff7a1a'}`,
              borderRadius: 14, padding: '16px 18px', marginBottom: 12,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, fontWeight: 900, color: t.status === 'completed' ? '#8e9bb8' : '#f6fbff', textDecoration: t.status === 'completed' ? 'line-through' : 'none' }}>{t.title}</span>
                  <Badge label={t.priority} color={priorityColors[t.priority]} />
                </div>
                {t.description && <p style={{ margin: '0 0 10px', fontSize: 13, color: '#aeb9d3', lineHeight: 1.5 }}>{t.description}</p>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <select value={t.status} onChange={e => { e.stopPropagation(); handleStatusChange(t.id, e.target.value); }}
                    style={{ padding: '5px 10px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', fontSize: 11, fontWeight: 800, background: statusColors[t.status] + '22', color: statusColors[t.status], cursor: 'pointer', textTransform: 'uppercase' }}>
                    {Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  {project && <span style={{ fontSize: 12, color: project.color, fontWeight: 800 }}>● {project.name}</span>}
                  <span style={{ fontSize: 12, color: overdue ? '#ff5f87' : '#8e9bb8', fontWeight: overdue ? 800 : 600 }}>
                    {overdue ? '! ' : ''}Due {fmtDate(t.due_date)}
                  </span>
                  {assignee && <span style={{ fontSize: 12, color: '#aeb9d3' }}>@ {assignee.name}</span>}
                </div>

                {/* CodeEditor — Member only, on their assigned tasks */}
                {!isAdmin && isAssignedToMe && (
                  <div style={{ marginTop: 16 }} onClick={e => e.stopPropagation()}>
                    <CodeEditor
                      task={t}
                      onCodeChange={(code, language) => handleCodeChange(t.id, code, language)}
                    />
                  </div>
                )}
              </div>

              {/* Edit/Delete — Admin only */}
              {isAdmin && (
                <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                  <Btn variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditTask(t); setShowForm(true); }}>Edit</Btn>
                  <Btn variant="ghost" size="sm" style={{ color: '#ff89a7' }} onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}>Delete</Btn>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Task Form Modal — Admin only */}
      {isAdmin && showForm && (
        <TaskForm task={editTask} onSave={refresh} onClose={() => { setShowForm(false); setEditTask(null); }} />
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          projects={projects}
          users={users}
          onClose={() => setSelectedTask(null)}
          onStatusChange={handleStatusChange}
          onSave={handleTaskUpdate}
        />
      )}
    </div>
  );
}