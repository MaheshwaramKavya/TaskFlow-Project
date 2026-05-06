import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import AuthPage from './AuthPage';

export default function HomePage() {
  const { user } = useAuth();

  if (user) {
    return null; // Return to dashboard if logged in
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #050812 0%, #0a0e27 50%, #050812 100%)',
      color: '#f0f4ff', fontFamily: 'Inter, sans-serif'
    }}>
      {/* Navigation */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 40px', position: 'fixed', top: 0, width: '100%', zIndex: 100,
        background: 'linear-gradient(180deg, rgba(5,8,18,0.9), transparent)',
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 24, fontWeight: 900 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 8,
            background: 'linear-gradient(135deg, #00d4ff, #8b00ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#050812', boxShadow: '0 0 20px rgba(0, 212, 255, 0.3), 0 0 40px rgba(139, 0, 255, 0.15)',
            fontWeight: 900
          }}>T</div>
          <span style={{background: 'linear-gradient(135deg, #00d4ff, #8b00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>TaskFlow</span>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '100px 40px 80px', textAlign: 'center', position: 'relative'
      }}>
        <div style={{
          position: 'absolute', inset: 0, background:
          'radial-gradient(circle at 20% 50%, rgba(0, 212, 255, 0.15), transparent 50%)',
          pointerEvents: 'none'
        }} />
        
        <h1 style={{
          fontSize: 'clamp(48px, 8vw, 80px)', fontWeight: 900, margin: '0 0 20px',
          background: 'linear-gradient(135deg, #f0f4ff, #00d4ff, #8b00ff)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', textShadow: '0 0 30px rgba(0, 212, 255, 0.1)',
          letterSpacing: '-1px'
        }}>
          Manage Your Workflow
        </h1>
        
        <p style={{
          fontSize: 'clamp(16px, 2vw, 24px)', color: '#a9b8d8', margin: '0 0 40px',
          maxWidth: 600, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6,
          fontWeight: 500
        }}>
          TaskFlow is a modern task management platform with real-time collaboration, 
          live code execution, and AI-powered insights.
        </p>

        {/* Features */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 20, maxWidth: 900, margin: '0 auto 60px'
        }}>
          {[
            { icon: '⚡', title: 'Real-time Sync', desc: 'See updates instantly' },
            { icon: '💬', title: 'Team Chat', desc: 'Built-in collaboration' },
            { icon: '🔧', title: 'Code Execution', desc: 'Run code snippets' },
            { icon: '📧', title: 'Smart Reminders', desc: 'Never miss deadlines' }
          ].map((feat, i) => (
            <div key={i} style={{
              background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.08), rgba(139, 0, 255, 0.05))', 
              border: '1px solid rgba(0, 212, 255, 0.2)',
              borderRadius: 12, padding: 20, textAlign: 'center',
              boxShadow: '0 0 20px rgba(0, 212, 255, 0.05), 0 8px 24px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.3s ease', cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.15), 0 15px 40px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.05), 0 8px 24px rgba(0, 0, 0, 0.2)';
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{feat.icon}</div>
              <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: '#f0f4ff' }}>{feat.title}</h3>
              <p style={{ margin: 0, fontSize: 13, color: '#a9b8d8', fontWeight: 500 }}>{feat.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginBottom: 60, flexWrap: 'wrap' }}>
          <button onClick={() => {
            document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
          }} style={{
            padding: '14px 40px', borderRadius: 8, border: 'none',
            background: 'linear-gradient(135deg, #00d4ff, #8b00ff)', color: '#050812',
            fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 0 30px rgba(0, 212, 255, 0.4), 0 12px 40px rgba(139, 0, 255, 0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 0 40px rgba(0, 212, 255, 0.5), 0 18px 50px rgba(139, 0, 255, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.4), 0 12px 40px rgba(139, 0, 255, 0.3)';
          }}>
            Get Started Free
          </button>
          <button style={{
            padding: '14px 40px', borderRadius: 8, border: '2px solid #00d4ff',
            background: 'transparent', color: '#00d4ff', fontWeight: 700, fontSize: 16,
            cursor: 'pointer', transition: 'all 0.3s ease',
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)';
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.2)';
          }}>
            Watch Demo
          </button>
        </div>
      </section>

      {/* Auth Section */}
      <section id="auth-section">
        <AuthPage />
      </section>

      {/* Footer */}
      <footer style={{
        padding: '40px', textAlign: 'center', borderTop: '1px solid rgba(106,92,255,0.2)',
        color: '#a9b0d4', fontSize: 13
      }}>
        <p>TaskFlow © 2024. Made with ❤️ for productive teams.</p>
      </footer>
    </div>
  );
}
