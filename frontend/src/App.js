import React, { useState } from 'react';
import { AuthProvider, useAuth } from './components/AuthContext';
import Sidebar from './components/Sidebar';
import AIChatBox from './components/AIChatBox';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import TasksPage from './pages/TasksPage';
import ProjectsPage from './pages/ProjectsPage';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage';

function AppInner() {
  const { user } = useAuth();
  const [page, setPage] = useState('dashboard');

  if (!user) return <HomePage />;

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard onNavigate={setPage} />;
      case 'tasks':     return <TasksPage />;
      case 'projects':  return <ProjectsPage />;
      case 'users':     return user.role === 'admin' ? <UsersPage /> : null;
      case 'profile':   return <ProfilePage />;
      default:          return <Dashboard onNavigate={setPage} />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar page={page} onNavigate={setPage} />
      <div className="content-stage">
        <div className="orbital-scene" aria-hidden="true">
          <div className="cube"><span /><span /><span /></div>
          <div className="poly" />
          <div className="cube-small"><span /><span /><span /></div>
        </div>
        <div className="content-inner">
          {renderPage()}
        </div>
      </div>
      <AIChatBox />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
