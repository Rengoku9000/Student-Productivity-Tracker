// src/pages/MotivationCenter.js
import React, { useEffect, useState } from "react";
import "./DashboardDetail.css";

const QUOTES = [
  "Success is the sum of small efforts repeated day in and day out.",
  "Grind now, shine later. 🎮",
  "Your future is created by what you do today, not tomorrow.",
  "XP isn’t just in games. You’re leveling up your brain.",
  "Discipline is choosing what you want most over what you want now.",
  "Every expert was once a beginner who didn’t quit.",
  "Small steps every day beat big bursts once a month.",
  "Your only competition is your previous self.",
  "Turn your study time into god-mode focus.",
  "AFK from distractions. Online in your goals.",
];

const HISTORY_KEY = "motivationHistory";

const MotivationCenter = () => {
  const [todayQuote, setTodayQuote] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);

    let idx = 0;
    try {
      idx = parseInt(localStorage.getItem("dashQuoteIndex") || "0", 10);
      if (Number.isNaN(idx)) idx = 0;
    } catch {
      idx = 0;
    }

    const quote = QUOTES[idx % QUOTES.length];
    setTodayQuote(quote);

    try {
      const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      const arr = Array.isArray(stored) ? stored : [];
      if (!arr.find((x) => x.date === today)) {
        arr.push({ date: today, text: quote });
        localStorage.setItem(HISTORY_KEY, JSON.stringify(arr));
      }
      setHistory(arr.reverse());
    } catch {
      setHistory([{ date: today, text: quote }]);
    }
  }, []);

  return (
    <div className="detail-page">
      <div className="detail-header">
        <div>
          <h2 className="detail-title">Motivation Center</h2>
          <p className="detail-subtitle">
            Your daily buffs, tracked like streaks in a game.
          </p>
        </div>
        <div className="detail-pill">Mindset • XP Boost</div>
      </div>

      <div className="detail-card">
        <h3 className="detail-card-title">Today&apos;s Buff</h3>
        <p style={{ fontSize: "1rem", fontWeight: 600 }}>
          “{todayQuote}”
        </p>
        <p className="detail-note">
          Read it once, close your eyes for 5 seconds and imagine you
          already achieved your exam goal.
        </p>
      </div>

      <div className="detail-card">
        <h3 className="detail-card-title">Past Buffs</h3>
        {history.length === 0 ? (
          <p className="detail-note">
            No history yet. Visit this page again after a few days of
            studying.
          </p>
        ) : (
          <ul className="detail-list">
            {history.map((h, i) => (
              <li key={i} className="detail-list-item">
                <div className="detail-item-main">
                  <span className="detail-item-label">{h.date}</span>
                  <span className="detail-item-sub">“{h.text}”</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MotivationCenter;
