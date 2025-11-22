// src/utils/healthLogic.js

// ---------- SMALL HELPERS ----------

/**
 * Safe average of numbers.
 * @param {number[]} arr
 * @returns {number}
 */
const avg = (arr) =>
  arr && arr.length ? arr.reduce((sum, v) => sum + v, 0) / arr.length : 0;

/**
 * Filter entries that have a .date within the last N days (including today).
 * Expects ISO-like date strings: "2025-11-21".
 * @param {Array<{date: string}>} entries
 * @param {number} days
 * @returns {Array}
 */
export const filterLastNDays = (entries, days = 7) => {
  if (!Array.isArray(entries) || days <= 0) return [];

  const from = new Date();
  from.setHours(0, 0, 0, 0);
  from.setDate(from.getDate() - (days - 1)); // include today

  return entries.filter((e) => {
    if (!e.date) return false;
    const d = new Date(e.date);
    d.setHours(0, 0, 0, 0);
    return d >= from;
  });
};

// ---------- HEALTH SUMMARY (OVERALL) ----------

/**
 * Compute overall (all-time) health summary from raw entry arrays.
 * Values are NOT limited to last week here – it's based on all logs.
 *
 * @param {Object} params
 * @param {Array} params.sleepEntries
 * @param {Array} params.screenEntries
 * @param {Array} params.activityEntries
 * @param {Array} params.hydrationMealsEntries
 * @param {Array} params.moodEntries
 */
export const computeHealthSummary = ({
  sleepEntries = [],
  screenEntries = [],
  activityEntries = [],
  hydrationMealsEntries = [],
  moodEntries = [],
}) => {
  const avgSleep = avg(sleepEntries.map((e) => Number(e.hours || 0)));
  const avgScreen = avg(screenEntries.map((e) => Number(e.totalHours || 0)));
  const totalActivity = activityEntries.reduce(
    (sum, e) => sum + Number(e.duration || 0),
    0
  );
  const avgWater = avg(
    hydrationMealsEntries.map((e) => Number(e.waterGlasses || 0))
  );

  const latestMood = moodEntries.length
    ? moodEntries[moodEntries.length - 1].mood
    : 'N/A';

  const daysLogged = new Set([
    ...sleepEntries.map((e) => e.date),
    ...screenEntries.map((e) => e.date),
    ...activityEntries.map((e) => e.date),
    ...hydrationMealsEntries.map((e) => e.date),
    ...moodEntries.map((e) => e.date),
  ]).size;

  return {
    avgSleep: Number(avgSleep.toFixed(1)) || 0,
    avgScreen: Number(avgScreen.toFixed(1)) || 0,
    totalActivity: Number(totalActivity.toFixed(0)) || 0,
    avgWater: Number(avgWater.toFixed(1)) || 0,
    latestMood: latestMood || 'N/A',
    daysLogged,
  };
};

// ---------- WEEKLY SUMMARY (LAST 7 DAYS) ----------

/**
 * Compute a weekly (last 7 days) summary from raw entry arrays.
 *
 * @param {Object} params
 * @param {Array} params.sleepEntries
 * @param {Array} params.screenEntries
 * @param {Array} params.activityEntries
 * @param {Array} params.hydrationMealsEntries
 * @param {Array} params.moodEntries
 */
export const computeWeeklySummary = ({
  sleepEntries = [],
  screenEntries = [],
  activityEntries = [],
  hydrationMealsEntries = [],
  moodEntries = [],
}) => {
  const lastWeekSleep = filterLastNDays(sleepEntries, 7);
  const lastWeekScreen = filterLastNDays(screenEntries, 7);
  const lastWeekActivity = filterLastNDays(activityEntries, 7);
  const lastWeekHydration = filterLastNDays(hydrationMealsEntries, 7);
  const lastWeekMood = filterLastNDays(moodEntries, 7);

  const avgSleep = avg(lastWeekSleep.map((e) => Number(e.hours || 0)));
  const avgScreen = avg(lastWeekScreen.map((e) => Number(e.totalHours || 0)));
  const totalActivity = lastWeekActivity.reduce(
    (sum, e) => sum + Number(e.duration || 0),
    0
  );
  const avgWater = avg(
    lastWeekHydration.map((e) => Number(e.waterGlasses || 0))
  );

  const moodsCount = {};
  lastWeekMood.forEach((e) => {
    moodsCount[e.mood] = (moodsCount[e.mood] || 0) + 1;
  });

  const mostCommonMood =
    lastWeekMood.length &&
    Object.entries(moodsCount).sort((a, b) => b[1] - a[1])[0][0];

  const daysCount = Math.max(
    lastWeekSleep.length,
    lastWeekScreen.length,
    lastWeekActivity.length,
    lastWeekHydration.length,
    lastWeekMood.length
  );

  return {
    daysCount,
    avgSleep: Number(avgSleep.toFixed(1)) || 0,
    avgScreen: Number(avgScreen.toFixed(1)) || 0,
    totalActivity: Number(totalActivity.toFixed(0)) || 0,
    avgWater: Number(avgWater.toFixed(1)) || 0,
    mood: mostCommonMood || 'N/A',
  };
};

