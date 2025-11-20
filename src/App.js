import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Routine from './pages/Routine';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import './App.css';

function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/tasks', label: 'Tasks', icon: '✅' },
    { path: '/routine', label: 'Routine', icon: '📅' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/profile', label: 'Profile', icon: '👤' }
  ];
  
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span className="brand-icon">🎯</span>
        <span className="brand-text">StudyOptimizer</span>
      </div>
      <div className="nav-links">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/routine" element={<Routine />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;