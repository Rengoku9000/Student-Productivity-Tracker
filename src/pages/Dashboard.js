import React, { useState, useEffect } from "react";
import "../pages/Dashboard.css";
import { getFromStorage } from "../utils/storage";
import { analyzeProductivity, recommendTimeSlot } from "../utils/aiEngine";
import ReactApexChart from "react-apexcharts";
import { useNavigate } from "react-router-dom";

// ---- Mixed study + gaming quotes ----
const QUOTES = [
  "Success is the sum of small efforts repeated day in and day out.",
  "Grind now, shine later. 🎮",
  "Your future is created by what you do today, not tomorrow.",
  "XP isn’t just in games. You’re leveling up your brain.",
  "Discipline is choosing what you want most over what you want now.",
  "Every expert was once a beginner who didn’t quit.",
  "Small steps every day beat big bursts once a month.",
  "Your only competition is your previous self.",
  "Turn your study time into god-mode focus.",
  "AFK from distractions. Online in your goals.",
];

const getNextQuote = () => {
  try {
    let idx = parseInt(localStorage.getItem("dashQuoteIndex") || "0", 10);
    if (Number.isNaN(idx)) idx = 0;
    const quote = QUOTES[idx % QUOTES.length];
    localStorage.setItem("dashQuoteIndex", String((idx + 1) % QUOTES.length));
    return quote;
  } catch {
    return QUOTES[0];
  }
};

// Safely convert anything to text
const safeText = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

// ⭐ NEW – subject → internal ID for URL
const subjectIdFromName = (subject) => {
  if (!subject) return "unknown";
  return encodeURIComponent(
    String(subject).toLowerCase().replace(/\s+/g, "-")
  );
};

// 🎨 Multiple neon/hacker palettes
const THEMES = [
  {
    name: "Cyberpunk",
    primary: "#ec4899", // pink
    secondary: "#6366f1", // indigo
    accent: "#22d3ee", // cyan
    bg1: "#020617",
    bg2: "#120015",
  },
  {
    name: "Hacker Green",
    primary: "#22c55e",
    secondary: "#4ade80",
    accent: "#a3e635",
    bg1: "#020617",
    bg2: "#020b06",
  },
  {
    name: "Tron Blue",
    primary: "#0ea5e9",
    secondary: "#22d3ee",
    accent: "#22c55e",
    bg1: "#020617",
    bg2: "#001322",
  },
  {
    name: "Inferno Red",
    primary: "#f97316",
    secondary: "#ef4444",
    accent: "#fb7185",
    bg1: "#020617",
    bg2: "#190003",
  },
  {
    name: "Chrome White",
    primary: "#e5e7eb",
    secondary: "#a5b4fc",
    accent: "#67e8f9",
    bg1: "#020617",
    bg2: "#0b1120",
  },
];

