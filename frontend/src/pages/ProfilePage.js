import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import * as api from '../api';
import { Avatar, Modal, Input, Textarea } from '../components/UI';

export default function ProfilePage() {
  const { user, loginUser } = useAuth();
  const [profile, setProfile] = useState(user || {});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.getMe();
        setProfile(res.data);
      } catch (err) {
        console.warn('Could not refresh profile on mount', err.message);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const res = await api.updateUser(user.id, {
        name: profile.name,
        email: profile.email,
        bio: profile.bio || ''
      });
      loginUser(res.data, localStorage.getItem('token'));
      setProfile(res.data);
      setEditing(false);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40,
        padding: '20px 0', borderBottom: '1px solid rgba(106,92,255,0.2)'
      }}>
        <Avatar initials={profile.name?.slice(0, 2).toUpperCase() || 'U'} size={72} />
        <div>
          <h1 style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 800, color: '#f6fbff' }}>
            {profile.name}
          </h1>
          <p style={{ margin: 0, color: '#a9b0d4', fontSize: 13 }}>
            {profile.email} • {profile.role?.charAt(0).toUpperCase() + profile.role?.slice(1)}
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && <div style={{
        background: 'rgba(255,126,179,0.1)', border: '1px solid #ff7eb3',
        borderRadius: 8, padding: 12, marginBottom: 16, color: '#ff7eb3', fontSize: 13
      }}>{error}</div>}
      {success && <div style={{
        background: 'rgba(110,255,194,0.1)', border: '1px solid #6effc2',
        borderRadius: 8, padding: 12, marginBottom: 16, color: '#6effc2', fontSize: 13
      }}>{success}</div>}

      {/* Profile Info */}
      {!editing ? (
        <div className="glass-panel" style={{ borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 800, color: '#8e9bb8', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Email
            </label>
            <p style={{ margin: 0, color: '#e8ebff', fontSize: 14 }}>{profile.email}</p>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 800, color: '#8e9bb8', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Bio
            </label>
            <p style={{ margin: 0, color: '#e8ebff', fontSize: 14 }}>
              {profile.bio || 'No bio added yet'}
            </p>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 800, color: '#8e9bb8', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Joined
            </label>
            <p style={{ margin: 0, color: '#e8ebff', fontSize: 14 }}>
              {profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not available yet'}
            </p>
          </div>
          <button onClick={() => setEditing(true)} style={{
            padding: '10px 20px', borderRadius: 8, border: 'none',
            background: 'linear-gradient(90deg, #69e6ff, #7b5cff)', color: '#0f1127',
            fontWeight: 700, cursor: 'pointer'
          }}>
            Edit Profile
          </button>
        </div>
      ) : (
        <Modal title="Edit Profile" onClose={() => setEditing(false)}>
          <Input
            label="Name"
            value={profile.name}
            onChange={e => handleChange('name', e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            value={profile.email}
            onChange={e => handleChange('email', e.target.value)}
          />
          <Textarea
            label="Bio"
            value={profile.bio || ''}
            onChange={e => handleChange('bio', e.target.value)}
            placeholder="Tell us about yourself..."
            style={{ minHeight: 100 }}
          />
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={handleSave} disabled={loading} style={{
              flex: 1, padding: '11px 12px', borderRadius: 8,
              background: 'linear-gradient(90deg, #69e6ff, #7b5cff)', color: '#0f1127',
              border: 'none', fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.6 : 1
            }}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={() => setEditing(false)} style={{
              flex: 1, padding: '11px 12px', borderRadius: 8,
              background: 'rgba(255,255,255,0.1)', color: '#e8ebff',
              border: '1px solid rgba(255,255,255,0.2)', fontWeight: 700, cursor: 'pointer'
            }}>
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16
      }}>
        <div className="glass-panel" style={{ borderRadius: 12, padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#69e6ff', marginBottom: 6 }}>
            {user?.task_count || 0}
          </div>
          <div style={{ fontSize: 12, color: '#a9b0d4', fontWeight: 600 }}>Tasks</div>
        </div>
        <div className="glass-panel" style={{ borderRadius: 12, padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#7b5cff', marginBottom: 6 }}>
            {user?.project_count || 0}
          </div>
          <div style={{ fontSize: 12, color: '#a9b0d4', fontWeight: 600 }}>Projects</div>
        </div>
        <div className="glass-panel" style={{ borderRadius: 12, padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#ff65d0', marginBottom: 6 }}>
            {user?.team_count || 0}
          </div>
          <div style={{ fontSize: 12, color: '#a9b0d4', fontWeight: 600 }}>Team</div>
        </div>
      </div>
    </div>
  );
}
