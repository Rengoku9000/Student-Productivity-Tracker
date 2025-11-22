// src/pages/TodayMissionsDetail.js
import React, { useEffect, useState } from "react";
import "./DashboardDetail.css";

const STORAGE_KEY = "todayMissionProgress";

const TodayMissionsDetail = () => {
  const [todayPlan, setTodayPlan] = useState([]);
  const [progressMap, setProgressMap] = useState({});

  useEffect(() => {
    try {
      const storedPlan = JSON.parse(
        localStorage.getItem("studyPlan") || "null"
      );
      if (storedPlan && Array.isArray(storedPlan.days)) {
        setTodayPlan(storedPlan.days[0]?.slots || []);
      }
    } catch {}

    try {
      const savedProgress = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "{}"
      );
      if (savedProgress && typeof savedProgress === "object") {
        setProgressMap(savedProgress);
      }
    } catch {}
  }, []);

  const toggleMission = (subject) => {
    setProgressMap((prev) => {
      const next = { ...prev, [subject]: !prev[subject] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const total = todayPlan.length || 1;
  const completedCount = todayPlan.filter(
    (s) => s && progressMap[s.subject]
  ).length;
  const completionPercent = Math.round((completedCount / total) * 100);

  return (
    <div className="detail-page">
      <div className="detail-header">
        <div>
          <h2 className="detail-title">Today&apos;s Missions</h2>
          <p className="detail-subtitle">
            Tick off each mission as you complete it. Progress stays even if
            you reload.
          </p>
        </div>
        <div className="detail-pill">
          {completedCount}/{todayPlan.length || 0} done •{" "}
          {completionPercent}% complete
        </div>
      </div>

      {!todayPlan.length ? (
        <div className="detail-card">
          <h3 className="detail-card-title">No Missions Today</h3>
          <p className="detail-note">
            Once you generate a plan in <strong>Start Goals</strong>, the
            first day becomes your mission list here.
          </p>
        </div>
      ) : (
        <>
          <div className="detail-card">
            <h3 className="detail-card-title">Progress</h3>
            <div className="detail-progress">
              <div
                className="detail-progress-fill"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <p className="detail-note" style={{ marginTop: 6 }}>
              Pro tip: aim for at least 80% completion to keep your streak
              solid.
            </p>
          </div>

          <div className="detail-card">
            <h3 className="detail-card-title">Mission Checklist</h3>
            <ul className="detail-list">
              {todayPlan.map((slot, i) => {
                if (!slot) return null;
                const checked = !!progressMap[slot.subject];
                return (
                  <li key={i} className="detail-list-item">
                    <div className="detail-item-main">
                      <span className="detail-item-label">
                        {slot.subject}
                      </span>
                      <span className="detail-item-sub">
                        Planned: {slot.hours} hrs
                      </span>
                    </div>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: "0.8rem",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleMission(slot.subject)}
                      />
                      Done
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default TodayMissionsDetail;
