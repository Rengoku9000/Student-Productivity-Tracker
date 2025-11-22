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
  });

  const updateHealthField = (fieldName, newValue) => {
    setHealthState((prev) => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        ...newValue,
      },
    }));
  };

  const value = { healthState, setHealthState, updateHealthField };

  return (
    <HealthContext.Provider value={value}>
      {children}
    </HealthContext.Provider>
  );
};