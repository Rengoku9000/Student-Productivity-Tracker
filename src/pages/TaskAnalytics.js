// src/pages/TaskAnalytics.js
import React, { useEffect, useState } from "react";
import "./DashboardDetail.css";
import ReactApexChart from "react-apexcharts";
import { getFromStorage } from "../utils/storage";
import { analyzeProductivity } from "../utils/aiEngine";

const TaskAnalytics = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    completed: 0,
    pending: 0,
    productivity: 0,
  });

  useEffect(() => {
    const rawTasks = getFromStorage("tasks");
    const t = Array.isArray(rawTasks) ? rawTasks : [];
    setTasks(t);

    try {
      const res = analyzeProductivity(t);
      if (res && typeof res === "object") {
        setStats({
          completed: Number(res.completed || 0),
          pending: Number(res.pending || 0),
          productivity: Number(res.productivity || 0),
        });
      }
    } catch {
      // ignore, keep defaults
    }
  }, []);

  const completed = stats.completed || 0;
  const pending = stats.pending || 0;
  const total = completed + pending || 1;

  const donutSeries =
    completed === 0 && pending === 0 ? [1, 1] : [completed, pending];

  const donutOptions = {
    chart: { background: "transparent" },
    labels: ["Completed", "Pending"],
    dataLabels: { enabled: false },
    legend: { labels: { colors: "#e5e7eb" } },
    stroke: { width: 1, colors: ["#020617"] },
    colors: ["#22c55e", "#6366f1"],
  };

  return (
    <div className="detail-page">
      <div className="detail-header">
        <div>
          <h2 className="detail-title">Task Analytics</h2>
          <p className="detail-subtitle">
            Deeper look at your completed vs pending work and task list.
          </p>
        </div>
        <div className="detail-pill">
          Productivity • {stats.productivity || 0}% score
        </div>
      </div>

      <div className="detail-stat-grid">
        <div className="detail-stat-box">
          <div className="detail-stat-label">Total Tasks</div>
          <div className="detail-stat-value">{completed + pending}</div>
          <div className="detail-stat-note">
            ✅ {completed} done • ⏳ {pending} pending
          </div>
          <div className="detail-progress">
            <div
              className="detail-progress-fill"
              style={{ width: `${Math.round((completed / total) * 100)}%` }}
            />
          </div>
        </div>

        <div className="detail-stat-box">
          <div className="detail-stat-label">Productivity</div>
          <div className="detail-stat-value">
            {stats.productivity?.toFixed
              ? stats.productivity.toFixed(1)
              : stats.productivity}
            %
          </div>
          <div className="detail-stat-note">
            Based on completed vs total tasks.
          </div>
        </div>
      </div>

      <div className="detail-card">
        <h3 className="detail-card-title">Completion Split</h3>
        <ReactApexChart
          type="donut"
          height={260}
          options={donutOptions}
          series={donutSeries}
        />
        <p className="detail-note">
          Tip: If pending is high, reduce parallel subjects and finish one
          cluster at a time.
        </p>
      </div>

      <div className="detail-card">
        <h3 className="detail-card-title">Task List</h3>
        {tasks.length === 0 ? (
          <p className="detail-note">
            No tasks found. Add some in the <strong>Tasks</strong> tab.
          </p>
        ) : (
          <ul className="detail-list">
            {tasks.map((t, i) => {
              const title =
                typeof t.title === "string"
                  ? t.title
                  : typeof t.name === "string"
                  ? t.name
                  : `Task ${i + 1}`;
              const status =
                typeof t.status === "string" ? t.status : "unknown";
              const subject =
                typeof t.subject === "string" ? t.subject : null;
              const due =
                typeof t.dueDate === "string"
                  ? t.dueDate
                  : typeof t.deadline === "string"
                  ? t.deadline
                  : null;

              return (
                <li key={t.id || i} className="detail-list-item">
                  <div className="detail-item-main">
                    <span className="detail-item-label">{title}</span>
                    <span className="detail-item-sub">
                      {subject && <>{subject} • </>}
                      {due ? `Due: ${due}` : "No deadline"}
                    </span>
                  </div>
                  <span className="detail-chip">
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "999px",
                        backgroundColor:
                          status === "completed"
                            ? "#22c55e"
                            : status === "pending"
                            ? "#f97316"
                            : "#9ca3af",
                      }}
                    />
                    {status}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TaskAnalytics;