// ---------- OVERALL HEALTH SCORE (0–100) ----------

/**
 * Compute a simple overall health score 0–100 based on summary.
 * You can tweak the thresholds any time.
 *
 * @param {Object} healthSummary result of computeHealthSummary
 */
export const computeOverallHealthScore = (healthSummary) => {
  if (!healthSummary) return 0;

  const { avgSleep, avgScreen, totalActivity, avgWater } = healthSummary;

  let score = 0;

  // Sleep: ideal ~7–9 hours
  if (avgSleep >= 7 && avgSleep <= 9) score += 30;
  else if (avgSleep >= 6 && avgSleep < 7) score += 20;
  else if (avgSleep >= 5 && avgSleep < 6) score += 10;

  // Screen: less is better (we assume <= 4 hrs is optimal)
  if (avgScreen <= 4) score += 25;
  else if (avgScreen <= 6) score += 15;
  else if (avgScreen <= 8) score += 5;

  // Activity: target ~150 mins/week (but here we use all-time total as a rough proxy)
  if (totalActivity >= 150) score += 25;
  else if (totalActivity >= 90) score += 15;
  else if (totalActivity >= 60) score += 8;

  // Hydration: target ~6 glasses/day
  if (avgWater >= 6) score += 20;
  else if (avgWater >= 4) score += 10;

  return score;
};

// ---------- AI-LIKE INSIGHTS / RECOMMENDATIONS ----------

/**
 * Generate simple, student-friendly health insights
 * based on healthSummary and weeklySummary.
 *
 * @param {Object} healthSummary from computeHealthSummary
 * @param {Object} weeklySummary from computeWeeklySummary
 * @returns {string[]} list of recommendations/tips
 */
export const generateHealthInsights = (healthSummary, weeklySummary) => {
  const tips = [];

  if (!healthSummary) return tips;

  const {
    avgSleep,
    avgScreen,
    totalActivity,
    avgWater,
    latestMood,
    daysLogged,
  } = healthSummary;

  // 1. Sleep
  if (avgSleep < 6) {
    tips.push(
      'Try to increase your sleep by 1–2 hours. Most students focus better with 7–8 hours of sleep.'
    );
  } else if (avgSleep >= 7 && avgSleep <= 9) {
    tips.push('Your sleep duration looks healthy. Keep this routine stable.');
  } else {
    tips.push(
      'Your sleep is okay, but make sure your sleep schedule is consistent (similar bedtime and wake-up time).'
    );
  }

  // 2. Screen time
  if (avgScreen > 6) {
    tips.push(
      'Your screen time is quite high. Try setting a fixed cut-off time at night and keep your phone away while studying.'
    );
  } else if (avgScreen > 4) {
    tips.push(
      'Screen time is moderate. You can improve focus further by reducing social media scrolling during study hours.'
    );
  } else if (avgScreen > 0) {
    tips.push(
      'Nice! Your screen usage is under control. Just ensure most of it is productive (classes, notes, coding, etc.).'
    );
  }

  // 3. Activity
  if (totalActivity < 60) {
    tips.push(
      'Try adding at least a 15–20 minute walk or light workout daily. It improves mood, energy, and memory.'
    );
  } else if (totalActivity < 150) {
    tips.push(
      'You are somewhat active. Aim for a total of ~150 minutes of activity per week to maximise health benefits.'
    );
  } else {
    tips.push(
      'Great job staying active! Regular movement is strongly linked to better concentration and reduced stress.'
    );
  }

  // 4. Hydration
  if (avgWater < 4) {
    tips.push(
      'Drink a bit more water. Keeping a bottle on your desk and taking small sips often can help.'
    );
  } else if (avgWater < 6) {
    tips.push(
      'Hydration is okay, but you can try to reach around 6–8 glasses of water per day.'
    );
  } else {
    tips.push(
      'Hydration looks good! Keep this habit, especially during long study sessions.'
    );
  }

  // 5. Mood / stress
  if (latestMood && latestMood.toLowerCase().includes('stressed')) {
    tips.push(
      'You seem stressed lately. Try short breaks, deep breathing, or a quick walk between study blocks.'
    );
  } else if (latestMood && latestMood.toLowerCase().includes('happy')) {
    tips.push(
      'You have logged happy moods recently. Notice what routines or habits support this and keep them.'
    );
  }

  // 6. Logging consistency
  if (daysLogged < 3) {
    tips.push(
      'You have very few days logged. Try to update your health trackers for at least 5–7 days to see clear patterns.'
    );
  }

  // 7. Weekly summary-based insights (if available)
  if (weeklySummary) {
    const { daysCount, mood } = weeklySummary;

    if (daysCount > 0 && daysCount < 4) {
      tips.push(
        'For this week, the data is a bit limited. Logging more days will help give better recommendations.'
      );
    }

    if (mood && mood.toLowerCase().includes('low')) {
      tips.push(
        'Your mood this week has been mostly low. Please take breaks, talk to friends/family, and don’t hesitate to reach out to a counsellor if needed.'
      );
    }
  }

  // Remove duplicates just in case
  return Array.from(new Set(tips));
};