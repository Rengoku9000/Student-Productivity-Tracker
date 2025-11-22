// src/pages/StudyPlanDetail.js
import React, { useEffect, useState } from "react";
import "./DashboardDetail.css";
import ReactApexChart from "react-apexcharts";

const StudyPlanDetail = () => {
  const [plan, setPlan] = useState(null);
  const [dailySummary, setDailySummary] = useState([]);
  const [subjectSummary, setSubjectSummary] = useState([]);

  useEffect(() => {
    try {
      const storedPlan = JSON.parse(
        localStorage.getItem("studyPlan") || "null"
      );
      if (!storedPlan || !Array.isArray(storedPlan.days)) return;

      setPlan(storedPlan);

      const subjMap = {};
      const dayList = [];

      storedPlan.days.forEach((day, idx) => {
        let totalH = 0;
        (day.slots || []).forEach((slot) => {
          const subj = String(slot.subject || "");
          const hrs = Number(slot.hours || 0);
          if (!subj) return;
          totalH += hrs;
          subjMap[subj] = (subjMap[subj] || 0) + hrs;
        });
        dayList.push({
          label: `Day ${day.dayNumber || idx + 1}`,
          hours: Number(totalH.toFixed(1)),
        });
      });

      setDailySummary(dayList);
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

  const totalDays = plan?.days?.length || 0;
  const totalHours = subjectSummary.reduce(
    (sum, x) => sum + (x.hours || 0),
    0
  );

  const dayLabels =
    dailySummary.length > 0 ? dailySummary.map((d) => d.label) : ["No Data"];
  const daySeries = [
    {
      name: "Study Hours",
      data:
        dailySummary.length > 0 ? dailySummary.map((d) => d.hours) : [0],
    },
  ];

  const dayOptions = {
    chart: { background: "transparent", toolbar: { show: false } },
    xaxis: {
      categories: dayLabels,
      labels: { style: { colors: "#9ca3af" } },
    },
    yaxis: {
      labels: { style: { colors: "#9ca3af" } },
    },
    stroke: { curve: "smooth", width: 3 },
    dataLabels: { enabled: false },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 0.8,
        opacityFrom: 0.5,
        opacityTo: 0.1,
        stops: [0, 50, 100],
      },
    },
    colors: ["#22d3ee"],
    grid: { borderColor: "#1f2937" },
  };

  const subjectLabels =
    subjectSummary.length > 0
      ? subjectSummary.map((s) => s.subject)
      : ["No subjects"];
  const subjectSeries = [
    {
      name: "Hours",
      data:
        subjectSummary.length > 0 ? subjectSummary.map((s) => s.hours) : [0],
    },
  ];
  const subjectOptions = {
    chart: { background: "transparent", toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
    xaxis: { labels: { style: { colors: "#9ca3af" } } },
    yaxis: {
      categories: subjectLabels,
      labels: { style: { colors: "#9ca3af" } },
    },
    dataLabels: { enabled: false },
    colors: ["#6366f1"],
    grid: { borderColor: "#1f2937" },
  };

  return (
    <div className="detail-page">
      <div className="detail-header">
        <div>
          <h2 className="detail-title">Study Plan Detail</h2>
          <p className="detail-subtitle">
            Full breakdown of your generated week schedule.
          </p>
        </div>
        <div className="detail-pill">
          {totalDays} Days • {totalHours.toFixed(1)} planned hours
        </div>
      </div>

      {!plan ? (
        <div className="detail-card">
          <h3 className="detail-card-title">No Plan Found</h3>
          <p className="detail-note">
            Generate a plan from <strong>Start Goals</strong> to see more
            analytics here.
          </p>
        </div>
      ) : (
        <>
          <div className="detail-stat-grid">
            <div className="detail-stat-box">
              <div className="detail-stat-label">Total Days</div>
              <div className="detail-stat-value">{totalDays}</div>
              <div className="detail-stat-note">
                Includes all days in the current saved plan.
              </div>
            </div>
            <div className="detail-stat-box">
              <div className="detail-stat-label">Total Hours</div>
              <div className="detail-stat-value">
                {totalHours.toFixed(1)}
              </div>
              <div className="detail-stat-note">
                Sum of all subject slots across the plan.
              </div>
            </div>
          </div>

          <div className="detail-card">
            <h3 className="detail-card-title">Hours per Day</h3>
            <ReactApexChart
              type="area"
              height={260}
              options={dayOptions}
              series={daySeries}
            />
            <p className="detail-note">
              Ideally your graph should look stable – not huge spikes and
              drops.
            </p>
          </div>

          <div className="detail-card">
            <h3 className="detail-card-title">Hours per Subject</h3>
            <ReactApexChart
              type="bar"
              height={260}
              options={subjectOptions}
              series={subjectSeries}
            />
            <p className="detail-note">
              Subjects with very low hours might need extra revision sessions.
            </p>
          </div>

          <div className="detail-card">
            <h3 className="detail-card-title">Plan Table View</h3>
            {plan.days.map((day) => (
              <div key={day.dayNumber} className="detail-list-item">
                <div className="detail-item-main">
                  <span className="detail-item-label">
                    Day {day.dayNumber}
                  </span>
                  <span className="detail-item-sub">
                    {(day.slots || [])
                      .map(
                        (s) => `${s.subject || "Unknown"} (${s.hours}h)`
                      )
                      .join(" • ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default StudyPlanDetail;
