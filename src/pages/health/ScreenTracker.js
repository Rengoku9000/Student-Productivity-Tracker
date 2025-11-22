// src/pages/health/ScreenTracker.js
import React, { useContext, useEffect, useMemo } from "react";
import { HealthContext } from "./HealthContext";
import "./ScreenTracker.css";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// 🧪 MOCK FUNCTION – simulates "device screen data"
// In reality, you'd replace this with an API call to your backend or native app.
const mockFetchDeviceScreenData = async () => {
  // pretend this came from phone/OS
  // last 7 days, with a simple purpose tag
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const purposes = ["Study", "Social", "Gaming"];

  // Just some fake sample hours
  const hours = [3.5, 5, 4, 6.2, 2.8, 4.5, 5.7];

  return days.map((day, i) => ({
    day,
    hours: hours[i],
    purpose: purposes[i % purposes.length],
  }));
};

const ScreenTracker = () => {
  const { healthState, setHealthState } = useContext(HealthContext);

  // 🔁 On mount: "auto-load" screen data (currently using mock)
  useEffect(() => {
    const load = async () => {
      const deviceData = await mockFetchDeviceScreenData();

      setHealthState((prev) => {
        const lastDay = deviceData[deviceData.length - 1];

        return {
          ...prev,
          screen: {
            hoursPerDay: lastDay?.hours ?? prev.screen.hoursPerDay,
            purpose: lastDay?.purpose ?? prev.screen.purpose,
          },
          history: {
            ...prev.history,
            screenHours: deviceData.map((d) => ({
              day: d.day,
              value: d.hours,
              purpose: d.purpose,
            })),
          },
        };
      });
    };

    load();
  }, [setHealthState]);

  const logs = healthState.history?.screenHours || [];

  const todayLog = logs[logs.length - 1] || null;

  const averageHours = useMemo(() => {
    if (!logs.length) return 0;
    const sum = logs.reduce((acc, l) => acc + (l.value || 0), 0);
    return sum / logs.length;
  }, [logs]);

  const chartData = useMemo(
    () => logs.map((log) => ({ day: log.day, hours: log.value })),
    [logs]
  );

  return (
    <div className="screen-cyber-container">
      <h3 className="screen-title">Cosmic Screen Usage</h3>

      {/* ---- MAIN SUMMARY ---- */}
      <div className="screen-summary-row">
        <div className="screen-summary-card">
          <div className="screen-summary-label">Today&apos;s screen time</div>
          <div className="screen-summary-value">
            {todayLog ? `${todayLog.value.toFixed(1)} hrs` : "-"}
          </div>
          <div className="screen-summary-sub">
            {todayLog?.purpose
              ? `Main purpose: ${todayLog.purpose}`
              : "Waiting for device data..."}
          </div>
        </div>

        <div className="screen-summary-card">
          <div className="screen-summary-label">Average (last 7 days)</div>
          <div className="screen-summary-value">
            {logs.length ? `${averageHours.toFixed(1)} hrs` : "-"}
          </div>
          <div className="screen-summary-sub">
            Lower is better for focus & health.
          </div>
        </div>
      </div>

      {/* ---- GRAPH ---- */}
      <div className="screen-chart-card">
        <div className="screen-chart-title">Screen time (last 7 days)</div>
        {!chartData.length ? (
          <div className="screen-chart-empty">
            No screen data yet. Once your device data is connected, your weekly
            usage will appear here.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={230}>
             <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="rgba(100, 149, 237, 0.35)"  // soft electric blue grid
                  vertical={false}   // EVEN horizontal grid only
                />
                <XAxis dataKey="day" stroke="#a5b4fc" />
                <YAxis allowDecimals={false} stroke="#a5b4fc" />
                <Tooltip
                  contentStyle={{
                    background: "#0a0f2b",
                    border: "1px solid #3b82f6",
                    color: "#dbeafe",
                  }}
                />
                <Bar
                  dataKey="hours"
                  name="Hours"
                  fill="#3b82f6"              // 🔥 ELECTRIC BLUE
                  radius={[6, 6, 0, 0]}       // rounded tops
                />
              </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <p className="screen-note">
        * Currently using simulated data. To use real screen time, connect this
        tracker to a native app or a backend API that reads your device&apos;s
        Digital Wellbeing / Screen Time stats.
      </p>
    </div>
  );
};

export default ScreenTracker;