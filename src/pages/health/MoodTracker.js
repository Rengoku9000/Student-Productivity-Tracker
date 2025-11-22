// src/pages/health/MoodTracker.js
import React, { useContext, useMemo, useState } from "react";
import { HealthContext } from "./HealthContext";
import "./MoodTracker.css";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// dd/mm/yy format
const getTodayDDMMYY = () => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).toString().slice(-2);
  return `${day}/${month}/${year}`;
};

const MoodTracker = () => {
  const { healthState, setHealthState } = useContext(HealthContext);

  const [date] = useState(getTodayDDMMYY());
  const [mood, setMood] = useState("");
  const [stress, setStress] = useState("");
  const [notes, setNotes] = useState("");
  const [affirmation, setAffirmation] = useState("");

  const moodLogs = healthState.history?.moodLogs || [];

  const daysLogged = moodLogs.length;

  const avgStress = useMemo(() => {
    if (!moodLogs.length) return 0;
    const sum = moodLogs.reduce(
      (acc, log) => acc + (Number(log.stress) || 0),
      0
    );
    return sum / moodLogs.length;
  }, [moodLogs]);

  const lastAffirmation =
    moodLogs.length > 0 ? moodLogs[moodLogs.length - 1].affirmation : "";

  // build chart data from last 7 logs
  const chartData = useMemo(
    () =>
      moodLogs.slice(-7).map((log) => ({
        day: log.dateLabel || log.date || "?",
        stress: Number(log.stress) || 0,
      })),
    [moodLogs]
  );

  const handleSave = () => {
    const numericStress = Number(stress);

    if (!mood.trim()) {
      alert("Please enter your mood for today.");
      return;
    }
    if (isNaN(numericStress) || numericStress < 0 || numericStress > 10) {
      alert("Stress level should be a number between 0 and 10.");
      return;
    }

    const newEntry = {
      date,
      dateLabel: date, // dd/mm/yy
      mood: mood.trim(),
      stress: numericStress,
      notes: notes.trim(),
      affirmation: affirmation.trim(),
    };

    setHealthState((prev) => {
      const prevHistory = prev.history || {
        sleepHours: [],
        screenHours: [],
        activityMinutes: [],
      };

      return {
        ...prev,
        mood: {
          todayMood: mood.trim(),
          stressLevel: numericStress,
          notes: notes.trim(),
          affirmation: affirmation.trim(),
        },
        history: {
          ...prevHistory,
          moodLogs: [...(prevHistory.moodLogs || []), newEntry],
        },
      };
    });

    // Clear text fields but keep date
    setMood("");
    setStress("");
    setNotes("");
    setAffirmation("");
  };

  return (
    <div className="mood-cyber-container">
      <h3 className="mood-title">Mood &amp; Mindspace</h3>
      <p className="mood-subtitle">
        Check in with yourself: mood, stress, and an affirmation to guide your
        day.
      </p>

      <div className="mood-main-row">
        {/* LEFT: inputs */}
        <div className="mood-form-col">
          <div className="mood-input-group">
            <label>Date (dd/mm/yy)</label>
            <input type="text" value={date} readOnly />
          </div>

          <div className="mood-input-group">
            <label>How do you feel today?</label>
            <input
              type="text"
              placeholder="e.g. Calm, Anxious, Excited, Tired"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
            />
          </div>

          <div className="mood-input-group">
            <label>Stress level (0–10)</label>
            <input
              type="number"
              min="0"
              max="10"
              placeholder="e.g. 4"
              value={stress}
              onChange={(e) => setStress(e.target.value)}
            />
          </div>

          <div className="mood-input-group">
            <label>Notes</label>
            <textarea
              rows={3}
              placeholder="What made you feel this way?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="mood-input-group">
            <label>Positive affirmation</label>
            <textarea
              rows={2}
              placeholder="e.g. I am capable and improving every day."
              value={affirmation}
              onChange={(e) => setAffirmation(e.target.value)}
            />
          </div>

          <button className="mood-btn" onClick={handleSave}>
            Save Mood Log
          </button>
        </div>

        {/* RIGHT: stats + chart + affirmation */}
        <div className="mood-right-col">
          {/* stats */}
          <div className="mood-stats-row">
            <div className="mood-stat-card">
              <div className="mood-stat-label">Days Logged</div>
              <div className="mood-stat-value">{daysLogged}</div>
            </div>
            <div className="mood-stat-card">
              <div className="mood-stat-label">Avg Stress (0–10)</div>
              <div className="mood-stat-value">
                {daysLogged ? avgStress.toFixed(1) : "--"}
              </div>
            </div>
          </div>

          {/* line graph inside same card */}
          <div className="mood-chart-card">
            <div className="mood-chart-title">
              Stress trend (last {chartData.length || 0} logs)
            </div>
            {!chartData.length ? (
              <div className="mood-chart-empty">
                Save a few mood logs to see your stress trend over time.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="4 4"
                    stroke="rgba(244, 114, 182, 0.25)"
                  />
                  <XAxis dataKey="day" stroke="#f9a8d4" />
                  <YAxis
                    allowDecimals={false}
                    domain={[0, 10]}
                    stroke="#f9a8d4"
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#020617",
                      border: "1px solid #ec4899",
                      color: "#fdf2f8",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="stress"
                    name="Stress"
                    stroke="#ec4899"
                    strokeWidth={4} // bold line
                    dot={{ r: 5, stroke: "#f9a8d4", strokeWidth: 2 }}
                    activeDot={{ r: 8, strokeWidth: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* affirmation */}
          <div className="mood-affirm-card">
            <div className="mood-affirm-title">Latest affirmation</div>
            {lastAffirmation ? (
              <p className="mood-affirm-text">“{lastAffirmation}”</p>
            ) : (
              <p className="mood-affirm-empty">
                Save an affirmation to see it highlighted here.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;