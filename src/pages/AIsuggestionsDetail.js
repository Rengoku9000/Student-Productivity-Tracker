// src/pages/AISuggestionsDetail.js
import React, { useEffect, useState } from "react";
import "./DashboardDetail.css";
import { getFromStorage } from "../utils/storage";
import { recommendTimeSlot } from "../utils/aiEngine";

const AISuggestionsDetail = () => {
  const [recs, setRecs] = useState([]);

  useEffect(() => {
    const rawTasks = getFromStorage("tasks");
    const tasks = Array.isArray(rawTasks) ? rawTasks : [];

    try {
      const r = recommendTimeSlot(tasks);
      const arr = Array.isArray(r) ? r : r ? [r] : [];
      setRecs(arr);
    } catch {
      setRecs([]);
    }
  }, []);

  return (
    <div className="detail-page">
      <div className="detail-header">
        <div>
          <h2 className="detail-title">AI Time Slot Suggestions</h2>
          <p className="detail-subtitle">
            See all suggested focus windows and the reasoning behind them.
          </p>
        </div>
        <div className="detail-pill">AI Helper • Slots view</div>
      </div>

      <div className="detail-card">
        <h3 className="detail-card-title">Suggested Time Windows</h3>
        {recs.length === 0 ? (
          <p className="detail-note">
            Add more tasks and plans so AI has enough data to suggest time
            windows.
          </p>
        ) : (
          <ul className="detail-list">
            {recs.map((rec, i) => {
              let time = "";
              let reason = "";

              if (typeof rec === "string") {
                reason = rec;
              } else if (rec && typeof rec === "object") {
                time =
                  typeof rec.time === "string"
                    ? rec.time
                    : rec.slot || "";
                reason =
                  typeof rec.reason === "string"
                    ? rec.reason
                    : JSON.stringify(rec);
              } else {
                reason = String(rec);
              }

              return (
                <li key={i} className="detail-list-item">
                  <div className="detail-item-main">
                    <span className="detail-item-label">
                      {time || `Suggestion #${i + 1}`}
                    </span>
                    <span className="detail-item-sub">{reason}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="detail-card">
        <h3 className="detail-card-title">How to Use These Slots</h3>
        <p className="detail-note">
          • Pick 1–2 of the strongest suggested windows as your daily{" "}
          <strong>deep-focus</strong> blocks. <br />
          • Put your toughest subjects (DSA, COA, Maths, etc.) there. <br />
          • Keep low-energy tasks (notes cleanup, revision) outside those
          windows.
        </p>
      </div>
    </div>
  );
};

export default AISuggestionsDetail;
