// src/pages/health/HydrationMeals.js
import React, { useContext, useMemo, useState } from "react";
import { HealthContext } from "./HealthContext";
import "./HydrationMeals.css";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// yyyy-mm-dd for <input type="date">
const getTodayISO = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const HydrationMeals = () => {
  const { healthState, setHealthState } = useContext(HealthContext);

  const [date, setDate] = useState(getTodayISO());
  const [glasses, setGlasses] = useState("");
  const [meals, setMeals] = useState("");
  const [fruitVeg, setFruitVeg] = useState("");
  const [hadJunk, setHadJunk] = useState(false);

  const logs = healthState.history?.hydrationLogs || [];

  const daysLogged = logs.length;

  const avgGlasses = useMemo(() => {
    if (!logs.length) return 0;
    const sum = logs.reduce((acc, l) => acc + (l.glasses || 0), 0);
    return sum / logs.length;
  }, [logs]);

  const chartData = useMemo(
    () =>
      logs.slice(-7).map((log) => ({
        day: log.dateLabel || log.date || "?",
        glasses: log.glasses,
      })),
    [logs]
  );

  const handleAddLog = () => {
    const g = Number(glasses);
    const m = Number(meals || 0);
    const fv = Number(fruitVeg || 0);

    if (isNaN(g) || g <= 0) {
      alert("Please enter a valid number of glasses of water.");
      return;
    }

    const newLog = {
      date,
      dateLabel: new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
      }), // e.g. 21/11
      glasses: g,
      meals: m,
      fruitVeg: fv,
      hadJunk,
    };

    setHealthState((prev) => {
      const prevHistory = prev.history || {
        sleepHours: [],
        screenHours: [],
        activityMinutes: [],
      };
      const hydrationLogs = prevHistory.hydrationLogs || [];

      return {
        ...prev,
        hydrationMeals: {
          waterGlasses: g,
          mealsCount: m,
          fruitVeg: fv,
          hadJunk,
        },
        history: {
          ...prevHistory,
          hydrationLogs: [...hydrationLogs, newLog],
        },
      };
    });

    // reset some fields, keep date
    setGlasses("");
    setMeals("");
    setFruitVeg("");
    setHadJunk(false);
  };

  return (
    <div className="hydration-cyber-container">
      <h3 className="hydration-section-title">Hydration &amp; Meals</h3>

      <p className="hydration-section-subtitle">
        Track your water intake and basic eating pattern.
      </p>

      <div className="hydration-main-row">
        {/* LEFT: input form */}
        <div className="hydration-form-col">
          <label className="hydration-label">
            Date
            <input
              type="date"
              className="hydration-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          <label className="hydration-label">
            Glasses of water
            <input
              type="number"
              min="0"
              className="hydration-input"
              value={glasses}
              onChange={(e) => setGlasses(e.target.value)}
              placeholder="e.g. 6"
            />
          </label>

          <label className="hydration-label">
            Number of meals
            <input
              type="number"
              min="0"
              className="hydration-input"
              value={meals}
              onChange={(e) => setMeals(e.target.value)}
              placeholder="e.g. 3"
            />
          </label>

          <label className="hydration-label">
            Fruit &amp; veg servings
            <input
              type="number"
              min="0"
              className="hydration-input"
              value={fruitVeg}
              onChange={(e) => setFruitVeg(e.target.value)}
              placeholder="e.g. 2"
            />
          </label>

          <label className="hydration-checkbox-row">
            <input
              type="checkbox"
              checked={hadJunk}
              onChange={(e) => setHadJunk(e.target.checked)}
            />
            <span>Had junk food today</span>
          </label>

          <button className="hydration-btn" onClick={handleAddLog}>
            Add Day Log
          </button>
        </div>

        {/* RIGHT: stats + chart */}
        <div className="hydration-right-col">
          <div className="hydration-stats-row">
            <div className="hydration-stat-card">
              <div className="hydration-stat-label">Days Logged</div>
              <div className="hydration-stat-value">{daysLogged}</div>
            </div>

            <div className="hydration-stat-card">
              <div className="hydration-stat-label">Avg Glasses of Water</div>
              <div className="hydration-stat-value">
                {daysLogged ? avgGlasses.toFixed(1) : "--"}
              </div>
            </div>
          </div>

          <div className="hydration-chart-card">
            <div className="hydration-chart-title">
              Water consumption (last {chartData.length || 0} days)
            </div>
            {!chartData.length ? (
              <div className="hydration-chart-empty">
                Add a day log to see your water intake chart.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="4 4"
                    stroke="rgba(251, 146, 60, 0.35)"
                    vertical={false}
                  />
                  <XAxis dataKey="day" stroke="#fed7aa" />
                  <YAxis allowDecimals={false} stroke="#fed7aa" />
                  <Tooltip
                    contentStyle={{
                      background: "#020617",
                      border: "1px solid #f97316",
                      color: "#ffedd5",
                    }}
                  />
                  <Bar
                    dataKey="glasses"
                    name="Glasses"
                    fill="#f97316" // orange cyberpunk
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HydrationMeals;