// 🎛 Background styles – we’ll toggle classes like bg-matrix, bg-grid, bg-scanlines
const BG_MODES = ["matrix", "grid", "scanlines"];

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    completed: 0,
    pending: 0,
    productivity: 0,
  });
  const [recommendations, setRecommendations] = useState([]);
  const [user, setUser] = useState({ name: "Student", goals: [] });

  const [profile, setProfile] = useState(null);
  const [plan, setPlan] = useState(null);
  const [subjectSummary, setSubjectSummary] = useState([]);
  const [dailySummary, setDailySummary] = useState([]);
  const [todayPlan, setTodayPlan] = useState([]);
  const [motivation, setMotivation] = useState("");

  // Pick a random theme + background each reload
  const [theme] = useState(() => {
    const idx = Math.floor(Math.random() * THEMES.length);
    return THEMES[idx];
  });

  const [bgMode] = useState(() => {
    const idx = Math.floor(Math.random() * BG_MODES.length);
    return BG_MODES[idx];
  });

  useEffect(() => {
    // ---- user profile from utils store ----
    const rawUserProfile = getFromStorage("userProfile");
    let userProfile = { name: "Student", goals: [] };
    if (rawUserProfile && typeof rawUserProfile === "object") {
      userProfile = {
        name:
          typeof rawUserProfile.name === "string"
            ? rawUserProfile.name
            : "Student",
        goals: Array.isArray(rawUserProfile.goals)
          ? rawUserProfile.goals.filter((g) => typeof g === "string")
          : [],
      };
    }
    setUser(userProfile);

    // ---- tasks + productivity ----
    const rawTasks = getFromStorage("tasks");
    const tasks = Array.isArray(rawTasks) ? rawTasks : [];
    let pStats = { completed: 0, pending: 0, productivity: 0 };
    try {
      const res = analyzeProductivity(tasks);
      if (res && typeof res === "object") {
        pStats = {
          completed: Number(res.completed || 0),
          pending: Number(res.pending || 0),
          productivity: Number(res.productivity || 0),
        };
      }
    } catch {
      // ignore and keep defaults
    }
    setStats(pStats);

    // ---- AI recommendations ----
    try {
      const rec = recommendTimeSlot(tasks);
      const arr = Array.isArray(rec) ? rec : rec ? [rec] : [];
      setRecommendations(arr);
    } catch {
      setRecommendations([]);
    }

    // ---- profileData from Profile page ----
    try {
      const storedProfile = JSON.parse(
        localStorage.getItem("profileData") || "null"
      );
      if (storedProfile && typeof storedProfile === "object") {
        setProfile(storedProfile);
      }
    } catch {
      setProfile(null);
    }

    // ---- studyPlan from StartGoals ----
    try {
      const storedPlan = JSON.parse(
        localStorage.getItem("studyPlan") || "null"
      );
      if (storedPlan && Array.isArray(storedPlan.days)) {
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
        setTodayPlan(storedPlan.days[0]?.slots || []);
      } else {
        setPlan(null);
        setDailySummary([]);
        setSubjectSummary([]);
        setTodayPlan([]);
      }
    } catch {
      setPlan(null);
      setDailySummary([]);
      setSubjectSummary([]);
      setTodayPlan([]);
    }

    setMotivation(getNextQuote());
  }, []);

  const focusArea =
    (profile && profile.focusArea) ||
    (user.goals && user.goals[0]) ||
    "Learning & Growth";

  const totalPlannedDays = plan?.days?.length || 0;
  const totalStudyHours = subjectSummary.reduce(
    (sum, x) => sum + (x.hours || 0),
    0
  );
  const completedSubjectsCount = profile?.completedSubjects?.length || 0;

  const safeRecs = Array.isArray(recommendations) ? recommendations : [];

  // ---- ApexCharts data ----

  // 1) Tasks – donut
  const taskSeries =
    stats.completed === 0 && stats.pending === 0
      ? [1, 1]
      : [stats.completed || 0, stats.pending || 0];

  const taskOptions = {
    chart: {
      background: "transparent",
      animations: { enabled: true },
    },
    labels: ["Completed", "Pending"],
    legend: {
      labels: { colors: "#e5e7eb" },
    },
    dataLabels: { enabled: false },
    stroke: { width: 1, colors: ["#020617"] },
    colors: [theme.primary, theme.secondary],
  };

  // 2) Daily trend – area
  const dayLabels =
    dailySummary.length > 0 ? dailySummary.map((d) => d.label) : ["No Data"];

  const daySeries = [
    {
      name: "Study Hours",
      data:
        dailySummary.length > 0
          ? dailySummary.map((d) => d.hours)
          : [0],
    },
  ];

  const dayOptions = {
    chart: {
      background: "transparent",
      toolbar: { show: false },
      animations: { enabled: true },
    },
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
    colors: [theme.accent],
    grid: { borderColor: "#1f2937" },
  };

  // 3) Subject focus – horizontal bar
  const subjectLabels =
    subjectSummary.length > 0
      ? subjectSummary.map((s) => s.subject)
      : ["No subjects"];

  const subjectSeries = [
    {
      name: "Hours",
      data:
        subjectSummary.length > 0
          ? subjectSummary.map((s) => s.hours)
          : [0],
    },
  ];

  const subjectOptions = {
    chart: { background: "transparent", toolbar: { show: false } },
    plotOptions: {
      bar: { horizontal: true, borderRadius: 4 },
    },
    xaxis: {
      labels: { style: { colors: "#9ca3af" } },
    },
    yaxis: {
      categories: subjectLabels,
      labels: { style: { colors: "#9ca3af" } },
    },
    dataLabels: { enabled: false },
    colors: [theme.secondary],
    grid: { borderColor: "#1f2937" },
  };

  // Expose theme vars to CSS
  const themeStyle = {
    "--neon-main": theme.primary,
    "--neon-second": theme.secondary,
    "--neon-accent": theme.accent,
    "--bg1": theme.bg1,
    "--bg2": theme.bg2,
  };

  return (
    <div
      className={`dashboard-container bg-${bgMode}`}
      style={themeStyle}
    >
      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h1 className="glitch-text">
            Welcome, {safeText(user.name)}
            <span className="glitch-shadow">
              Welcome, {safeText(user.name)}
            </span>
          </h1>
          <p className="dashboard-focus">
            Focus: <span>{safeText(focusArea)}</span>
          </p>
        </div>
        <div className="header-pill">
          {theme.name} • {bgMode.toUpperCase()} MODE
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="kpi-row">
        <div
          className="kpi-card kpi-1 clickable"
          onClick={() => navigate("/insights/tasks")}
        >
          <div className="kpi-label">Tasks Completed</div>
          <div className="kpi-value">{safeText(stats.completed)}</div>
          <div className="kpi-extra">
            {safeText(stats.pending)} pending •{" "}
            {safeText(stats.productivity)}% productivity
          </div>
        </div>

        <div
          className="kpi-card kpi-2 clickable"
          onClick={() => navigate("/insights/study")}
        >
          <div className="kpi-label">Study Plan</div>
          <div className="kpi-value">{safeText(totalPlannedDays)}</div>
          <div className="kpi-extra">
            {safeText(totalStudyHours.toFixed(1))} hrs scheduled
          </div>
        </div>

        <div
          className="kpi-card kpi-3 clickable" // ⭐ Clickable
          onClick={() => navigate("/leaderboard")} // ⭐ Redirects to Leaderboard
        >
          <div className="kpi-label">Subjects Mastered</div>
          <div className="kpi-value">
            {safeText(completedSubjectsCount)}
          </div>
          <div className="kpi-extra">
            {safeText(profile?.languages?.length || 0)} coding skills learned
          </div>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="charts-grid">
        <div
          className="chart-card clickable"
          onClick={() => navigate("/insights/tasks")}
        >
          <h3 className="chart-title">Tasks Overview</h3>
          <ReactApexChart
            options={taskOptions}
            series={taskSeries}
            type="donut"
            height={230}
          />
        </div>

        <div
          className="chart-card clickable"
          onClick={() => navigate("/insights/study")}
        >
          <h3 className="chart-title">Study Time Over Days</h3>
          <ReactApexChart
            options={dayOptions}
            series={daySeries}
            type="area"
            height={230}
          />
        </div>

        <div
          className="chart-card clickable"
          onClick={() => navigate("/insights/subjects")}
        >
          <h3 className="chart-title">Focus by Subject</h3>
          <ReactApexChart
            options={subjectOptions}
            series={subjectSeries}
            type="bar"
            height={230}
          />
        </div>
      </div>

      {/* BOTTOM GRID */}
      <div className="bottom-grid">
        {/* TODAY PLAN */}
        <div className="panel-card">
          <h3 className="panel-title">Today&apos;s Missions</h3>
          {todayPlan && todayPlan.length > 0 ? (
            <ul className="today-list">
              {todayPlan.map((slot, idx) => (
                <li
                  key={idx}
                  className="today-item"
                  onClick={() =>
                    navigate(`/subject/${subjectIdFromName(slot.subject)}`)
                  }
                >
                  <span className="today-subject">
                    {safeText(slot.subject)}
                  </span>
                  <span className="today-hours">
                    {safeText(slot.hours)} hrs
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-text">
              No missions yet. Create a plan in <strong>Start Goals</strong>.
            </p>
          )}
        </div>

        {/* MOTIVATION */}
        <div className="panel-card motivation-panel">
          <h3 className="panel-title">Daily Buff ✨</h3>
          <p className="quote-text">“{safeText(motivation)}”</p>
          <p className="quote-sub">
            Hack your day: mute distractions, follow the plan, and level up 1%
            today. 🧠
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;