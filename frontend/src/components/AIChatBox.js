import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthContext';
import * as api from '../api';

export default function AIChatBox() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { id: 1, type: 'ai', text: 'Hi! I\'m your AI assistant. I can help you manage tasks, projects, and more. What would you like to do?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = async (userMessage) => {
    // Simulate AI responses based on keywords
    const lowerMessage = userMessage.toLowerCase();
    
    let aiResponse = '';
    
    if (lowerMessage.includes('create') || lowerMessage.includes('new') || lowerMessage.includes('add')) {
      aiResponse = 'I can help you create new tasks or projects. Would you like to create a new task or project? Just let me know the details!';
    } else if (lowerMessage.includes('task') || lowerMessage.includes('todo')) {
      aiResponse = 'Great! I can help manage your tasks. You can create, update, or delete tasks. What specific task information do you need?';
    } else if (lowerMessage.includes('project')) {
      aiResponse = 'I can help you with your projects. You can organize tasks into projects for better management. What would you like to do?';
    } else if (lowerMessage.includes('help')) {
      aiResponse = 'I\'m here to help! I can assist with:\n• Creating and managing tasks\n• Organizing projects\n• Tracking task status\n• Setting priorities\n• Managing team members\n\nWhat do you need?';
    } else if (lowerMessage.includes('status') || lowerMessage.includes('how') || lowerMessage.includes('what')) {
      aiResponse = 'I can provide insights about your work. You can check task statuses, project progress, and team performance. What information would you like?';
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      aiResponse = `Hello ${user?.name || 'there'}! Ready to boost your productivity? How can I assist you today?`;
    } else if (lowerMessage.includes('thanks') || lowerMessage.includes('thank')) {
      aiResponse = 'You\'re welcome! Feel free to ask me anything else. I\'m always here to help! 🚀';
    } else {
      aiResponse = `Got it! "${userMessage}" - I understand. I can help with tasks, projects, and team management. What would you like to focus on?`;
    }
    
    return aiResponse;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const aiResponse = await getAIResponse(input);
      
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          type: 'ai',
          text: aiResponse,
          timestamp: new Date()
        }]);
        setLoading(false);
      }, 600);
    } catch (error) {
      console.error('AI response error:', error);
      setLoading(false);
    }
  };

  return (
    <div className="ai-chatbox-wrapper">
      <button
        className="ai-chatbox-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="AI Assistant"
      >
        <span className="chat-icon">💬</span>
        {!isOpen && <span className="chat-badge">AI</span>}
      </button>

      {isOpen && (
        <div className="ai-chatbox-panel">
          <div className="ai-chatbox-header">
            <div className="ai-chatbox-title">
              <span className="ai-icon">🤖</span>
              <div>
                <h3>AI Assistant</h3>
                <p>Online</p>
              </div>
            </div>
            <button 
              className="ai-close-btn" 
              onClick={() => setIsOpen(false)}
              title="Close chat"
            >
              ✕
            </button>
          </div>

          <div className="ai-chatbox-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`ai-message ${msg.type}`}
              >
                {msg.type === 'ai' && <span className="ai-avatar">🤖</span>}
                <div className="ai-message-content">
                  <div className="ai-message-text">{msg.text}</div>
                  <span className="ai-message-time">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {msg.type === 'user' && <span className="ai-avatar">{user?.name?.charAt(0)}</span>}
              </div>
            ))}
            {loading && (
              <div className="ai-message ai">
                <span className="ai-avatar">🤖</span>
                <div className="ai-message-content">
                  <div className="ai-typing">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="ai-chatbox-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              disabled={loading}
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              title="Send message"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
