import React, { useState, useEffect } from 'react';
import ChatBox from './ChatBox';
import CodeEditor from './CodeEditor';
import { Modal, Badge, Btn } from './UI';
import * as api from '../api';

export default function TaskDetailModal({ task, projects, users, onClose, onStatusChange, onSave }) {
  const [codeValue, setCodeValue] = useState(task?.code || '');
  const [codeLanguage, setCodeLanguage] = useState(task?.code_language || 'javascript');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    setCodeValue(task?.code || '');
    setCodeLanguage(task?.code_language || 'javascript');
  }, [task]);

  if (!task) return null;

  const project = projects?.find(p => p.id === task.project_id);
  const assignee = users?.find(u => u.id === task.assignee_id);
  const statusColors = { pending: '#ffc857', 'in-progress': '#ff7a1a', completed: '#42f59b' };
  const priorityColors = { high: '#ff5f87', medium: '#ffc857', low: '#8e9bb8' };
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  const handleSaveCode = async () => {
    setSaving(true);
    setSaveMessage('');
    try {
      const response = await api.updateTask(task.id, {
        code: codeValue,
        code_language: codeLanguage
      });
      setSaveMessage('Code saved successfully.');
      setCodeValue(response.data.code ?? codeValue);
      setCodeLanguage(response.data.code_language ?? codeLanguage);
      onSave?.(response.data); // Pass the updated task to parent state
    } catch (err) {
      console.error('Failed to save task code:', err);
      const message = err.response?.data?.message || err.message || 'Failed to save code.';
      setSaveMessage(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="" onClose={onClose} fullScreen>
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 24, height: '100%', overflowY: 'auto' }}>
        {/* Left: Task Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minHeight: 0 }}>
          {/* Title & Status */}
          <div>
            <h2 style={{
              margin: '0 0 12px', fontSize: 22, fontWeight: 900, color: '#f6fbff',
              textDecoration: task.status === 'completed' ? 'line-through' : 'none'
            }}>
              {task.title}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <select value={task.status} onChange={e => onStatusChange(task.id, e.target.value)}
                style={{
                  padding: '6px 10px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)',
                  fontSize: 11, fontWeight: 800, background: statusColors[task.status] + '22',
                  color: statusColors[task.status], cursor: 'pointer', textTransform: 'uppercase'
                }}>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <Badge label={task.priority} color={priorityColors[task.priority]} />
              {task.code && <Badge label="Has Code" color="#69e6ff" />}
            </div>
          </div>

          {/* Details */}
          {task.description && (
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: '#8e9bb8', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>
                Description
              </label>
              <p style={{ margin: 0, fontSize: 13, color: '#e8ebff', lineHeight: 1.6 }}>
                {task.description}
              </p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {project && (
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: '#8e9bb8', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>
                  Project
                </label>
                <div style={{ fontSize: 13, color: project.color, fontWeight: 700 }}>
                  ● {project.name}
                </div>
              </div>
            )}
            {assignee && (
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: '#8e9bb8', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>
                  Assigned To
                </label>
                <div style={{ fontSize: 13, color: '#e8ebff' }}>
                  {assignee.name}
                </div>
              </div>
            )}
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: '#8e9bb8', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>
              Due Date
            </label>
            <div style={{
              fontSize: 13, color: isOverdue ? '#ff5f87' : '#e8ebff',
              fontWeight: isOverdue ? 800 : 600
            }}>
              {isOverdue && '⚠ '}
              {task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date'}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: '#8e9bb8', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>
              Code Workspace
            </label>
            <CodeEditor
              task={{ code: codeValue, code_language: codeLanguage }}
              onCodeChange={(code, language) => {
                setCodeValue(code);
                setCodeLanguage(language);
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Btn onClick={handleSaveCode} disabled={saving}>
              {saving ? 'Saving...' : 'Save Code'}
            </Btn>
            {saveMessage && <span style={{ color: '#a9b0d4', fontSize: 13 }}>{saveMessage}</span>}
          </div>
        </div>

        {/* Right: Chat */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <ChatBox taskId={task.id} />
        </div>
      </div>
    </Modal>
  );
}
