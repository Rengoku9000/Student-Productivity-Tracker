// src/pages/health/WeeklySummary.js
import React, { useContext, useMemo } from "react";
import { HealthContext } from "./HealthContext";
import "./WeeklySummary.css";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const WeeklySummary = () => {
  const { healthState } = useContext(HealthContext);
  const history = healthState.history || {};

  const sleepLogs = history.sleepHours || [];
  const screenLogs = history.screenHours || [];
  const activityLogs = history.activityMinutes || [];
  const hydrationLogs = history.hydrationLogs || [];
  const moodLogs = history.moodLogs || [];

  // ---------- METRICS FOR 6 CRITERIA ----------

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

  const mostCommonMood = useMemo(() => {
    if (!moodLogs.length) return "N/A";
    const counts = {};
    moodLogs.forEach((log) => {
      const m = (log.mood || "").trim();
      if (!m) return;
      counts[m] = (counts[m] || 0) + 1;
    });
    const entries = Object.entries(counts);
    if (!entries.length) return "N/A";
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  }, [moodLogs]);

  // how many distinct days have *any* logs?
  const daysWithLogs = useMemo(() => {
    const set = new Set();
    sleepLogs.forEach((l) => set.add(l.day || l.date || l.dateLabel));
    screenLogs.forEach((l) => set.add(l.day || l.date || l.dateLabel));
    activityLogs.forEach((l) => set.add(l.day || l.date || l.dateLabel));
    hydrationLogs.forEach((l) => set.add(l.day || l.date || l.dateLabel));
    moodLogs.forEach((l) => set.add(l.day || l.date || l.dateLabel));
    set.delete(undefined);
    set.delete(null);
    return set.size;
  }, [sleepLogs, screenLogs, activityLogs, hydrationLogs, moodLogs]);

  // ---------- COMBINED CHART DATA (last 7 days) ----------
  // We combine by "day label" – best effort using day/date/dateLabel.

  const chartData = useMemo(() => {
    const dayMap = new Map();

    const ensureDay = (label) => {
      const day = label || "Unknown";
      if (!dayMap.has(day)) {
        dayMap.set(day, {
          day,
          sleepHours: null,
          screenHours: null,
          waterGlasses: null,
        });
      }
      return dayMap.get(day);
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

    // keep insertion order → take last 7 entries
    return Array.from(dayMap.values()).slice(-7);
  }, [sleepLogs, screenLogs, hydrationLogs]);

  // ---------- QUICK INSIGHTS TEXT ----------

  const insights = useMemo(() => {
    const lines = [];

    if (avgSleep > 0) {
      if (avgSleep < 7) {
        lines.push("Sleep: Try to aim for at least 7 hours.");
      } else {
        lines.push("Sleep: Nice! You're close to or above 7 hours.");
      }
    } else {
      lines.push("Sleep: No data yet. Log your sleep to see insights.");
    }

    if (avgScreen > 0) {
      if (avgScreen > 6) {
        lines.push("Screen Time: Try reducing non-study screen time.");
      } else {
        lines.push("Screen Time: Good control over screen usage.");
      }
    } else {
      lines.push("Screen Time: No logs yet.");
    }

    if (totalActivity > 0) {
      if (totalActivity < 90) {
        lines.push("Activity: Add short walks or stretching breaks.");
      } else {
        lines.push("Activity: Great job staying active.");
      }
    } else {
      lines.push("Activity: Start with even 10-minute walks.");
    }

    if (avgWater > 0) {
      if (avgWater < 6) {
        lines.push("Hydration: Try to drink more water during the day.");
      } else {
        lines.push("Hydration: Hydration levels look good.");
      }
    } else {
      lines.push("Hydration: Log your water intake to get feedback.");
    }

    if (mostCommonMood !== "N/A") {
      lines.push(`Mood: You often feel "${mostCommonMood}". Reflect on why.`);
    } else {
      lines.push("Mood: Start logging how you feel each day.");
    }

    return lines;
  }, [avgSleep, avgScreen, totalActivity, avgWater, mostCommonMood]);

  return (
    <div className="weekly-cyber-container">
      <h3 className="weekly-section-title">Weekly Summary</h3>
      <p className="weekly-section-subtitle">
        Overview of your recent health-study balance.
      </p>

      {/* TOP STATS ROW */}
      <div className="weekly-stats-grid">
        <div className="weekly-stat-card">
          <div className="weekly-stat-label">Days with Logs</div>
          <div className="weekly-stat-value">{daysWithLogs}</div>
        </div>

        <div className="weekly-stat-card">
          <div className="weekly-stat-label">Avg Sleep</div>
          <div className="weekly-stat-value">
            {avgSleep.toFixed(1)} <span className="weekly-unit">hrs</span>
          </div>
        </div>

        <div className="weekly-stat-card">
          <div className="weekly-stat-label">Avg Screen Time</div>
          <div className="weekly-stat-value">
            {avgScreen.toFixed(1)} <span className="weekly-unit">hrs</span>
          </div>
        </div>

        <div className="weekly-stat-card">
          <div className="weekly-stat-label">Total Activity</div>
          <div className="weekly-stat-value">
            {totalActivity} <span className="weekly-unit">mins</span>
          </div>
        </div>

        <div className="weekly-stat-card">
          <div className="weekly-stat-label">Avg Glasses of Water</div>
          <div className="weekly-stat-value">
            {avgWater.toFixed(1)}
          </div>
        </div>

        <div className="weekly-stat-card">
          <div className="weekly-stat-label">Most Common Mood</div>
          <div className="weekly-stat-value">
            {mostCommonMood || "N/A"}
          </div>
        </div>
      </div>

      {/* BIG NEON GRAPH */}
      <div className="weekly-chart-card">
        <div className="weekly-chart-title">
          Weekly health trend (sleep · screen · water)
        </div>

        {!chartData.length ? (
          <div className="weekly-chart-empty">
            Add some logs to see the combined weekly trend.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="rgba(59, 130, 246, 0.35)"
              />
              <XAxis dataKey="day" stroke="#bfdbfe" />
              <YAxis
                yAxisId="left"
                stroke="#bfdbfe"
                allowDecimals={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#a5f3fc"
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#020617",
                  border: "1px solid #38bdf8",
                  color: "#e0f2fe",
                }}
              />
              <Legend />

              {/* Sleep (left axis) */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="sleepHours"
                name="Sleep (hrs)"
                stroke="#38bdf8"
                strokeWidth={3.2}
                dot={{ r: 4, stroke: "#e0f2fe", strokeWidth: 1.5 }}
                activeDot={{ r: 7 }}
              />

              {/* Screen (left axis) */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="screenHours"
                name="Screen (hrs)"
                stroke="#6366f1"
                strokeWidth={2.6}
                dot={{ r: 4 }}
                activeDot={{ r: 7 }}
              />

              {/* Water (right axis) */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="waterGlasses"
                name="Water (glasses)"
                stroke="#22d3ee"
                strokeWidth={2.8}
                dot={{ r: 4 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* QUICK INSIGHTS */}
      <div className="weekly-insights-card">
        <div className="weekly-insights-title">Quick Insights</div>
        <ul className="weekly-insights-list">
          {insights.map((line, idx) => (
            <li key={idx}>{line}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WeeklySummary;