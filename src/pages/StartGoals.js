import React, { useState, useEffect, useContext } from "react";
import { SyllabusContext } from "../App";
import "./StartGoals.css";

// 🔹 Rotating motivation quotes (mixed styles)
const QUOTES = [
  "Success is the sum of small efforts repeated day in and day out.",
  "Your future is created by what you do today, not tomorrow.",
  "Discipline is choosing what you want most over what you want now.",
  "Dream big. Start small. Act now.",
  "Little progress each day adds up to big results.",
  "You don’t have to be great to start, but you have to start to be great.",
  "Focus on improvement, not perfection.",
  "Consistency beats intensity every time.",
  "Your hard work today is your strength tomorrow.",
  "Study now, so your future self can chill later.",
  "Success doesn’t come from what you do occasionally, but from what you do consistently.",
  "Champions are made when no one is watching.",
  "Every expert was once a beginner.",
  "Small steps are still steps forward.",
  "You are stronger than you think and smarter than you feel."
];

const getNextQuote = () => {
  try {
    let idx = parseInt(localStorage.getItem("quoteIndex") || "0", 10);
    if (Number.isNaN(idx)) idx = 0;
    const quote = QUOTES[idx % QUOTES.length];
    const nextIdx = (idx + 1) % QUOTES.length;
    localStorage.setItem("quoteIndex", String(nextIdx));
    return quote;
  } catch {
    return QUOTES[0];
  }
};

// simple stopword list for fallback extraction
const STOPWORDS = new Set([
  "i", "am", "is", "are", "was", "were", "the", "a", "an", "of", "in", "on",
  "for", "to", "too", "and", "or", "but", "because", "so", "that", "this",
  "these", "those", "it", "with", "about", "have", "has", "had", "do", "does",
  "did", "dont", "don't", "cant", "can't", "cannot", "get", "got", "like",
  "very", "really", "just", "only", "into", "from", "when", "while"
]);

// 🔹 LocalStorage key for slot checkboxes
const SLOT_CHECKS_STORAGE_KEY = "weekPlanSlotChecks";

