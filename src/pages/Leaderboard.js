// src/pages/Leaderboard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Leaderboard.css'; // We will create this CSS next

const Leaderboard = () => {
  const navigate = useNavigate();

  // 1. Mock Data for the Global Leaderboard
  const leaders = [
    { rank: 1, name: "Neural_God", subjects: 42, xp: "950k", status: "Legendary" },
    { rank: 2, name: "Code_Valkyrie", subjects: 39, xp: "890k", status: "Elite" },
    { rank: 3, name: "Zero_Cool", subjects: 35, xp: "820k", status: "Elite" },
    { rank: 4, name: "Cyber_Punk", subjects: 31, xp: "750k", status: "Veteran" },
    { rank: 156, name: "You (Student)", subjects: 1, xp: "5k", status: "Rookie" }, // The User
  ];

  // 2. Logic for Next Recommendation
  // In a real app, you'd fetch 'lastCompleted' from your database
  const lastCompleted = "Python Basics"; 
  
  const roadmap = {
    "Python Basics": { next: "Data Structures & Algo", reason: "Python is the tool, DSA is how you use it to solve real problems." },
    "Java": { next: "Spring Boot", reason: "You know the language, now build enterprise-grade backends." },
    "JavaScript": { next: "React.js", reason: "DOM manipulation is cool, but Component-based UI is the future." },
    "C++": { next: "Unreal Engine / Game Dev", reason: "Unleash high-performance code for graphical dominance." },
  };

  const recommendation = roadmap[lastCompleted] || { next: "Advanced Logic Building", reason: "Keep sharpening that brain." };

  const handleAcceptChallenge = () => {
    // In a real app, this would add to your specific Tasks Context
    alert(`🚀 MISSION ACCEPTED: ${recommendation.next} added to your Tasks!`);
    navigate('/tasks');
  };

  return (
    <div className="leaderboard-container">
      <h1 className="cyber-title">🌐 Global Neural Network Rankings</h1>
      
      {/* THE LEADERBOARD TABLE */}
      <div className="leaderboard-card">
        <div className="table-header">
          <span>Rank</span>
          <span>Hacker Tag</span>
          <span>Mastered</span>
          <span>XP</span>
        </div>
        <div className="table-body">
          {leaders.map((user) => (
            <div key={user.rank} className={`table-row ${user.name.includes("You") ? "highlight-user" : ""}`}>
              <span className="rank">#{user.rank}</span>
              <span className="name">{user.name} {user.status === "Legendary" && "👑"}</span>
              <span className="score">{user.subjects} Courses</span>
              <span className="xp">{user.xp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* MOTIVATION & NEXT TASK ENGINE */}
      <div className="motivation-section">
        <div className="motivation-card">
          <h2>🚀 Skill Evolution Detected</h2>
          <p className="subtext">System Analysis of your recent mastery:</p>
          
          <div className="skill-bridge">
            <span className="completed-skill">✅ {lastCompleted}</span>
            <span className="arrow">➔</span>
            <span className="new-skill">🔥 {recommendation.next}</span>
          </div>

          <div className="ai-reasoning">
            <strong>AI Logic:</strong> "{recommendation.reason}"
          </div>

          <div className="quote-box">
            "The only time you should look back is to see how far you've come. 
            Eyes on the next level, Legend."
          </div>

          <button className="accept-btn" onClick={handleAcceptChallenge}>
            [ ACCEPT NEW MISSION ]
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;