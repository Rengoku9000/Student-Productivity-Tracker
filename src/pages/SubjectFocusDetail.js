// src/pages/SubjectFocusDetail.js
import React, { useEffect, useState } from "react";
import "./SubjectFocusDetail.css"; // Updated CSS import
import ReactApexChart from "react-apexcharts";

const SubjectFocusDetail = () => {
  const [subjectSummary, setSubjectSummary] = useState([]);

  useEffect(() => {
    try {
      const storedPlan = JSON.parse(localStorage.getItem("studyPlan") || "null");
      if (!storedPlan || !Array.isArray(storedPlan.days)) return;

      const subjMap = {};

      storedPlan.days.forEach((day) => {
        (day.slots || []).forEach((slot) => {
          const subj = String(slot.subject || "");
          const hrs = Number(slot.hours || 0);
          if (!subj) return;
          subjMap[subj] = (subjMap[subj] || 0) + hrs;
        });
      });

      setSubjectSummary(
        Object.entries(subjMap).map(([subject, hours]) => ({
          subject,
          hours: Number(hours.toFixed(1)),
        }))
      );
    } catch {
      // ignore
    }
  }, []);

  const totalHours = subjectSummary.reduce((sum, x) => sum + (x.hours || 0), 0);

  const labels =
    subjectSummary.length > 0
      ? subjectSummary.map((s) => s.subject)
      : ["No Subjects Logged Yet"];

  const series = [
    {
      name: "Hours",
      data:
        subjectSummary.length > 0 ? subjectSummary.map((s) => s.hours) : [0],
    },
  ];

  const options = {
    chart: { background: "transparent", toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true, borderRadius: 6 } },
    xaxis: { labels: { style: { colors: "#ccc" } } },
    yaxis: { labels: { style: { colors: "#ccc" } }, categories: labels },
    dataLabels: { enabled: false },
    colors: ["#4dabf7"],
    grid: { borderColor: "#1f2937" },
  };

  return (
    <div className="subject-detail-page">
      <div className="detail-header">
        <div>
          <h2 className="detail-title">📘 Subjects Mastered</h2>
          <p className="detail-subtitle">
            See how your effort is distributed across subjects.
          </p>
        </div>
        <div className="detail-pill">
          {totalHours.toFixed(1)} total focused hours
        </div>
      </div>

      {!subjectSummary.length ? (
        <div className="detail-card">
          <h3 className="detail-card-title">No Study Data Found</h3>
          <p className="detail-note">
            Setup your study plan in <strong>Start Goals</strong> first.
          </p>
        </div>
      ) : (
        <>
          <div className="detail-card">
            <h3 className="detail-card-title">Hours per Subject</h3>
            <ReactApexChart
              type="bar"
              height={320}
              options={options}
              series={series}
            />
          </div>

          <div className="detail-card">
            <h3 className="detail-card-title">Detailed Breakdown</h3>

            <ul className="detail-list">
              {subjectSummary.map((s) => {
                const percent =
                  totalHours === 0 ? 0 : Math.round((s.hours / totalHours) * 100);

                return (
                  <li key={s.subject} className="detail-list-item">
                    <div className="detail-item-main">
                      <span className="detail-item-label">{s.subject}</span>
                      <span className="detail-item-sub">
                        {s.hours.toFixed(1)} hrs • {percent}% of study time
                      </span>
                      <div className="detail-progress">
                        <div
                          className="detail-progress-fill"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
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

export default SubjectFocusDetail;
