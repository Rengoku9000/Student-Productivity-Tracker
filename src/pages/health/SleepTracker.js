// src/pages/health/SleepTracker.js
import React, { useContext, useState, useMemo } from "react";
import { HealthContext } from "./HealthContext";
import "./SleepTracker.css";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#38bdf8", "#a855f7", "#f97316"]; // electric blue, violet, orange

// format today as yyyy-mm-dd
const getTodayISO = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const SleepTracker = () => {
  const { healthState, setHealthState } = useContext(HealthContext);

  const [date] = useState(getTodayISO());
  const [hours, setHours] = useState("");
  const [quality, setQuality] = useState("");
  const [deep, setDeep] = useState("");
  const [light, setLight] = useState("");
  const [awake, setAwake] = useState("");

  const totalSegments = useMemo(
    () =>
      (Number(deep) || 0) +
      (Number(light) || 0) +
      (Number(awake) || 0),
    [deep, light, awake]
  );

  const pieData = useMemo(() => {
    if (!totalSegments) return [];
    return [
      { name: "Deep sleep", value: Number(deep) || 0 },
      { name: "Light sleep", value: Number(light) || 0 },
      { name: "Awake", value: Number(awake) || 0 },
    ];
  }, [deep, light, awake, totalSegments]);

  const handleSave = () => {
    const numericHours = Number(hours);

    if (isNaN(numericHours) || numericHours <= 0) {
      alert("Please enter a valid total hours slept.");
      return;
    }
    if (!quality) {
      alert("Please enter or select a sleep quality.");
      return;
    }

    if (totalSegments && Math.abs(totalSegments - numericHours) > 1) {
      const confirmOk = window.confirm(
        `Note: Deep + Light + Awake = ${totalSegments} hrs, but total is ${numericHours} hrs. Continue?`
      );
      if (!confirmOk) return;
    }

    setHealthState((prev) => {
      const prevHistory = prev.history || {
        sleepHours: [],
        screenHours: [],
        activityMinutes: [],
      };

      const newEntry = {
        day: date,
        value: numericHours,
        deep: Number(deep) || 0,
        light: Number(light) || 0,
        awake: Number(awake) || 0,
        quality,
      };

      return {
        ...prev,
        sleep: {
          hoursPerNight: numericHours,
          sleepQuality: quality,
        },
        history: {
          ...prevHistory,
          sleepHours: [...(prevHistory.sleepHours || []), newEntry],
        },
      };
    });

    setHours("");
    setQuality("");
    setDeep("");
    setLight("");
    setAwake("");
  };

  return (
    <div className="sleep-cyber-container">
      <h3 className="sleep-title">Cosmic Sleep Tracker</h3>

      {/* 🔹 Two-column layout: left inputs, right pie chart */}
      <div className="sleep-main-row">
        {/* LEFT: inputs */}
        <div className="sleep-input-col">
          <div className="sleep-input-row">
            <input
              className="sleep-input"
              type="text"
              value={date}
              readOnly
            />

            <input
              className="sleep-input"
              type="number"
              placeholder="Total hours slept (e.g. 7.5)"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              min="0"
              step="0.25"
            />

            <input
              className="sleep-input"
              type="text"
              placeholder="Sleep quality (Excellent / Good / Okay / Poor)"
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
            />

            <input
              className="sleep-input"
              type="number"
              placeholder="Deep sleep (hrs)"
              value={deep}
              onChange={(e) => setDeep(e.target.value)}
              min="0"
              step="0.25"
            />

            <input
              className="sleep-input"
              type="number"
              placeholder="Light sleep (hrs)"
              value={light}
              onChange={(e) => setLight(e.target.value)}
              min="0"
              step="0.25"
            />

            <input
              className="sleep-input"
              type="number"
              placeholder="Awake time (hrs)"
              value={awake}
              onChange={(e) => setAwake(e.target.value)}
              min="0"
              step="0.25"
            />

            <button className="sleep-btn" onClick={handleSave}>
              Save Sleep Log
            </button>
          </div>
        </div>

        {/* RIGHT: pie chart inside same card */}
        <div className="sleep-chart-box">
          <div className="pie-title">Sleep composition</div>

          {!pieData.length ? (
            <div style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: "0.4rem" }}>
              Enter deep / light / awake values to see the breakdown.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#020617",
                    border: "1px solid #4b5563",
                    color: "#e5e7eb",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default SleepTracker;