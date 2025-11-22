// src/pages/health/HealthPage.js
import React, { useContext, useMemo } from "react";
import { HealthContext } from "./HealthContext";

import HealthDashboard from "./HealthDashboard";
import SleepTracker from "./SleepTracker";
import ScreenTracker from "./ScreenTracker";
import ActivityTracker from "./ActivityTracker";
import HydrationMeals from "./HydrationMeals";
import MoodTracker from "./MoodTracker";
import WeeklySummary from "./WeeklySummary";

// small helper for progress bars
const clamp = (value, min, max) => Math.min(max, Math.max(min, value || 0));

// Motivational quotes
const QUOTES = {
  positive: [
    "Small healthy habits every day lead to big academic wins.",
    "Your brain performs best when your body is cared for.",
    "Consistency beats intensity. One healthy choice at a time.",
  ],
  tired: [
    "Rest is part of the work. A fresh mind remembers more.",
    "Sleep is not laziness; it's brain maintenance.",
    "You recharge your phone — your body deserves that too.",
  ],
  stressed: [
    "You don’t need to finish everything today, just the next right step.",
    "Pause. Breathe. A calm mind solves problems better.",
    "Break tasks into tiny chunks. Progress is still progress.",
  ],
};

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const HealthPage = () => {
  const { healthState } = useContext(HealthContext);
  const { sleep, screen, activity, mood } = healthState;

  // ---- progress values for top summary ----
  const sleepPercent = useMemo(() => {
    if (!sleep?.hoursPerNight && sleep?.hoursPerNight !== 0) return null;
    return clamp((sleep.hoursPerNight / 8) * 100, 0, 120);
  }, [sleep]);

  const activityPercent = useMemo(() => {
    if (!activity?.minutesPerDay && activity?.minutesPerDay !== 0) return null;
    return clamp((activity.minutesPerDay / 45) * 100, 0, 140);
  }, [activity]);

  const screenPercent = useMemo(() => {
    if (!screen?.hoursPerDay && screen?.hoursPerDay !== 0) return null;
    const ratio = clamp(screen.hoursPerDay / 8, 0, 1);
    return clamp(100 - ratio * 100, 0, 120);
  }, [screen]);

  // ---- Quote logic ----
  const quoteText = useMemo(() => {
    const todayMood = mood?.todayMood || "";
    const hours = sleep?.hoursPerNight;

    if (todayMood === "Stressed" || todayMood === "Anxious") {
      return pickRandom(QUOTES.stressed);
    }
    if (todayMood === "Tired" || (hours != null && hours < 6)) {
      return pickRandom(QUOTES.tired);
    }
    return pickRandom(QUOTES.positive);
  }, [mood, sleep]);

  // simple progress bar component
  const ProgressBar = ({ label, value, color, detail }) => {
    if (value == null) {
      return (
        <div
          style={{
            padding: "1rem 1.25rem",
            borderRadius: "14px",
            background:
              "radial-gradient(circle at top left, #020617, #020617, #020617)",
            border: "1px solid #4b5563",
            boxShadow: "0 0 8px rgba(15,23,42,0.7)",
          }}
        >
          <div
            style={{
              fontSize: "0.9rem",
              fontWeight: 600,
              marginBottom: "0.25rem",
              color: "#e5e7eb",
            }}
          >
            {label}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
            No data yet. Fill this in the tracker below.
          </div>
        </div>
      );
    }

    return (
      <div
        style={{
          padding: "1rem 1.25rem",
          borderRadius: "14px",
          background:
            "radial-gradient(circle at top left, #020617, #020617, #020617)",
          border: "1px solid rgba(148, 163, 184, 0.6)",
          boxShadow: "0 0 12px rgba(37,99,235,0.35)",
        }}
      >
        <div
          style={{
            fontSize: "0.95rem",
            fontWeight: 600,
            marginBottom: "0.35rem",
            color: "#e5e7eb",
          }}
        >
          {label}
        </div>
        {detail && (
          <div
            style={{
              fontSize: "0.8rem",
              color: "#9ca3af",
              marginBottom: "0.4rem",
            }}
          >
            {detail}
          </div>
        )}
        <div
          style={{
            width: "100%",
            height: "10px",
            borderRadius: "999px",
            background: "#111827",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${clamp(value, 0, 120)}%`,
              height: "100%",
              background: color,
              boxShadow: `0 0 10px ${color}`,
              transition: "width 0.4s ease",
            }}
          />
        </div>
        <div
          style={{
            marginTop: "0.3rem",
            fontSize: "0.75rem",
            color: "#9ca3af",
            textAlign: "right",
          }}
        >
          {Math.round(clamp(value, 0, 120))}%
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "2.5rem 1.5rem",
        background:
          "radial-gradient(circle at top, #020617 0%, #020016 40%, #050018 70%, #020617 100%)",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1180px",
          borderRadius: "24px",
          padding: "2rem 2.2rem",
          background:
            "linear-gradient(145deg, rgba(15,23,42,0.96), rgba(17,24,39,0.96))",
          boxShadow:
            "0 25px 60px rgba(0,0,0,0.75), 0 0 40px rgba(56,189,248,0.25)",
          border: "1px solid rgba(148,163,184,0.5)",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        {/* ---- HEADER ---- */}
        <header
          style={{
            marginBottom: "1.75rem",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "2.2rem",
              fontWeight: 700,
              letterSpacing: "0.03em",
              color: "#e5e7eb",
              textShadow:
                "0 0 16px rgba(56,189,248,0.7), 0 0 40px rgba(124,58,237,0.5)",
              marginBottom: "0.3rem",
            }}
          >
            Cosmic Health Hub
          </h1>
          <p
            style={{
              fontSize: "0.98rem",
              color: "#9ca3af",
            }}
          >
            Align your sleep, screen time, activity and mood with your study
            goals.
          </p>
        </header>

        {/* ---- MOTIVATIONAL QUOTE ---- */}
        <section
          style={{
            marginBottom: "1.75rem",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              maxWidth: "780px",
              width: "100%",
              padding: "1.1rem 1.3rem",
              borderRadius: "18px",
              background:
                "radial-gradient(circle at top, #0b1120, #020617 65%, #020617)",
              border: "1px solid rgba(56,189,248,0.5)",
              boxShadow:
                "0 0 20px rgba(56,189,248,0.35), 0 0 30px rgba(124,58,237,0.25)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "0.78rem",
                letterSpacing: "0.22em",
                color: "#6b7280",
                textTransform: "uppercase",
              }}
            >
              Today&apos;s Health Thought
            </div>
            <p
              style={{
                marginTop: "0.45rem",
                fontSize: "0.98rem",
                fontStyle: "italic",
                color: "#e5e7eb",
              }}
            >
              “{quoteText}”
            </p>
            {mood?.todayMood && (
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#9ca3af",
                  marginTop: "0.4rem",
                }}
              >
                Current mood:{" "}
                <span style={{ color: "#a5b4fc", fontWeight: 500 }}>
                  {mood.todayMood}
                </span>
              </p>
            )}
          </div>
        </section>

        {/* ---- TOP PROGRESS SUMMARY ROW ---- */}
        <section style={{ marginBottom: "2rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1rem",
            }}
          >
            <ProgressBar
              label="Sleep balance"
              value={sleepPercent}
              color="#38bdf8"
              detail={
                sleep?.hoursPerNight != null
                  ? `${sleep.hoursPerNight} hrs • Quality: ${
                      sleep.sleepQuality || "N/A"
                    }`
                  : null
              }
            />
            <ProgressBar
              label="Healthy screen time"
              value={screenPercent}
              color="#f97316"
              detail={
                screen?.hoursPerDay != null
                  ? `${screen.hoursPerDay} hrs • Use: ${
                      screen.purpose || "N/A"
                    }`
                  : null
              }
            />
            <ProgressBar
              label="Daily activity"
              value={activityPercent}
              color="#22c55e"
              detail={
                activity?.minutesPerDay != null
                  ? `${activity.minutesPerDay} mins • Type: ${
                      activity.activityType || "N/A"
                    }`
                  : null
              }
            />
          </div>
        </section>

        {/* ---- HEALTH DASHBOARD (GRAPHS) ---- */}
        <section style={{ marginBottom: "2.4rem" }}>
          <div
            style={{
              padding: "1.1rem 1.25rem",
              borderRadius: "18px",
              background:
                "radial-gradient(circle at top, #020617, #020617, #020617)",
              border: "1px solid rgba(148,163,184,0.6)",
              boxShadow:
                "0 0 18px rgba(15,23,42,0.9), 0 0 26px rgba(56,189,248,0.25)",
            }}
          >
            <h2
              style={{
                fontSize: "1.1rem",
                fontWeight: 600,
                color: "#e5e7eb",
                marginBottom: "0.75rem",
              }}
            >
              Weekly Health Overview
            </h2>
            <HealthDashboard />
          </div>
        </section>

        {/* ---- 7 CRITERIA GRID ---- */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {/* Sleep */}
          <section
            style={{
              padding: "1.4rem",
              borderRadius: "16px",
              background:
                "radial-gradient(circle at top, #020617, #020617, #020617)",
              border: "1px solid rgba(56,189,248,0.4)",
              boxShadow: "0 0 18px rgba(56,189,248,0.25)",
            }}
          >
            <h2
              style={{
                fontSize: "1.3rem",
                color: "#38bdf8",
                marginBottom: "0.9rem",
                fontWeight: 600,
              }}
            >
              Sleep Tracking
            </h2>
            <SleepTracker />
          </section>

          {/* Screen Time */}
          <section
            style={{
              padding: "1.4rem",
              borderRadius: "16px",
              background:
                "radial-gradient(circle at top, #020617, #020617, #020617)",
              border: "1px solid rgba(248,113,113,0.45)",
              boxShadow: "0 0 18px rgba(248,113,113,0.25)",
            }}
          >
            <h2
              style={{
                fontSize: "1.3rem",
                color: "#fb7185",
                marginBottom: "0.9rem",
                fontWeight: 600,
              }}
            >
              Screen Time
            </h2>
            <ScreenTracker />
          </section>

          {/* Activity */}
          <section
            style={{
              padding: "1.4rem",
              borderRadius: "16px",
              background:
                "radial-gradient(circle at top, #020617, #020617, #020617)",
              border: "1px solid rgba(34,197,94,0.5)",
              boxShadow: "0 0 18px rgba(34,197,94,0.25)",
            }}
          >
            <h2
              style={{
                fontSize: "1.3rem",
                color: "#4ade80",
                marginBottom: "0.9rem",
                fontWeight: 600,
              }}
            >
              Daily Activity
            </h2>
            <ActivityTracker />
          </section>

          {/* Hydration & Meals */}
          <section
            style={{
              padding: "1.4rem",
              borderRadius: "16px",
              background:
                "radial-gradient(circle at top, #020617, #020617, #020617)",
              border: "1px solid rgba(250,204,21,0.55)",
              boxShadow: "0 0 18px rgba(250,204,21,0.25)",
            }}
          >
            <h2
              style={{
                fontSize: "1.3rem",
                color: "#fde047",
                marginBottom: "0.9rem",
                fontWeight: 600,
              }}
            >
              Hydration & Meals
            </h2>
            <HydrationMeals />
          </section>

          {/* Mood */}
          <section
            style={{
              padding: "1.4rem",
              borderRadius: "16px",
              background:
                "radial-gradient(circle at top, #020617, #020617, #020617)",
              border: "1px solid rgba(168,85,247,0.55)",
              boxShadow: "0 0 18px rgba(168,85,247,0.3)",
            }}
          >
            <h2
              style={{
                fontSize: "1.3rem",
                color: "#c4b5fd",
                marginBottom: "0.9rem",
                fontWeight: 600,
              }}
            >
              Mood Tracking
            </h2>
            <MoodTracker />
          </section>

          {/* Weekly Summary */}
          <section
            style={{
              padding: "1.4rem",
              borderRadius: "16px",
              background:
                "radial-gradient(circle at top, #020617, #020617, #020617)",
              border: "1px solid rgba(56,189,248,0.5)",
              boxShadow: "0 0 18px rgba(56,189,248,0.25)",
            }}
          >
            <h2
              style={{
                fontSize: "1.3rem",
                color: "#7dd3fc",
                marginBottom: "0.9rem",
                fontWeight: 600,
              }}
            >
              Weekly Summary
            </h2>
            <WeeklySummary />
          </section>
        </div>

        {/* Debug state (optional) */}
        <section
          style={{
            marginTop: "2.2rem",
            fontSize: "0.8rem",
            color: "#9ca3af",
          }}
        >
          <details>
            <summary>Debug: Show full health state</summary>
            <pre
              style={{
                background: "#020617",
                padding: "1rem",
                borderRadius: "10px",
                marginTop: "0.6rem",
                overflow: "auto",
                border: "1px solid #4b5563",
              }}
            >
              {JSON.stringify(healthState, null, 2)}
            </pre>
          </details>
        </section>
      </div>
    </div>
  );
};

export default HealthPage;