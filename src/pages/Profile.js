import React, { useContext, useState, useMemo, useEffect } from "react";
import { SyllabusContext } from "../App";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const syllabusData = useContext(SyllabusContext);
  const navigate = useNavigate();

  const streams = Object.keys(syllabusData);

  const [stream, setStream] = useState("");
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [completedSubjects, setCompletedSubjects] = useState([]);

  const [languageInput, setLanguageInput] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [focus, setFocus] = useState("");

  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "history"

  // History data
  const [savedProfile, setSavedProfile] = useState(null);
  const [studyPlansHistory, setStudyPlansHistory] = useState([]);
  const [doubtsHistory, setDoubtsHistory] = useState([]);

  const selectedStream = syllabusData[stream];
  const selectedYearData = selectedStream?.years[year] || null;
  const selectedSemData = selectedYearData?.[semester] || null;

  // 🔹 Language list for autocomplete
  const languageList = [
    "C",
    "C++",
    "C#",
    "Python",
    "Java",
    "JavaScript",
    "HTML",
    "CSS",
    "SQL",
    "PHP",
    "Swift",
    "Kotlin",
    "Dart",
    "Go",
    "Rust",
    "R",
    "TypeScript",
    "MATLAB",
    "Scala",
    "Ruby",
    "Perl",
    "Firebase",
  ];

  // 🔹 Load profile + history from localStorage on mount
  useEffect(() => {
    try {
      const storedProfile = JSON.parse(localStorage.getItem("profileData") || "null");
      if (storedProfile) {
        setSavedProfile(storedProfile);
        setStream(storedProfile.stream || "");
        setYear(storedProfile.year || "");
        setSemester(storedProfile.semester || "");
        setCompletedSubjects(storedProfile.completedSubjects || []);
        setSelectedLanguages(storedProfile.languages || []);
        setFocus(storedProfile.focusArea || "");
      }

      const storedPlans = JSON.parse(localStorage.getItem("studyPlans") || "[]");
      setStudyPlansHistory(Array.isArray(storedPlans) ? storedPlans : []);

      const storedDoubts = JSON.parse(localStorage.getItem("doubtsData") || "[]");
      setDoubtsHistory(Array.isArray(storedDoubts) ? storedDoubts : []);
    } catch {
      // ignore parse errors
    }
  }, []);

  const handleSubjectToggle = (subject) => {
    setCompletedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  };

  const handleAddLanguage = (lang) => {
    if (!selectedLanguages.includes(lang)) {
      setSelectedLanguages((prev) => [...prev, lang]);
    }
    setLanguageInput("");
  };

  const handleRemoveLanguage = (lang) => {
    setSelectedLanguages((prev) => prev.filter((item) => item !== lang));
  };

  // 🔥 Smart Focus Area Logic (dynamic)
  const focusOptions = useMemo(() => {
    let options = [];

    // General options for all streams
    options.push("Exam Preparation");
    options.push("Concept Strengthening");

    // Add based on subjects selected
    if (
      completedSubjects.some(
        (s) =>
          s.toLowerCase().includes("math") ||
          s.toLowerCase().includes("calculus")
      )
    ) {
      options.push("Mathematics Mastery");
    }

    if (
      completedSubjects.some((s) => s.toLowerCase().includes("physics"))
    ) {
      options.push("Physics Understanding");
    }

    if (
      completedSubjects.some((s) => s.toLowerCase().includes("graphics"))
    ) {
      options.push("Engineering Graphics Practice");
    }

    if (
      completedSubjects.some((s) =>
        s.toLowerCase().includes("communication")
      )
    ) {
      options.push("Communication Skill Improvement");
    }

    // Based on programming learning level
    const knowsProgramming = selectedLanguages.length > 0;

    if (knowsProgramming) {
      options.push("Basic Programming Improvement");
      options.push("Problem Solving (Coding)");

      if (
        selectedLanguages.includes("C") ||
        selectedLanguages.includes("C++")
      ) {
        options.push("DSA (Data Structures Basics)");
      }

      if (
        selectedLanguages.includes("Python") ||
        selectedLanguages.includes("JavaScript")
      ) {
        options.push("Mini Project Building");
      }
    }

    // Remove duplicates
    return [...new Set(options)];
  }, [completedSubjects, selectedLanguages]);

  const handleSaveProfile = () => {
    if (!stream || !year || !semester || !focus) {
      alert("⚠ Please complete all required fields!");
      return;
    }

    const profileInfo = {
      stream,
      year,
      semester,
      completedSubjects,
      languages: selectedLanguages,
      focusArea: focus,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem("profileData", JSON.stringify(profileInfo));
    setSavedProfile(profileInfo);
    alert("🎯 Profile Saved Successfully!");
    navigate("/");
  };

  // ------- HISTORY COMPUTATIONS -------

  const totalSubjects = selectedSemData?.subjects?.length || 0;
  const completedCount = completedSubjects.length;
  const completionPercent =
    totalSubjects === 0 ? 0 : Math.round((completedCount / totalSubjects) * 100);

  const totalPlans = studyPlansHistory.length;
  const lastPlan =
    totalPlans > 0 ? studyPlansHistory[totalPlans - 1] : null;
  const lastPlanDays = lastPlan?.days?.length || 0;
  const lastPlanCreatedAt = lastPlan?.createdAt || null;

  const totalDoubts = doubtsHistory.length;
  const solvedDoubts = doubtsHistory.filter((d) => d.status === "solved").length;
  const inProgressDoubts = doubtsHistory.filter(
    (d) => d.status === "in-progress"
  ).length;
  const unsolvedDoubts = doubtsHistory.filter(
    (d) => d.status === "unsolved" || !d.status
  ).length;
  const doubtResolutionPercent =
    totalDoubts === 0
      ? 0
      : Math.round((solvedDoubts / totalDoubts) * 100);

  const formatDate = (iso) => {
    if (!iso) return "-";
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <div className="page-container profile-page">
      <h2 className="profile-title">User Profile</h2>

      {/* Tabs */}
      <div className="profile-tabs">
        <button
          className={`profile-tab-btn ${
            activeTab === "profile" ? "active" : ""
          }`}
          onClick={() => setActiveTab("profile")}
        >
          Profile Info
        </button>
        <button
          className={`profile-tab-btn ${
            activeTab === "history" ? "active" : ""
          }`}
          onClick={() => setActiveTab("history")}
        >
          Study & Doubt History
        </button>
      </div>

      {/* ------------ PROFILE TAB ------------ */}
      {activeTab === "profile" && (
        <div className="profile-form">
          {/* Stream */}
          <label className="form-label">Select Stream *</label>
          <select
            className="form-input"
            value={stream}
            onChange={(e) => {
              setStream(e.target.value);
              setYear("");
              setSemester("");
              setCompletedSubjects([]);
              setSelectedLanguages([]);
              setFocus("");
            }}
          >
            <option value="">Choose branch</option>
            {streams.map((s) => (
              <option key={s} value={s}>
                {syllabusData[s].name}
              </option>
            ))}
          </select>

          {/* Year */}
          {stream && (
            <>
              <label className="form-label">Select Year *</label>
              <select
                className="form-input"
                value={year}
                onChange={(e) => {
                  setYear(e.target.value);
                  setSemester("");
                  setCompletedSubjects([]);
                  setSelectedLanguages([]);
                  setFocus("");
                }}
              >
                <option value="">Choose year</option>
                {[1, 2, 3].map((y) => (
                  <option key={y} value={y}>
                    Year {y}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* Semester */}
          {year && selectedStream && (
            <>
              <label className="form-label">Select Semester *</label>
              <select
                className="form-input"
                value={semester}
                onChange={(e) => {
                  setSemester(e.target.value);
                  setCompletedSubjects([]);
                  setSelectedLanguages([]);
                  setFocus("");
                }}
              >
                <option value="">Choose semester</option>
                {Object.keys(selectedStream.years[year]).map((sem) => (
                  <option key={sem} value={sem}>
                    {selectedStream.years[year][sem].label}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* Completed Subjects */}
          {semester && selectedSemData?.subjects && (
            <div className="subjects-container">
              <label className="form-label">Completed Subjects</label>
              {selectedSemData.subjects.map((sub) => (
                <div key={sub} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={completedSubjects.includes(sub)}
                    onChange={() => handleSubjectToggle(sub)}
                  />
                  {sub}
                </div>
              ))}
            </div>
          )}

          {/* Coding Languages Autocomplete */}
          <label className="form-label">Coding Languages Learned</label>
          <input
            type="text"
            className="form-input"
            placeholder="Start typing..."
            value={languageInput}
            onChange={(e) => setLanguageInput(e.target.value)}
          />

          {languageInput.length > 0 && (
            <ul className="autocomplete-suggestions">
              {languageList
                .filter(
                  (lang) =>
                    lang
                      .toLowerCase()
                      .startsWith(languageInput.toLowerCase()) &&
                    !selectedLanguages.includes(lang)
                )
                .map((lang) => (
                  <li
                    key={lang}
                    className="suggestion-item"
                    onClick={() => handleAddLanguage(lang)}
                  >
                    {lang}
                  </li>
                ))}
            </ul>
          )}

          {/* Selected Languages */}
          <div className="selected-languages">
            {selectedLanguages.map((lang) => (
              <span key={lang} className="lang-chip">
                {lang}
                <button
                  className="remove-chip"
                  onClick={() => handleRemoveLanguage(lang)}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          {/* Focus Area */}
          {semester && (
            <>
              <label className="form-label">Focus Area *</label>
              <select
                className="form-input"
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
              >
                <option value="">Select focus area</option>
                {focusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </>
          )}

          <button className="save-btn" onClick={handleSaveProfile}>
            Save Profile ✔
          </button>
        </div>
      )}

      {/* ------------ HISTORY TAB ------------ */}
      {activeTab === "history" && (
        <div className="profile-history">

          {/* Top stats */}
          <div className="history-grid">
            <div className="history-card">
              <h3 className="history-title">Academic Snapshot</h3>
              {savedProfile ? (
                <>
                  <p className="history-line">
                    <span className="label">Branch:</span>{" "}
                    {syllabusData[savedProfile.stream]?.name ||
                      savedProfile.stream}
                  </p>
                  <p className="history-line">
                    <span className="label">Year / Sem:</span>{" "}
                    Year {savedProfile.year},{" "}
                    {syllabusData[savedProfile.stream]?.years?.[
                      savedProfile.year
                    ]?.[savedProfile.semester]?.label ||
                      savedProfile.semester}
                  </p>
                  <p className="history-line">
                    <span className="label">Focus:</span>{" "}
                    {savedProfile.focusArea || "-"}
                  </p>

                  <div className="progress-block">
                    <span className="label">
                      Subjects Completed ({completedCount}/{totalSubjects})
                    </span>
                    <div className="progress-bar history">
                      <div
                        className="progress-fill history"
                        style={{ width: `${completionPercent}%` }}
                      />
                    </div>
                    <span className="progress-percent">
                      {completionPercent}% done
                    </span>
                  </div>
                  <p className="history-mini">
                    Last updated: {formatDate(savedProfile.updatedAt)}
                  </p>
                </>
              ) : (
                <p className="history-empty">
                  No profile saved yet. Fill your profile in the first tab.
                </p>
              )}
            </div>

            <div className="history-card">
              <h3 className="history-title">Study Plan Overview</h3>
              <p className="history-line">
                <span className="label">Plans Created:</span> {totalPlans}
              </p>
              <p className="history-line">
                <span className="label">Days in Last Plan:</span>{" "}
                {lastPlanDays}
              </p>
              <p className="history-line">
                <span className="label">Last Plan:</span>{" "}
                {formatDate(lastPlanCreatedAt)}
              </p>
              {totalPlans === 0 && (
                <p className="history-empty">
                  No study plans yet. Create one in Start Goals.
                </p>
              )}
            </div>

            <div className="history-card">
              <h3 className="history-title">Doubt Lab Summary</h3>
              <p className="history-line">
                <span className="label">Total Doubts:</span> {totalDoubts}
              </p>
              <p className="history-line">
                <span className="label">Solved:</span> {solvedDoubts}
              </p>
              <p className="history-line">
                <span className="label">In Progress:</span> {inProgressDoubts}
              </p>
              <p className="history-line">
                <span className="label">Unsolved:</span> {unsolvedDoubts}
              </p>

              <div className="progress-block">
                <span className="label">
                  Doubt Resolution ({doubtResolutionPercent}%)
                </span>
                <div className="progress-bar doubt">
                  <div
                    className="progress-fill doubt"
                    style={{ width: `${doubtResolutionPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Study Plans history list */}
          <div className="history-section">
            <h3 className="history-subheading">Study Plans History</h3>
            {totalPlans === 0 ? (
              <p className="history-empty">
                You haven&apos;t generated any study plans yet.
              </p>
            ) : (
              <div className="plans-list">
                {studyPlansHistory.map((plan, idx) => (
                  <details key={idx} className="plan-details">
                    <summary>
                      <span>
                        Plan #{idx + 1} • {plan.days?.length || 0} days •{" "}
                        {formatDate(plan.createdAt)}
                      </span>
                    </summary>
                    <div className="plan-content">
                      {plan.days?.map((day) => (
                        <div key={day.dayNumber} className="plan-day-card">
                          <strong>Day {day.dayNumber}</strong>
                          {day.slots?.map((slot, i) => (
                            <div key={i} className="plan-slot-line">
                              ⏱ {slot.hours} hrs → {slot.subject}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            )}
          </div>

          {/* Doubts history list */}
          <div className="history-section">
            <h3 className="history-subheading">Recent Doubts</h3>
            {totalDoubts === 0 ? (
              <p className="history-empty">
                No doubts logged yet. Use the Doubt Lab tab to add them.
              </p>
            ) : (
              <div className="doubts-history-list">
                {doubtsHistory.slice(0, 8).map((d) => (
                  <div key={d.id} className="doubt-history-card">
                    <p className="doubt-history-text">{d.text}</p>
                    <div className="doubt-history-meta">
                      <span
                        className={`status-pill status-${d.status || "unsolved"}`}
                      >
                        {d.status || "unsolved"}
                      </span>
                      <span className="doubt-date">
                        {formatDate(d.createdAt)}
                      </span>
                    </div>
                    {d.topics && d.topics.length > 0 && (
                      <div className="doubt-topics-row">
                        {d.topics.map((t) => (
                          <span key={t} className="topic-chip">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