const StartGoals = () => {
  const syllabusData = useContext(SyllabusContext);

  const [profile, setProfile] = useState(null);
  const [numDays, setNumDays] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState("");

  // Week 1 config
  const [rankedSubjects, setRankedSubjects] = useState([]);
  const [difficultyLevels, setDifficultyLevels] = useState({});
  const [subjectToAdd, setSubjectToAdd] = useState("");

  // Plans & meta
  const [week1Plan, setWeek1Plan] = useState(null);
  const [week2Plan, setWeek2Plan] = useState(null);
  const [remainingDays, setRemainingDays] = useState(0);
  const [motivation, setMotivation] = useState("");

  // Week 2 config (separate)
  const [showWeek2Modal, setShowWeek2Modal] = useState(false);
  const [week2Selected, setWeek2Selected] = useState([]); // checkbox selection
  const [week2RankedSubjects, setWeek2RankedSubjects] = useState([]);
  const [week2DifficultyLevels, setWeek2DifficultyLevels] = useState({});

  // 🔹 Doubt Lab states
  const [doubts, setDoubts] = useState([]);
  const [newDoubtSubject, setNewDoubtSubject] = useState("");
  const [newDoubtTopic, setNewDoubtTopic] = useState("");
  const [newDoubtNotes, setNewDoubtNotes] = useState("");
  const [newDoubtStatus, setNewDoubtStatus] = useState("unsolved");
  const [doubtFilter, setDoubtFilter] = useState("all"); // all | unsolved | in-progress | solved
  const [isGeneratingResources, setIsGeneratingResources] = useState(false);

  // 🔹 Tab state: plan | doubts | stats
  const [activeTab, setActiveTab] = useState("plan");

  // 🔹 NEW: checkbox state for each plan slot (Day + Subject)
  // shape: { [slotKey]: true/false }
  const [slotChecks, setSlotChecks] = useState({});

  // Load profile
  useEffect(() => {
    const savedProfile = JSON.parse(localStorage.getItem("profileData"));
    setProfile(savedProfile || null);
  }, []);

  // Load checkbox state from localStorage once
  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(SLOT_CHECKS_STORAGE_KEY) || "{}"
      );
      if (saved && typeof saved === "object") {
        setSlotChecks(saved);
      }
    } catch {
      setSlotChecks({});
    }
  }, []);

  // Persist checkbox state whenever it changes
  useEffect(() => {
    localStorage.setItem(SLOT_CHECKS_STORAGE_KEY, JSON.stringify(slotChecks));
  }, [slotChecks]);

  const streamData = syllabusData[profile?.stream];
  const semData = streamData?.years?.[profile?.year]?.[profile?.semester] || {};
  const semesterSubjects = semData.subjects || [];
  const completedSubjects = profile?.completedSubjects || [];

  const pendingSubjects = semesterSubjects.filter(
    (sub) => !completedSubjects.includes(sub)
  );

  const isCompleted = (sub) => completedSubjects.includes(sub);

  const getSubjectLabel = (sub) =>
    isCompleted(sub) ? `${sub} (Completed)` : sub;

  // Reset when profile semester changes
  useEffect(() => {
    if (!profile) return;
    setRankedSubjects([]);
    setDifficultyLevels({});
    setSubjectToAdd("");

    setWeek1Plan(null);
    setWeek2Plan(null);
    setRemainingDays(0);
    setMotivation("");
    setShowWeek2Modal(false);

    setWeek2Selected([]);
    setWeek2RankedSubjects([]);
    setWeek2DifficultyLevels({});
  }, [profile?.stream, profile?.year, profile?.semester]);

  // 🔹 Load doubts from localStorage once
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("doubts") || "[]");
      if (Array.isArray(stored)) {
        setDoubts(stored);
      }
    } catch {
      setDoubts([]);
    }
  }, []);

  // 🔹 Common helpers

  const diffFactor = (d) => {
    if (d === "hard") return 1.7;
    if (d === "medium") return 1.3;
    return 1.0;
  };

  const computeWeightsFor = (subjects, diffMap) => {
    const N = subjects.length;
    return subjects.map((sub, idx) => {
      const priorityWeight = N - idx; // higher rank → higher number
      const baseWeight = priorityWeight * diffFactor(diffMap[sub] || "medium");
      const finalWeight = isCompleted(sub) ? baseWeight * 0.5 : baseWeight;
      return { sub, weight: finalWeight };
    });
  };

  const buildDailySlots = (weights, hours) => {
    const totalWeight = weights.reduce((sum, x) => sum + x.weight, 0) || 1;
    return weights.map((w) => {
      const share = w.weight / totalWeight;
      let dailyHours = parseFloat((share * hours).toFixed(1));
      if (!dailyHours || dailyHours <= 0) dailyHours = 0.3;
      return {
        subject: w.sub,
        hours: dailyHours
      };
    });
  };

  // 🔹 AI topic extraction helpers

  const fallbackExtractTopics = (subject, text) => {
    const raw = `${subject || ""} ${text || ""}`
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ");
    const words = raw.split(/\s+/).filter(Boolean);
    const important = words.filter((w) => !STOPWORDS.has(w) && w.length > 2);
    const unique = [...new Set(important)];
    if (unique.length === 0) return [];
    // group into short phrases (rough heuristic)
    const joined = unique.join(" ");
    // just return 1–2 phrases max
    return [joined.slice(0, 80)];
  };

  const extractTopicsWithAI = async (subject, topic, notes) => {
    const apiKey = localStorage.getItem("openaiApiKey");
    if (!apiKey) return null;

    const userText = `Subject: ${subject || "Unknown"}
Main topic line: ${topic || "(none)"}
Extra notes: ${notes || "(none)"}

Return only JSON like:
{"topics":["topic1","topic2",...]}
Do NOT add any explanation or extra text.`;

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "You help extract clean study topics from messy student doubt text. Only output JSON with a 'topics' array of short topic strings."
            },
            { role: "user", content: userText }
          ]
        })
      });

      if (!res.ok) {
        return null;
      }
      const data = await res.json();
      if (
        data &&
        data.choices &&
        data.choices[0] &&
        data.choices[0].message &&
        data.choices[0].message.content
      ) {
        let parsed;
        try {
          parsed = JSON.parse(data.choices[0].message.content);
        } catch {
          return null;
        }
        if (parsed && Array.isArray(parsed.topics)) {
          const cleaned = parsed.topics
            .map((t) => String(t || "").trim())
            .filter(Boolean);
          return cleaned.slice(0, 3);
        }
      }
      return null;
    } catch (e) {
      console.error("AI topic extraction failed", e);
      return null;
    }
  };

  const fetchYoutubeLinksForTopics = async (topics) => {
    const ytKey = localStorage.getItem("youtubeApiKey");
    const links = [];

    // no key → just use generic search urls
    if (!ytKey) {
      topics.forEach((t) => {
        const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(
          t + " tutorial"
        )}`;
        links.push(url);
      });
      return links.slice(0, 3);
    }

    for (let i = 0; i < topics.length && i < 3; i++) {
      const q = topics[i];
      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(
            q + " tutorial"
          )}&key=${ytKey}`
        );
        if (!res.ok) {
          links.push(
            `https://www.youtube.com/results?search_query=${encodeURIComponent(
              q + " tutorial"
            )}`
          );
          continue;
        }
        const data = await res.json();
        if (data.items && data.items[0] && data.items[0].id.videoId) {
          const vidId = data.items[0].id.videoId;
          links.push(`https://www.youtube.com/watch?v=${vidId}`);
        } else {
          links.push(
            `https://www.youtube.com/results?search_query=${encodeURIComponent(
              q + " tutorial"
            )}`
          );
        }
      } catch (e) {
        console.error("YouTube fetch failed", e);
        links.push(
          `https://www.youtube.com/results?search_query=${encodeURIComponent(
            q + " tutorial"
          )}`
        );
      }
    }

    return links;
  };

  const buildPdfUrlsForTopics = (topics) => {
    const urls = [];
    topics.slice(0, 3).forEach((t) => {
      const pdfQuery = `${t} notes filetype:pdf`;
      const githubQuery = `github ${t} pdf`;
      urls.push(
        `https://www.google.com/search?q=${encodeURIComponent(pdfQuery)}`
      );
      urls.push(
        `https://www.google.com/search?q=${encodeURIComponent(githubQuery)}`
      );
    });
    return urls;
  };

  const handleAddDoubt = async () => {
    if (!newDoubtSubject) {
      alert("⚠ Please select a subject for your doubt.");
      return;
    }
    if (!newDoubtTopic.trim()) {
      alert("⚠ Please write at least the main topic of your doubt.");
      return;
    }

    setIsGeneratingResources(true);

    // Determine current week id (link doubt to this plan)
    let currentWeekId = null;
    if (week1Plan && week1Plan.weekId) {
      currentWeekId = week1Plan.weekId;
    } else {
      try {
        const storedPlan = JSON.parse(
          localStorage.getItem("studyPlan") || "null"
        );
        if (storedPlan && storedPlan.weekId) {
          currentWeekId = storedPlan.weekId;
        }
      } catch {
        currentWeekId = null;
      }
    }

    // 1) Try AI extraction
    let topics = null;
    try {
      topics = await extractTopicsWithAI(
        newDoubtSubject,
        newDoubtTopic,
        newDoubtNotes
      );
    } catch {
      topics = null;
    }

    // 2) If AI fails, fallback
    if (!topics || topics.length === 0) {
      topics = fallbackExtractTopics(
        newDoubtSubject,
        newDoubtTopic + " " + newDoubtNotes
      );
    }

    if (!topics || topics.length === 0) {
      topics = [newDoubtTopic.trim()];
    }

    // 3) Build YouTube + PDF links
    let youtubeLinks = [];
    try {
      youtubeLinks = await fetchYoutubeLinksForTopics(topics);
    } catch {
      youtubeLinks = [];
    }

    const pdfLinks = buildPdfUrlsForTopics(topics);

    const newDoubt = {
      id: Date.now(),
      subject: newDoubtSubject,
      topic: newDoubtTopic.trim(),
      notes: newDoubtNotes.trim(),
      status: newDoubtStatus,
      weekId: currentWeekId || null,
      createdAt: new Date().toISOString(),
      topics,
      resources: {
        youtube: youtubeLinks,
        pdf: pdfLinks
      }
    };

    const updated = [...doubts, newDoubt];
    setDoubts(updated);
    localStorage.setItem("doubts", JSON.stringify(updated));

    setNewDoubtSubject("");
    setNewDoubtTopic("");
    setNewDoubtNotes("");
    setNewDoubtStatus("unsolved");
    setIsGeneratingResources(false);
  };

  const handleChangeDoubtStatus = (id, status) => {
    const updated = doubts.map((d) =>
      d.id === id ? { ...d, status } : d
    );
    setDoubts(updated);
    localStorage.setItem("doubts", JSON.stringify(updated));
  };

  // Determine current week id for filtering doubts
  let currentWeekId = null;
  if (week1Plan && week1Plan.weekId) {
    currentWeekId = week1Plan.weekId;
  } else {
    try {
      const storedPlan = JSON.parse(
        localStorage.getItem("studyPlan") || "null"
      );
      if (storedPlan && storedPlan.weekId) {
        currentWeekId = storedPlan.weekId;
      }
    } catch {
      currentWeekId = null;
    }
  }

  const filteredDoubts = doubts.filter((d) => {
    const sameWeek = currentWeekId ? d.weekId === currentWeekId : true;
    const matchesFilter =
      doubtFilter === "all" ? true : d.status === doubtFilter;
    return sameWeek && matchesFilter;
  });

  // 🔹 Week 1 handlers

  const handleMoveSubject = (index, direction) => {
    setRankedSubjects((prev) => {
      const arr = [...prev];
      const newIdx = direction === "up" ? index - 1 : index + 1;
      if (newIdx < 0 || newIdx >= arr.length) return prev;
      [arr[index], arr[newIdx]] = [arr[newIdx], arr[index]];
      return arr;
    });
  };

  const handleDifficultyChange = (sub, level) => {
    setDifficultyLevels((prev) => ({
      ...prev,
      [sub]: level
    }));
  };

  const handleAddSubjectToPlan = () => {
    if (!subjectToAdd) return;
    if (!rankedSubjects.includes(subjectToAdd)) {
      setRankedSubjects((prev) => [...prev, subjectToAdd]);
      setDifficultyLevels((prev) => ({
        ...prev,
        [subjectToAdd]: prev[subjectToAdd] || "medium"
      }));
    }
    setSubjectToAdd("");
  };

  const handleRemoveSubject = (subject) => {
    setRankedSubjects((prev) => prev.filter((s) => s !== subject));
    setDifficultyLevels((prev) => {
      const copy = { ...prev };
      delete copy[subject];
      return copy;
    });
  };

  const handleSavePlan = () => {
    const days = parseInt(numDays, 10);
    const hours = parseFloat(hoursPerDay);

    if (!days || days <= 0 || !hours || hours <= 0) {
      alert("⚠ Enter valid days and hours per day!");
      return;
    }
    if (rankedSubjects.length === 0) {
      alert("⚠ Add at least one subject to the plan!");
      return;
    }

    const weights = computeWeightsFor(rankedSubjects, difficultyLevels);
    if (weights.every((w) => w.weight <= 0)) {
      alert("⚠ All weights are zero. Please adjust priorities/difficulties.");
      return;
    }

    // For Week 1 → max 6 days; if days < 6, just those days
    const week1DaysCount = days >= 6 ? 6 : days;
    const remaining = days > 6 ? days - 6 : 0;

    const dailySlots = buildDailySlots(weights, hours);
    const week1Days = Array.from({ length: week1DaysCount }).map((_, i) => ({
      dayNumber: i + 1,
      slots: dailySlots
    }));

    const weekId = new Date().toISOString().slice(0, 10);

    const newWeek1Plan = {
      rankedSubjects: [...rankedSubjects],
      difficultyLevels: { ...difficultyLevels },
      days: week1Days,
      weekId,
      createdAt: new Date().toISOString()
    };

    setWeek1Plan(newWeek1Plan);
    setWeek2Plan(null);
    setRemainingDays(remaining);
    setMotivation(getNextQuote());

    // Reset week2-related state
    setWeek2Selected([]);
    setWeek2RankedSubjects([]);
    setWeek2DifficultyLevels({});
    setShowWeek2Modal(false);

    // Save history
    const history = JSON.parse(localStorage.getItem("studyPlans") || "[]");
    history.push({ ...newWeek1Plan, phase: "week1" });
    localStorage.setItem("studyPlans", JSON.stringify(history));
    localStorage.setItem("studyPlan", JSON.stringify(newWeek1Plan));
  };

  // 🔹 Week 2 modal setup

  const openWeek2Modal = () => {
    if (!week1Plan || remainingDays <= 0) return;

    // Default Week 2 selection = all subjects from semester
    const initialSelected = [...semesterSubjects];

    const initDiff = {};
    initialSelected.forEach((sub) => {
      // Hint: use previous week difficulty if exists, else medium
      initDiff[sub] = difficultyLevels[sub] || "medium";
    });

    setWeek2Selected(initialSelected);
    setWeek2RankedSubjects(initialSelected);
    setWeek2DifficultyLevels(initDiff);
    setShowWeek2Modal(true);
  };

  const toggleWeek2Subject = (sub) => {
    setWeek2Selected((prev) => {
      const exists = prev.includes(sub);
      let updated;
      if (exists) {
        updated = prev.filter((s) => s !== sub);
      } else {
        updated = [...prev, sub];
      }

      // Sync ranked list
      setWeek2RankedSubjects((prevRanked) => {
        if (exists) {
          return prevRanked.filter((s) => s !== sub);
        } else {
          if (prevRanked.includes(sub)) return prevRanked;
          return [...prevRanked, sub];
        }
      });

      // Init difficulty if newly added
      if (!exists) {
        setWeek2DifficultyLevels((prevDiff) => ({
          ...prevDiff,
          [sub]: prevDiff[sub] || difficultyLevels[sub] || "medium"
        }));
      }

      return updated;
    });
  };

  const moveWeek2Subject = (index, direction) => {
    setWeek2RankedSubjects((prev) => {
      const arr = [...prev];
      const newIdx = direction === "up" ? index - 1 : index + 1;
      if (newIdx < 0 || newIdx >= arr.length) return prev;
      [arr[index], arr[newIdx]] = [arr[newIdx], arr[index]];
      return arr;
    });
  };

  const changeWeek2Difficulty = (sub, level) => {
    setWeek2DifficultyLevels((prev) => ({
      ...prev,
      [sub]: level
    }));
  };

  const handleGenerateWeek2 = () => {
    if (!week1Plan) return;
    if (remainingDays <= 0) return;

    const hours = parseFloat(hoursPerDay);
    if (!hours || hours <= 0) {
      alert("⚠ Enter valid hours per day before generating Week 2 plan.");
      return;
    }

    if (week2RankedSubjects.length === 0) {
      alert("⚠ Select at least one subject for Week 2.");
      return;
    }

    const weights = computeWeightsFor(
      week2RankedSubjects,
      week2DifficultyLevels
    );

    if (weights.every((w) => w.weight <= 0)) {
      alert("⚠ All Week 2 weights are zero. Please adjust priorities/difficulties.");
      return;
    }

    const dailySlots = buildDailySlots(weights, hours);
    const startDayNumber = week1Plan.days.length + 1;

    const days = Array.from({ length: remainingDays }).map((_, i) => ({
      dayNumber: startDayNumber + i,
      slots: dailySlots
    }));

    const newWeek2Plan = {
      rankedSubjects: [...week2RankedSubjects],
      difficultyLevels: { ...week2DifficultyLevels },
      days,
      createdAt: new Date().toISOString()
    };

    setWeek2Plan(newWeek2Plan);
    setShowWeek2Modal(false);

    const history = JSON.parse(localStorage.getItem("studyPlans") || "[]");
    history.push({ ...newWeek2Plan, phase: "week2" });
    localStorage.setItem("studyPlans", JSON.stringify(history));
  };

  const availableToAdd = semesterSubjects.filter(
    (sub) => !rankedSubjects.includes(sub)
  );

  // 🔹 NEW: helpers for checkbox keys + toggle
  const makeSlotKey = (planId, dayNumber, subject, suffix = "") => {
    const safePlan = planId || "plan";
    const safeSub = (subject || "").replace(/\s+/g, "_");
    return `${safePlan}-day${dayNumber}-${safeSub}${suffix}`;
  };

  const handleToggleSlotCheck = (slotKey) => {
    setSlotChecks((prev) => ({
      ...prev,
      [slotKey]: !prev[slotKey]
    }));
  };

  // Stats for "Progress" tab
  const totalDoubts = doubts.length;
  const unsolvedCount = doubts.filter((d) => d.status === "unsolved").length;
  const inProgressCount = doubts.filter((d) => d.status === "in-progress").length;
  const solvedCount = doubts.filter((d) => d.status === "solved").length;

  const totalSubjects = semesterSubjects.length;
  const completedCount = completedSubjects.length;
  const pendingCount = pendingSubjects.length;

  if (!profile) {
    return (
      <div className="page-container">
        <h2>Start Goals</h2>
        <p>⚠ Complete your profile first.</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2>Start Goals 🚀</h2>

      {/* Tab selector */}
      <div className="goals-tabs">
        <button
          className={`goals-tab ${activeTab === "plan" ? "goals-tab-active" : ""}`}
          onClick={() => setActiveTab("plan")}
        >
          🧠 Study Plan
        </button>
        <button
          className={`goals-tab ${activeTab === "doubts" ? "goals-tab-active" : ""}`}
          onClick={() => setActiveTab("doubts")}
        >
          ❓ Doubt Lab
        </button>
        <button
          className={`goals-tab ${activeTab === "stats" ? "goals-tab-active" : ""}`}
          onClick={() => setActiveTab("stats")}
        >
          📊 Progress
        </button>
      </div>

      {/* ====== TAB CONTENT ====== */}
      <div key={activeTab} className="tab-panel slide-panel">
        {activeTab === "plan" && (
          <>
            <h3>Pending Subjects</h3>
            {pendingSubjects.length === 0
              ? "🎉 All subjects completed!"
              : pendingSubjects.map((s) => <div key={s}>📌 {s}</div>)}

            <h3>Prioritize & Set Difficulty (Week 1)</h3>
            <div className="subject-select-row">
              <span>Select a subject to add:</span>
              <div className="subject-select-controls">
                <select
                  className="form-input"
                  value={subjectToAdd}
                  onChange={(e) => setSubjectToAdd(e.target.value)}
                >
                  <option value="">-- Choose --</option>
                  {availableToAdd.map((s) => (
                    <option key={s} value={s}>
                      {getSubjectLabel(s)}
                    </option>
                  ))}
                </select>
                <button className="small-btn" onClick={handleAddSubjectToPlan}>
                  Add ➕
                </button>
              </div>
            </div>

            {rankedSubjects.map((sub, idx) => (
              <div key={sub} className="rank-row">
                <span className="subject-name">
                  {idx + 1}. {sub}
                </span>

                {isCompleted(sub) && (
                  <span className="completed-badge">COMPLETED</span>
                )}

                <button
                  disabled={idx === 0}
                  onClick={() => handleMoveSubject(idx, "up")}
                >
                  ↑
                </button>
                <button
                  disabled={idx === rankedSubjects.length - 1}
                  onClick={() => handleMoveSubject(idx, "down")}
                >
                  ↓
                </button>

                <select
                  className="difficulty-select"
                  value={difficultyLevels[sub] || "medium"}
                  onChange={(e) => handleDifficultyChange(sub, e.target.value)}
                >
                  <option value="easy">easy</option>
                  <option value="medium">medium</option>
                  <option value="hard">hard</option>
                </select>

                <button
                  className="remove-btn"
                  onClick={() => handleRemoveSubject(sub)}
                >
                  ✕
                </button>
              </div>
            ))}

            <h3>How many days?</h3>
            <input
              type="number"
              className="form-input"
              value={numDays}
              onChange={(e) => setNumDays(e.target.value)}
            />

            <h3>Hours per day?</h3>
            <input
              type="number"
              className="form-input"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(e.target.value)}
            />

            <button className="save-btn" onClick={handleSavePlan}>
              Generate Plan 📌
            </button>

            {/* WEEK 1 PLAN */}
            {week1Plan && (
              <>
                <h3>📚 Week 1 Plan</h3>
                {week1Plan.days.map((day) => {
                  const planKey = week1Plan.weekId || "week1";
                  return (
                    <div key={day.dayNumber} className="day-plan-card">
                      <strong>Day {day.dayNumber}</strong>
                      {day.slots.map((slot, i) => {
                        const slotKey = makeSlotKey(
                          planKey,
                          day.dayNumber,
                          slot.subject,
                          "-w1"
                        );
                        const checked = !!slotChecks[slotKey];

                        return (
                          <div
                            key={i}
                            className={`plan-line-with-checkbox ${
                              isCompleted(slot.subject)
                                ? "completed-plan-line"
                                : "plan-line"
                            } ${checked ? "slot-checked" : ""}`}
                          >
                            {/* ✅ Checkbox on LEFT (Option 1) */}
                            <input
                              type="checkbox"
                              className="plan-slot-checkbox"
                              checked={checked}
                              onChange={() => handleToggleSlotCheck(slotKey)}
                            />
                            <span className="plan-slot-text">
                              ⏱ {slot.hours} hrs → {slot.subject}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}

                {/* Motivation + guidance */}
                <div className="motivation-block">
                  <p>
                    After you finish these {week1Plan.days.length} days, your
                    priorities and difficulty levels might change. We&apos;ll help
                    you build an even better plan for the remaining days based on
                    what you feel next week. All the best! 💪
                  </p>
                  {motivation && (
                    <p className="quote-text">“{motivation}”</p>
                  )}
                </div>
              </>
            )}

            {/* WEEK 2 BUTTON */}
            {week1Plan && remainingDays > 0 && (
              <button className="week2-btn" onClick={openWeek2Modal}>
                Plan Next {remainingDays} Day(s) ▶
              </button>
            )}

            {/* WEEK 2 MODAL */}
            {showWeek2Modal && (
              <div className="modal-backdrop">
                <div className="modal">
                  <h3>Plan Next {remainingDays} Day(s)</h3>
                  <p className="modal-text">
                    Select the subjects you want to focus on for the next{" "}
                    {remainingDays} day(s). You can set a fresh priority order and
                    difficulty levels specifically for this phase.
                  </p>

                  {/* Week 2 subject checklist */}
                  <div className="week2-section">
                    <h4>Select subjects for Week 2:</h4>
                    {semesterSubjects.map((sub) => {
                      const lastDiff = difficultyLevels[sub];
                      const usedInWeek1 = !!lastDiff;
                      return (
                        <label
                          key={sub}
                          className={`week2-checkbox-row ${
                            usedInWeek1 ? "week2-used-before" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={week2Selected.includes(sub)}
                            onChange={() => toggleWeek2Subject(sub)}
                          />
                          <span className="week2-subject-name">{sub}</span>
                          <span className="week2-hint">
                            {usedInWeek1
                              ? `Last week difficulty: ${lastDiff}`
                              : "Not in Week 1 plan"}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  {/* Week 2 priority & difficulty rows */}
                  {week2RankedSubjects.length > 0 && (
                    <>
                      <h4>Set Week 2 Priority & Difficulty</h4>
                      {week2RankedSubjects.map((sub, idx) => (
                        <div key={sub} className="rank-row week2-rank-row">
                          <span className="subject-name">
                            {idx + 1}. {sub}
                          </span>

                          {isCompleted(sub) && (
                            <span className="completed-badge">COMPLETED</span>
                          )}

                          <button
                            disabled={idx === 0}
                            onClick={() => moveWeek2Subject(idx, "up")}
                          >
                            ↑
                          </button>
                          <button
                            disabled={idx === week2RankedSubjects.length - 1}
                            onClick={() => moveWeek2Subject(idx, "down")}
                          >
                            ↓
                          </button>

                          <select
                            className="difficulty-select"
                            value={week2DifficultyLevels[sub] || "medium"}
                            onChange={(e) =>
                              changeWeek2Difficulty(sub, e.target.value)
                            }
                          >
                            <option value="easy">easy</option>
                            <option value="medium">medium</option>
                            <option value="hard">hard</option>
                          </select>
                        </div>
                      ))}
                    </>
                  )}

                  <div className="modal-actions">
                    <button
                      className="small-btn"
                      onClick={handleGenerateWeek2}
                      disabled={week2RankedSubjects.length === 0}
                    >
                      Generate Week 2 Plan ✅
                    </button>
                    <button
                      className="remove-btn"
                      onClick={() => setShowWeek2Modal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* WEEK 2 PLAN */}
            {week2Plan && (
              <>
                <h3>📚 Next Days Plan</h3>
                {week2Plan.days.map((day) => {
                  const planKey = week1Plan?.weekId
                    ? `${week1Plan.weekId}-week2`
                    : "week2";
                  return (
                    <div key={day.dayNumber} className="day-plan-card">
                      <strong>Day {day.dayNumber}</strong>
                      {day.slots.map((slot, i) => {
                        const slotKey = makeSlotKey(
                          planKey,
                          day.dayNumber,
                          slot.subject,
                          "-w2"
                        );
                        const checked = !!slotChecks[slotKey];

                        return (
                          <div
                            key={i}
                            className={`plan-line-with-checkbox ${
                              isCompleted(slot.subject)
                                ? "completed-plan-line"
                                : "plan-line"
                            } ${checked ? "slot-checked" : ""}`}
                          >
                            <input
                              type="checkbox"
                              className="plan-slot-checkbox"
                              checked={checked}
                              onChange={() => handleToggleSlotCheck(slotKey)}
                            />
                            <span className="plan-slot-text">
                              ⏱ {slot.hours} hrs → {slot.subject}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </>
            )}
          </>
        )}

        {activeTab === "doubts" && (
          <>
            <h3>Doubt Lab 💡</h3>
            {!week1Plan && (
              <p className="hint-text">
                Generate a weekly plan first so we can attach doubts to that week.
                You can still store doubts, but they won&apos;t be tied to a week.
              </p>
            )}

            {/* Add Doubt Form */}
            <div className="doubt-form">
              <div className="doubt-form-row">
                <label>Subject</label>
                <select
                  className="form-input"
                  value={newDoubtSubject}
                  onChange={(e) => setNewDoubtSubject(e.target.value)}
                >
                  <option value="">-- Choose subject --</option>
                  {semesterSubjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="doubt-form-row">
                <label>Main Topic</label>
                <input
                  className="form-input"
                  placeholder="Ex: Implicit differentiation, AVL rotations, ER diagrams..."
                  value={newDoubtTopic}
                  onChange={(e) => setNewDoubtTopic(e.target.value)}
                />
              </div>

              <div className="doubt-form-row">
                <label>Extra Notes (optional)</label>
                <textarea
                  className="form-input doubt-textarea"
                  rows={3}
                  placeholder="Explain what exactly is confusing. We use this to better understand your doubt."
                  value={newDoubtNotes}
                  onChange={(e) => setNewDoubtNotes(e.target.value)}
                />
              </div>

              <div className="doubt-form-bottom">
                <div>
                  <label>Status</label>
                  <select
                    className="form-input doubt-status-select"
                    value={newDoubtStatus}
                    onChange={(e) => setNewDoubtStatus(e.target.value)}
                  >
                    <option value="unsolved">Unsolved ❌</option>
                    <option value="in-progress">In Progress ⭕</option>
                    <option value="solved">Solved ✅</option>
                  </select>
                </div>

                <button
                  className="small-btn"
                  onClick={handleAddDoubt}
                  disabled={isGeneratingResources}
                >
                  {isGeneratingResources
                    ? "Finding Resources..."
                    : "Save Doubt & Get Links 🔗"}
                </button>
              </div>
            </div>

            {/* Filter buttons for doubts */}
            <div className="doubt-filter-row">
              <span>Filter:</span>
              <button
                className={`chip-btn ${
                  doubtFilter === "all" ? "chip-active" : ""
                }`}
                onClick={() => setDoubtFilter("all")}
              >
                All
              </button>
              <button
                className={`chip-btn ${
                  doubtFilter === "unsolved" ? "chip-active" : ""
                }`}
                onClick={() => setDoubtFilter("unsolved")}
              >
                Unsolved ❌
              </button>
              <button
                className={`chip-btn ${
                  doubtFilter === "in-progress" ? "chip-active" : ""
                }`}
                onClick={() => setDoubtFilter("in-progress")}
              >
                In Progress ⭕
              </button>
              <button
                className={`chip-btn ${
                  doubtFilter === "solved" ? "chip-active" : ""
                }`}
                onClick={() => setDoubtFilter("solved")}
              >
                Solved ✅
              </button>
            </div>

            {/* Doubt list */}
            <div className="doubt-list">
              {filteredDoubts.length === 0 ? (
                <p className="empty-text">
                  No doubts saved for this filter yet. When you get stuck while
                  following your plan, come back here and log it. 🙂
                </p>
              ) : (
                filteredDoubts.map((doubt) => (
                  <div key={doubt.id} className="doubt-card">
                    <div className="doubt-card-header">
                      <span className="doubt-subject">
                        {doubt.subject} — {doubt.topic}
                      </span>
                      <select
                        className="doubt-status-select"
                        value={doubt.status}
                        onChange={(e) =>
                          handleChangeDoubtStatus(doubt.id, e.target.value)
                        }
                      >
                        <option value="unsolved">Unsolved ❌</option>
                        <option value="in-progress">In Progress ⭕</option>
                        <option value="solved">Solved ✅</option>
                      </select>
                    </div>
                    {doubt.notes && (
                      <p className="doubt-text">{doubt.notes}</p>
                    )}

                    {doubt.topics && doubt.topics.length > 0 && (
                      <p className="doubt-topics-line">
                        🔍 Topics understood:{" "}
                        {doubt.topics.join(" • ")}
                      </p>
                    )}

                    <div className="doubt-links">
                      {Array.isArray(doubt.resources?.youtube) &&
                        doubt.resources.youtube.map((url, idx) => (
                          <a
                            key={`yt-${idx}`}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            🎥 YouTube {idx + 1}
                          </a>
                        ))}
                      {Array.isArray(doubt.resources?.pdf) &&
                        doubt.resources.pdf.map((url, idx) => (
                          <a
                            key={`pdf-${idx}`}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            📄 Notes {idx + 1}
                          </a>
                        ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === "stats" && (
          <>
            <h3>Progress Overview 📊</h3>
            <div className="stats-grid-goals">
              <div className="stat-card-goals">
                <div className="stat-label">Total Doubts Logged</div>
                <div className="stat-value">{totalDoubts}</div>
              </div>
              <div className="stat-card-goals">
                <div className="stat-label">Unsolved</div>
                <div className="stat-value">{unsolvedCount}</div>
              </div>
              <div className="stat-card-goals">
                <div className="stat-label">In Progress</div>
                <div className="stat-value">{inProgressCount}</div>
              </div>
              <div className="stat-card-goals">
                <div className="stat-label">Solved</div>
                <div className="stat-value">{solvedCount}</div>
              </div>
            </div>

            <h3>Subjects Progress</h3>
            <div className="stats-grid-goals">
              <div className="stat-card-goals">
                <div className="stat-label">Total Semester Subjects</div>
                <div className="stat-value">{totalSubjects}</div>
              </div>
              <div className="stat-card-goals">
                <div className="stat-label">Completed</div>
                <div className="stat-value">{completedCount}</div>
              </div>
              <div className="stat-card-goals">
                <div className="stat-label">Pending</div>
                <div className="stat-value">{pendingCount}</div>
              </div>
            </div>

            <p className="hint-text">
              Every solved doubt and completed subject makes your next week easier.
              Keep logging doubts and crushing them one by one. 🔥
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default StartGoals;
