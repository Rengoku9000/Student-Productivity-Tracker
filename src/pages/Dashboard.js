// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import '../pages/Dashboard.css';
import { getFromStorage } from '../utils/storage';
import { analyzeProductivity, recommendTimeSlot } from '../utils/aiEngine';

const Dashboard = () => {
  const [stats, setStats] = useState({
    completed: 0,
    pending: 0,
    productivity: 0,
  });
  const [recommendations, setRecommendations] = useState([]);
  const [user, setUser] = useState({ name: 'Student', goals: [] });

  useEffect(() => {
    // DEMO: Populate with sample data if none exists
    if (!getFromStorage('userProfile')) {
      localStorage.setItem('userProfile', JSON.stringify({name: 'Student', goals: ['Crack GATE', 'Improve DSA']}));
    }
    if (!getFromStorage('tasks')) {
      localStorage.setItem('tasks', JSON.stringify([
        { id: 1, title: 'Study Algorithms', completed: true },
        { id: 2, title: 'Attend ML lecture', completed: false },
      ]));
    }

    const userProfile = getFromStorage('userProfile') || { name: 'Student', goals: [] };
    setUser(userProfile);

    const tasks = getFromStorage('tasks') || [];
    const productivityStats = analyzeProductivity(tasks);
    setStats({
      completed: productivityStats.completed,
      pending: productivityStats.pending,
      productivity: productivityStats.productivity,
    });

    const aiRecs = recommendTimeSlot(tasks);
    setRecommendations(Array.isArray(aiRecs) ? aiRecs : [aiRecs]);
  }, []);

  // Helper to format object recommendations
  const formatRecommendation = rec => {
    if (typeof rec === 'string') return rec;
    if (typeof rec === 'object' && rec !== null) {
      // Customize this based on your recommendation object shape!
      return `${rec.time ? `At ${rec.time}: ` : ''}${rec.reason || ''}${rec.score !== undefined ? ` (Score: ${rec.score})` : ''}`;
    }
    return '';
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome, {user.name}</h2>
        <p>Your goals: {user.goals && user.goals.length ? user.goals.join(', ') : 'No goals set'}</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{stats.completed}</h3>
          <p>Tasks Completed</p>
        </div>
        <div className="stat-card">
          <h3>{stats.pending}</h3>
          <p>Pending Tasks</p>
        </div>
        <div className="stat-card">
          <h3>{stats.productivity}%</h3>
          <p>Productivity</p>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-placeholder">[Productivity Over Time Chart]</div>
        <div className="chart-placeholder">[Focus Hours Chart]</div>
        <div className="chart-placeholder">[Sleep & Performance Chart]</div>
      </div>

      <div className="dashboard-ai">
        <h3>AI Recommendations</h3>
        {recommendations.length === 0 ? (
          <p>No insights available. Add some tasks!</p>
        ) : (
          <ul>
            {recommendations.map((rec, idx) => (
              <li key={idx}>{formatRecommendation(rec)}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
