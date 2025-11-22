// src/components/TimetableImagePlanner.js
import React, { useState } from "react";
import "./TimetableImagePlanner.css";

const dayOptions = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
];

const TimetableImagePlanner = () => {
  const [imageSrc, setImageSrc] = useState(null);        // timetable preview
  const [classes, setClasses] = useState([]);            // all mapped periods
  const [formOpen, setFormOpen] = useState(false);       // show/hide popup form
  const [clickPos, setClickPos] = useState(null);        // x,y on image
  const [formData, setFormData] = useState({
    subject: "",
    day: 1,
    start: "",
    end: "",
  });

  // handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageSrc(ev.target.result);
      setClasses([]); // reset when new timetable uploaded
    };
    reader.readAsDataURL(file);
  };

  // when user clicks somewhere on the timetable image
  const handleImageClick = (e) => {
    if (!imageSrc) return;

    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;  // percentage
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setClickPos({ x, y });

    // open form for subject details
    setFormData({
      subject: "",
      day: 1,
      start: "",
      end: "",
    });
    setFormOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveClass = (e) => {
    e.preventDefault();
    if (!clickPos) return;

    const newClass = {
      id: `cls_${Date.now()}`,
      subject: formData.subject,
      day: Number(formData.day),
      start: formData.start,
      end: formData.end,
      x: clickPos.x, // position on image (for marker)
      y: clickPos.y,
    };

    setClasses((prev) => [...prev, newClass]);
    setFormOpen(false);
  };

  const groupedByDay = dayOptions.map((d) => ({
    ...d,
    classes: classes
      .filter((c) => c.day === d.value)
      .sort((a, b) => a.start.localeCompare(b.start)),
  }));

  return (
    <div className="tt-wrapper">
      <div className="tt-top-row">
        <div>
          <h3>Upload your timetable</h3>
          <p className="tt-sub">
            Upload a PNG / JPG of your college timetable. Then click on each
            period in the image to add subject + time.
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="tt-file-input"
          />
        </div>
      </div>

      {imageSrc && (
        <div className="tt-image-area">
          <h4>Timetable Image (click on a period to map it)</h4>
          <div className="tt-image-wrapper">
            <img
              src={imageSrc}
              alt="Uploaded timetable"
              className="tt-image"
              onClick={handleImageClick}
            />

            {/* markers for each saved class */}
            {classes.map((c) => (
              <div
                key={c.id}
                className="tt-marker"
                style={{ left: `${c.x}%`, top: `${c.y}%` }}
                title={`${c.subject} (${c.start}-${c.end})`}
              />
            ))}
          </div>
          <p className="tt-hint">
            Tip: Zoom the browser if needed. Every click opens a small form to
            add that period.
          </p>
        </div>
      )}

      {/* Summary of mapped routine */}
      {classes.length > 0 && (
        <div className="tt-summary">
          <h4>Your weekly routine (from image)</h4>
          {groupedByDay.map(
            (day) =>
              day.classes.length > 0 && (
                <div key={day.value} className="tt-day-block">
                  <h5>{day.label}</h5>
                  {day.classes.map((c) => (
                    <div key={c.id} className="tt-class-row">
                      <span className="tt-class-subject">{c.subject}</span>
                      <span className="tt-class-time">
                        {c.start} – {c.end}
                      </span>
                    </div>
                  ))}
                </div>
              )
          )}
        </div>
      )}

      {/* Popup form after clicking on timetable image */}
      {formOpen && (
        <div className="tt-modal-backdrop">
          <div className="tt-modal">
            <h4>Add class details</h4>
            <form onSubmit={handleSaveClass} className="tt-form">
              <label>
                Subject
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleFormChange}
                  required
                />
              </label>

              <label>
                Day
                <select
                  name="day"
                  value={formData.day}
                  onChange={handleFormChange}
                >
                  {dayOptions.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="tt-row">
                <label>
                  Start time
                  <input
                    type="time"
                    name="start"
                    value={formData.start}
                    onChange={handleFormChange}
                    required
                  />
                </label>

                <label>
                  End time
                  <input
                    type="time"
                    name="end"
                    value={formData.end}
                    onChange={handleFormChange}
                    required
                  />
                </label>
              </div>

              <div className="tt-buttons">
                <button type="button" onClick={() => setFormOpen(false)}>
                  Cancel
                </button>
                <button type="submit">Save period</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableImagePlanner;
