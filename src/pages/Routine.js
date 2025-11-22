import React, { useState } from "react";
import "./Routine.css";
import EnableNotifications from "../components/EnableNotifications";

// 👇 Debug log to confirm env is loaded (check devtools console once)
console.log("Frontend VAPID KEY:", process.env.REACT_APP_VAPID_PUBLIC_KEY);

const DayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function Routine() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [periods, setPeriods] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileSelect = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setErrorMsg("");

    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(uploadedFile);
  };

  const analyzeTimetable = async () => {
    if (!file) {
      setErrorMsg("Please upload a timetable image first.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setPeriods([]);

    const formData = new FormData();
    formData.append("timetable", file);

    try {
      const res = await fetch("http://localhost:5000/api/timetable/parse", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("📥 API Response:", data);

      if (Array.isArray(data.periods) && data.periods.length > 0) {
        setPeriods(data.periods);
        setErrorMsg("");
      } else {
        setErrorMsg("❌ No class periods detected. Try a clearer image.");
      }
    } catch (err) {
      console.error("Frontend Error:", err);
      setErrorMsg("❌ Error analyzing image. Check backend console.");
    }

    setLoading(false);
  };

  const groupedByDay = DayNames.map((day, i) => ({
    day,
    periods: periods
      .filter((p) => p.dayIndex === i)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
  }));

  return (
    <div className="routine-container">
      <h2>Routine</h2>

      {/* 👇 Notification Button – only shows after timetable is parsed */}
      {periods.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <EnableNotifications />
        </div>
      )}

      <input type="file" accept="image/*" onChange={handleFileSelect} />

      {preview && (
        <div className="preview-section">
          <h3>Uploaded Timetable</h3>
          <img src={preview} alt="Preview" className="preview-image" />
        </div>
      )}

      {file && (
        <button
          className="analyze-btn"
          onClick={analyzeTimetable}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Analyze Timetable"}
        </button>
      )}

      {errorMsg && <p className="error-text">{errorMsg}</p>}

      {periods.length > 0 && (
        <div className="output-section">
          <h3>Digital Timetable</h3>

          {groupedByDay.map(
            (dayGroup) =>
              dayGroup.periods.length > 0 && (
                <div key={dayGroup.day} className="day-block">
                  <h4>{dayGroup.day}</h4>
                  {dayGroup.periods.map((p) => (
                    <div key={p.id} className="period-row">
                      <span className="period-time">
                        {p.startTime} - {p.endTime}
                      </span>
                      <strong className="period-subject">{p.subject}</strong>
                    </div>
                  ))}
                </div>
              )
          )}
        </div>
      )}

      {!loading && !errorMsg && file && periods.length === 0 && (
        <p className="note-text">Click “Analyze Timetable” to extract routine.</p>
      )}
    </div>
  );
}
