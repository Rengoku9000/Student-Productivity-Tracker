// src/pages/health/HealthContext.js
import React, { createContext, useState } from "react";

export const HealthContext = createContext();

export const HealthProvider = ({ children }) => {
  const [healthState, setHealthState] = useState({
    sleep: { hoursPerNight: null, sleepQuality: null },
    screen: { hoursPerDay: null, purpose: null },
    activity: { minutesPerDay: null, activityType: null },
    hydrationMeals: { waterGlasses: null, mealsQuality: null },
    mood: { todayMood: null, notes: "" },
    weeklySummary: { overallScore: null, highlight: "", improvementArea: "" },

    // 👇 NEW: simple history arrays for graphs (last 7 entries)
    history: {
      sleepHours: [],       // [{ day: 'Mon', value: 7 }, ...]
      screenHours: [],
      activityMinutes: [],
    },
  });

  // helper to update a section + keep 7-day-ish history for graphs
  const updateHealthField = (fieldName, newValue) => {
    setHealthState((prev) => {
      const updated = {
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          ...newValue,
        },
      };

      // day label like "Mon", "Tue"
      const dayLabel = new Date().toLocaleDateString("en-IN", {
        weekday: "short",
      });

      // copy previous history so we can modify it
      const prevHistory = prev.history || {
        sleepHours: [],
        screenHours: [],
        activityMinutes: [],
      };

      let newHistory = { ...prevHistory };

      if (fieldName === "sleep" && newValue.hoursPerNight != null) {
        const arr = prevHistory.sleepHours || [];
        newHistory.sleepHours = [...arr.slice(-6), { day: dayLabel, value: newValue.hoursPerNight }];
      }

      if (fieldName === "screen" && newValue.hoursPerDay != null) {
        const arr = prevHistory.screenHours || [];
        newHistory.screenHours = [...arr.slice(-6), { day: dayLabel, value: newValue.hoursPerDay }];
      }

      if (fieldName === "activity" && newValue.minutesPerDay != null) {
        const arr = prevHistory.activityMinutes || [];
        newHistory.activityMinutes = [
          ...arr.slice(-6),
          { day: dayLabel, value: newValue.minutesPerDay },
        ];
      }

      // only attach history if we changed it
      if (
        newHistory.sleepHours !== prevHistory.sleepHours ||
        newHistory.screenHours !== prevHistory.screenHours ||
        newHistory.activityMinutes !== prevHistory.activityMinutes
      ) {
        updated.history = newHistory;
      } else {
        updated.history = prevHistory;
      }

      return updated;
    });
  };

  const value = {
    healthState,
    setHealthState,   // if you ever need full control
    updateHealthField // recommended way for Sleep/Screen/Activity components
  };

  return (
    <HealthContext.Provider value={value}>
      {children}
    </HealthContext.Provider>
  );
};