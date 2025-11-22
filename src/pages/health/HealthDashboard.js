// src/pages/health/HealthDashboard.js
import React, { useContext, useMemo } from "react";
import { HealthContext } from "./HealthContext";
import "./HealthDashboard.css";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const HealthDashboard = () => {
  const { healthState } = useContext(HealthContext);
  const history = healthState.history || {};

  const sleepLogs = history.sleepHours || [];
  const screenLogs = history.screenHours || [];
  const activityLogs = history.activityMinutes || [];
  const hydrationLogs = history.hydrationLogs || [];

  // ---------- TOP SUMMARY NUMBERS ----------

  const avgSleep = useMemo(() => {
    if (!sleepLogs.length) return 0;
    const sum = sleepLogs.reduce((acc, l) => acc + (l.value || 0), 0);
    return sum / sleepLogs.length;
  }, [sleepLogs]);

  const avgScreen = useMemo(() => {
    if (!screenLogs.length) return 0;
    const sum = screenLogs.reduce((acc, l) => acc + (l.value || 0), 0);
    return sum / screenLogs.length;
  }, [screenLogs]);

  const totalActivity = useMemo(() => {
    if (!activityLogs.length) return 0;
    return activityLogs.reduce((acc, l) => acc + (l.value || 0), 0);
  }, [activityLogs]);

  const avgWater = useMemo(() => {
    if (!hydrationLogs.length) return 0;
    const sum = hydrationLogs.reduce((acc, l) => acc + (l.glasses || 0), 0);
    return sum / hydrationLogs.length;
  }, [hydrationLogs]);

  // ---------- COMBINED BAR CHART DATA (last 7 days) ----------

  const chartData = useMemo(() => {
    const dayMap = new Map();

    const ensureDay = (label) => {
      const key = label || "Unknown";
      if (!dayMap.has(key)) {
        dayMap.set(key, {
          day: key,
          sleepHours: null,
          screenHours: null,
          waterGlasses: null,
        });
      }
      return dayMap.get(key);
    };

    sleepLogs.forEach((log) => {
      const label = log.day || log.dateLabel || log.date;
      const row = ensureDay(label);
      row.sleepHours = log.value ?? row.sleepHours;
    });

    screenLogs.forEach((log) => {
      const label = log.day || log.dateLabel || log.date;
      const row = ensureDay(label);
      row.screenHours = log.value ?? row.screenHours;
    });

    hydrationLogs.forEach((log) => {
      const label = log.dateLabel || log.day || log.date;
      const row = ensureDay(label);
      row.waterGlasses = log.glasses ?? row.waterGlasses;
    });

    // Keep insertion order, show only last 7 rows
    return Array.from(dayMap.values()).slice(-7);
  }, [sleepLogs, screenLogs, hydrationLogs]);

  return (
    <div className="health-dashboard-shell">
      <header className="health-dashboard-header">
        <h2>Health Overview</h2>
        <p>
          Quick look at how your sleep, screen time, activity and hydration
          are balancing out.
        </p>
      </header>

      {/* TOP SUMMARY CARDS */}
      <div className="health-summary-row">
        <div className="health-summary-card">
          <div className="health-summary-label">Avg Sleep</div>
          <div className="health-summary-value">
            {avgSleep.toFixed(1)} <span>hrs</span>
          </div>
          <div className="health-summary-bar">
            <div
              className="health-summary-bar-fill sleep-fill"
              style={{
                width: `${Math.min((avgSleep / 8) * 100, 120)}%`,
              }}
            />
          </div>
          <small>Target: ~8 hrs per night</small>
        </div>

        <div className="health-summary-card">
          <div className="health-summary-label">Avg Screen Time</div>
          <div className="health-summary-value">
            {avgScreen.toFixed(1)} <span>hrs</span>
          </div>
          <div className="health-summary-bar">
            <div
              className="health-summary-bar-fill screen-fill"
              style={{
                width: `${Math.min((avgScreen / 8) * 100, 120)}%`,
              }}
            />
          </div>
          <small>Try to keep non-study screen low</small>
        </div>

        <div className="health-summary-card">
          <div className="health-summary-label">Total Activity</div>
          <div className="health-summary-value">
            {totalActivity} <span>mins</span>
          </div>
          <div className="health-summary-bar">
            <div
              className="health-summary-bar-fill activity-fill"
              style={{
                width: `${Math.min((totalActivity / 150) * 100, 120)}%`,
              }}
            />
          </div>
          <small>Goal: 150+ mins / week</small>
        </div>

        <div className="health-summary-card">
          <div className="health-summary-label">Avg Water</div>
          <div className="health-summary-value">
            {avgWater.toFixed(1)} <span>glasses</span>
          </div>
          <div className="health-summary-bar">
            <div
              className="health-summary-bar-fill water-fill"
              style={{
                width: `${Math.min((avgWater / 8) * 100, 120)}%`,
              }}
            />
          </div>
          <small>Goal: ~8 glasses / day</small>
        </div>
      </div>

      {/* BIG TEAL / PURPLE BAR GRAPH */}
      <div className="health-chart-panel">
        <div className="health-chart-title">
          Recent trend (sleep · screen · water)
        </div>

        {!chartData.length ? (
          <div className="health-chart-empty">
            Start logging sleep, screen time, and water intake to see your
            weekly trend.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="rgba(45, 212, 191, 0.28)"
                vertical={false}
              />
              <XAxis dataKey="day" stroke="#e0f2fe" />
              <YAxis stroke="#bae6fd" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "#020617",
                  border: "1px solid #22d3ee",
                  color: "#e0f2fe",
                }}
              />
              <Legend />

              {/* 💧 sleep: aqua/teal */}
              <Bar
                dataKey="sleepHours"
                name="Sleep (hrs)"
                fill="#22d3ee"
                radius={[6, 6, 0, 0]}
              />

              {/* 📱 screen: soft purple for contrast */}
              <Bar
                dataKey="screenHours"
                name="Screen (hrs)"
                fill="#a855f7"
                radius={[6, 6, 0, 0]}
              />

              {/* 🥤 water: minty teal */}
              <Bar
                dataKey="waterGlasses"
                name="Water (glasses)"
                fill="#2dd4bf"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default HealthDashboard;