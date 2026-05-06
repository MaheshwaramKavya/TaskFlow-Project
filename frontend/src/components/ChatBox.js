import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthContext';
import * as api from '../api';
import { Avatar, Badge } from './UI';

export default function ChatBox({ taskId, projectId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (taskId || projectId) {
      loadMessages();
    }
  }, [taskId, projectId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError('');
      let res;
      if (taskId) {
        res = await api.getTaskMessages(taskId);
      } else if (projectId) {
        res = await api.getProjectMessages(projectId);
      }
      setMessages(res?.data || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError('Failed to load messages');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    try {
      setError('');
      const messageData = {
        content: input,
        sender_id: user.id
      };

      let res;
      if (taskId) {
        res = await api.createTaskMessage(taskId, messageData);
      } else if (projectId) {
        res = await api.createProjectMessage(projectId, messageData);
      }
      
      if (res?.data) {
        setMessages(prev => [...prev, {
          ...res.data,
          sender_name: user.name
        }] );
        setInput('');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
    }
  };

  if (!taskId && !projectId) {
    return <div style={{ color: '#a9b0d4', fontSize: 13 }}>No task or project selected</div>;
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '500px',
      background: 'linear-gradient(135deg, rgba(13,11,34,0.8), rgba(12,13,42,0.6))',
      borderRadius: 16, border: '1px solid rgba(106,92,255,0.3)', overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
      backdropFilter: 'blur(32px)'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px', borderBottom: '1px solid rgba(106,92,255,0.2)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'linear-gradient(180deg, rgba(20,17,50,0.8), transparent)'
      }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#e8ebff' }}>
          💬 Team Chat
        </h3>
        <Badge label="Live" color="#6effc2" />
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex',
        flexDirection: 'column', gap: 10, minHeight: 0
      }}>
        {messages.length === 0 ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100%', color: '#a9b0d4', fontSize: 13, textAlign: 'center'
          }}>
            {loading ? 'Loading messages...' : 'No messages yet. Start a conversation!'}
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, alignItems: 'flex-start',
              animation: 'slideUp 0.3s ease-out',
              padding: '10px',
              background: 'rgba(106,92,255,0.08)',
              borderRadius: 10,
              borderLeft: '3px solid #69e6ff'
            }}>
              <Avatar 
                initials={(msg.sender_name || 'U').slice(0, 2).toUpperCase()} 
                size={32}
                color='#69e6ff'
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#69e6ff', marginBottom: 3 }}>
                  {msg.sender_name || 'Unknown'}
                </div>
                <div style={{
                  fontSize: 13, color: '#e8ebff', wordWrap: 'break-word',
                  lineHeight: 1.4
                }}>
                  {msg.content}
                </div>
                <div style={{ fontSize: 10, color: '#a9b0d4', marginTop: 4 }}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {error && (
        <div style={{
          padding: '8px 12px', background: 'rgba(255,127,179,0.1)', color: '#ff7eb3',
          fontSize: 11, borderTop: '1px solid rgba(255,127,179,0.2)'
        }}>
          {error}
        </div>
      )}
      <div style={{
        padding: '12px 16px', borderTop: '1px solid rgba(106,92,255,0.2)',
        display: 'flex', gap: 8, background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.2))'
      }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          style={{
            flex: 1, padding: '10px 12px', borderRadius: 8, fontSize: 13,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(106,92,255,0.3)',
            color: '#e8ebff', outline: 'none', transition: 'all 0.3s ease',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
          }}
          disabled={loading}
          onFocus={(e) => {
            e.target.style.borderColor = 'rgba(106,92,255,0.6)';
            e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2), 0 0 15px rgba(106,92,255,0.15)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(106,92,255,0.3)';
            e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)';
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{
            padding: '10px 18px', borderRadius: 8, border: 'none',
            background: 'linear-gradient(135deg, #69e6ff, #7b5cff)',
            color: '#0f1127', fontWeight: 700, fontSize: 12, cursor: 'pointer',
            opacity: loading || !input.trim() ? 0.6 : 1, transition: 'all 0.3s ease',
            boxShadow: '0 8px 20px rgba(105,230,255,0.25)',
            transform: loading || !input.trim() ? 'none' : 'translateY(0)'
          }}
          onMouseEnter={(e) => {
            if (!loading && input.trim()) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 12px 30px rgba(105,230,255,0.35)';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 8px 20px rgba(105,230,255,0.25)';
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
