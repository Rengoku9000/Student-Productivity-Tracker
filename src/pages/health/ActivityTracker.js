// src/pages/health/ActivityTracker.js
import React, { useContext, useEffect, useMemo, useState } from "react";
import { HealthContext } from "./HealthContext";
import "./ActivityTracker.css";

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

// ✅ UPGRADED "mock" function: tries Google Fit via backend, falls back to random
const mockAutoActivityData = async () => {
  try {
    // Call your backend, which talks to Google Fit
    // Change the URL if your backend route is different
    const res = await fetch("http://localhost:5000/api/googlefit/summary");

    if (res.ok) {
      const data = await res.json();

      // Try to read common field names
      const steps =
        data.steps ??
        data.stepCount ??
        data.step_count ??
        null;

      const minutes =
        data.minutes ??
        data.activeMinutes ??
        data.moveMinutes ??
        null;

      if (steps != null && minutes != null) {
        return {
          steps,
          minutes,
        };
      }
    }
  } catch (err) {
    console.error(
      "Failed to fetch Google Fit data, falling back to simulated data:",
      err
    );
  }

  // 🔙 Original simulated behaviour (unchanged)
  const baseSteps = 6000 + Math.floor(Math.random() * 4000); // 6000–10000
  const duration = 20 + Math.floor(Math.random() * 30); // 20–50 mins
  return {
    steps: baseSteps,
    minutes: duration,
  };
};

const ActivityTracker = () => {
  const { healthState, setHealthState } = useContext(HealthContext);

  const [date] = useState(getTodayDDMMYY());
  const [steps, setSteps] = useState("");
  const [minutes, setMinutes] = useState("");
  const [exercise, setExercise] = useState("");
  const [intensity, setIntensity] = useState("");

  // on mount, autodetect pedometer + duration (now Google Fit → fallback to mock)
  useEffect(() => {
    const loadAutoActivity = async () => {
      const auto = await mockAutoActivityData();
      setSteps(String(auto.steps));
      setMinutes(String(auto.minutes));
    };
    loadAutoActivity();
  }, []);

  const logs = healthState.history?.activityMinutes || [];

  const todayLog = logs[logs.length - 1] || null;

  const averageMinutes = useMemo(() => {
    if (!logs.length) return 0;
    const sum = logs.reduce((acc, l) => acc + (l.value || 0), 0);
    return sum / logs.length;
  }, [logs]);

  const chartData = useMemo(
    () =>
      logs.slice(-7).map((log) => ({
        day: log.day,
        minutes: log.value,
      })),
    [logs]
  );

  const handleSave = () => {
    const numericSteps = Number(steps);
    const numericMinutes = Number(minutes);

    if (isNaN(numericSteps) || numericSteps <= 0) {
      alert("Steps value is invalid.");
      return;
    }
    if (isNaN(numericMinutes) || numericMinutes <= 0) {
      alert("Duration (minutes) is invalid.");
      return;
    }
    if (!exercise) {
      alert("Please enter the exercise type.");
      return;
    }
    if (!intensity) {
      alert("Please enter the exercise intensity.");
      return;
    }

    const newEntry = {
      day: date,
      value: numericMinutes,
      steps: numericSteps,
      exercise,
      intensity,
    };

    setHealthState((prev) => {
      const prevHistory = prev.history || {
        sleepHours: [],
        screenHours: [],
        activityMinutes: [],
      };

      return {
        ...prev,
        activity: {
          minutesPerDay: numericMinutes,
          activityType: exercise,
        },
        history: {
          ...prevHistory,
          activityMinutes: [
            ...(prevHistory.activityMinutes || []),
            newEntry,
          ],
        },
      };
    });

    // keep auto-detected values, clear text fields
    setExercise("");
    setIntensity("");
  };

  return (
    <div className="activity-cyber-container">
      <h3 className="activity-title">NeoGreen Activity Tracker</h3>

      {/* TOP SUMMARY */}
      <div className="activity-summary-row">
        <div className="activity-summary-card">
          <div className="activity-summary-label">Today&apos;s steps</div>
          <div className="activity-summary-value">
            {todayLog?.steps
              ? todayLog.steps.toLocaleString()
              : steps
              ? Number(steps).toLocaleString()
              : "-"}
          </div>
          <div className="activity-summary-sub">
            Autodetected from your daily movement (Google Fit or simulated).
          </div>
        </div>

        <div className="activity-summary-card">
          <div className="activity-summary-label">Active minutes (avg)</div>
          <div className="activity-summary-value">
            {logs.length ? `${averageMinutes.toFixed(1)} min` : "-"}
          </div>
          <div className="activity-summary-sub">
            Based on your last {logs.length || "0"} logged sessions.
          </div>
        </div>
      </div>

      {/* MAIN: left info, right graph */}
      <div className="activity-main-row">
        {/* LEFT SIDE */}
        <div className="activity-input-col">
          <div className="activity-input-group">
            <label>Date (dd/mm/yy)</label>
            <input type="text" value={date} readOnly />
          </div>

          <div className="activity-input-group">
            <label>Steps today (autodetected)</label>
            <input type="text" value={steps} readOnly />
          </div>

          <div className="activity-input-group">
            <label>Active duration (mins, autodetected)</label>
            <input type="text" value={minutes} readOnly />
          </div>

          <div className="activity-input-group">
            <label>Exercise type</label>
            <input
              type="text"
              placeholder="e.g. Walking, Running, Gym"
              value={exercise}
              onChange={(e) => setExercise(e.target.value)}
            />
          </div>

          <div className="activity-input-group">
            <label>Intensity</label>
            <input
              type="text"
              placeholder="e.g. Low, Moderate, High"
              value={intensity}
              onChange={(e) => setIntensity(e.target.value)}
            />
          </div>

          <button className="activity-btn" onClick={handleSave}>
            Save Activity Log
          </button>
        </div>

        {/* RIGHT SIDE: LINE GRAPH */}
        <div className="activity-chart-card">
          <div className="activity-chart-title">
            Active minutes (last {chartData.length || 0} logs)
          </div>

          {!chartData.length ? (
            <div className="activity-chart-empty">
              No activity logs yet. Save an activity to see your trend.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="rgba(74, 222, 128, 0.25)" // soft neon green grid
                />
                <XAxis dataKey="day" stroke="#bbf7d0" />
                <YAxis allowDecimals={false} stroke="#bbf7d0" />
                <Tooltip
                  contentStyle={{
                    background: "#020617",
                    border: "1px solid #22c55e",
                    color: "#dcfce7",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="minutes"
                  name="Minutes"
                  stroke="#22c55e" // neon green
                  strokeWidth={4.5} // BOLD LINE 💥
                  dot={{ r: 5, stroke: "#bbf7d0", strokeWidth: 2.2 }}
                  activeDot={{ r: 8, strokeWidth: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityTracker;
