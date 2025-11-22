// src/pages/Questionnaire.js  (or src/components if you prefer)

import React, { useState } from "react";
import "./Questionnaire.css";

/* ============================================================
   TOPIC QUESTION BANK + HELPERS (EXTERNAL SOURCE STYLE)
   ============================================================ */

const topicBank = {
  dsa: [
    {
      question:
        "What is the time complexity of inserting a node at the beginning of a singly linked list?",
      keywords: ["o(1)", "constant"],
    },
    {
      question: "Explain the difference between a stack and a queue.",
      keywords: ["lifo", "fifo", "last in", "first out"],
    },
    {
      question: "Give one real-world example that can be modeled as a stack.",
      keywords: ["undo", "browser", "plates", "stack"],
    },
    {
      question: "What is a binary search tree and how is it different from a normal binary tree?",
      keywords: ["bst", "left", "right", "ordered", "sorted"],
    },
  ],
  algorithms: [
    {
      question: "What is the time complexity of binary search and why?",
      keywords: ["o(log n)", "log", "divide"],
    },
    {
      question:
        "Name any two sorting algorithms and their average time complexity.",
      keywords: ["merge", "quick", "n log n"],
    },
    {
      question: "What is the difference between brute force and greedy approach?",
      keywords: ["optimal", "locally", "global", "choice"],
    },
  ],
  oop: [
    {
      question: "Explain the four pillars of object-oriented programming.",
      keywords: ["encapsulation", "inheritance", "polymorphism", "abstraction"],
    },
    {
      question: "What is the difference between a class and an object?",
      keywords: ["blueprint", "instance"],
    },
    {
      question: "What is polymorphism? Give an example.",
      keywords: ["overloading", "overriding", "same", "different"],
    },
  ],
  os: [
    {
      question: "What is the difference between a process and a thread?",
      keywords: ["lightweight", "independent", "resources", "stack"],
    },
    {
      question: "What is deadlock? Mention any one condition required for deadlock.",
      keywords: ["mutual exclusion", "hold and wait", "no preemption", "circular wait"],
    },
    {
      question: "Explain round-robin scheduling in one or two lines.",
      keywords: ["time quantum", "time slice", "preemptive"],
    },
  ],
  cn: [
    {
      question: "What is the difference between TCP and UDP?",
      keywords: ["connection", "reliable", "unreliable", "stream", "datagram"],
    },
    {
      question: "What is an IP address?",
      keywords: ["logical", "address", "network", "host"],
    },
    {
      question: "Explain what a router does in a network.",
      keywords: ["forward", "packets", "different networks", "routing"],
    },
  ],
  dbms: [
    {
      question: "What is normalization and why is it used?",
      keywords: ["redundancy", "anomaly", "normal form"],
    },
    {
      question: "What is the difference between primary key and foreign key?",
      keywords: ["unique", "reference", "referential"],
    },
    {
      question: "What is a join? Name any two types.",
      keywords: ["inner", "outer", "left", "right"],
    },
  ],
  web: [
    {
      question: "What is the difference between HTML, CSS, and JavaScript?",
      keywords: ["structure", "style", "behavior", "dynamic"],
    },
    {
      question: "What is responsive design?",
      keywords: ["mobile", "screen", "resize", "flexible"],
    },
    {
      question: "Explain the purpose of a REST API in web development.",
      keywords: ["http", "client", "server", "resource"],
    },
  ],
  ai_ml: [
    {
      question: "What is the difference between supervised and unsupervised learning?",
      keywords: ["labelled", "unlabelled", "output"],
    },
    {
      question: "What is overfitting in a machine learning model?",
      keywords: ["train", "test", "memorize", "generalize"],
    },
    {
      question: "What is a dataset feature? Give an example.",
      keywords: ["attribute", "column", "input"],
    },
  ],
  software_eng: [
    {
      question: "What is the purpose of the software development life cycle (SDLC)?",
      keywords: ["phases", "requirement", "design", "testing"],
    },
    {
      question: "Explain the difference between functional and non-functional requirements.",
      keywords: ["behavior", "performance", "security", "usability"],
    },
    {
      question: "What is version control and why is it important?",
      keywords: ["git", "track", "changes", "collaboration"],
    },
  ],
  electronics: [
    {
      question: "What is a PN junction diode?",
      keywords: ["p-type", "n-type", "junction"],
    },
    {
      question: "Explain forward bias and reverse bias of a diode.",
      keywords: ["low resistance", "high resistance", "barrier"],
    },
    {
      question: "What is the role of a rectifier circuit?",
      keywords: ["ac to dc", "convert", "rectify"],
    },
  ],
  digital: [
    {
      question: "What is the difference between combinational and sequential circuits?",
      keywords: ["memory", "previous state"],
    },
    {
      question: "What is a flip-flop used for?",
      keywords: ["store", "bit", "memory"],
    },
    {
      question: "Explain De Morgan’s theorem in one line.",
      keywords: ["and", "or", "complement"],
    },
  ],
  signals: [
    {
      question: "What is the difference between analog and digital signals?",
      keywords: ["continuous", "discrete"],
    },
    {
      question: "What is sampling in signal processing?",
      keywords: ["discrete", "interval", "sample"],
    },
    {
      question: "Define signal-to-noise ratio (SNR).",
      keywords: ["power", "noise", "ratio"],
    },
  ],
  microcontrollers: [
    {
      question: "What is a microcontroller and how is it different from a microprocessor?",
      keywords: ["on-chip", "peripherals", "single chip"],
    },
    {
      question: "Name any two common applications of microcontrollers.",
      keywords: ["embedded", "control", "automation"],
    },
    {
      question: "What is the role of timers in microcontroller applications?",
      keywords: ["delay", "counter", "timing"],
    },
  ],
  thermo: [
    {
      question: "State the first law of thermodynamics in simple words.",
      keywords: ["energy", "conservation", "heat", "work"],
    },
    {
      question: "What is the difference between heat and temperature?",
      keywords: ["energy", "measure", "degree"],
    },
    {
      question: "Define entropy in one line.",
      keywords: ["disorder", "randomness"],
    },
  ],
  fluid: [
    {
      question: "What is fluid viscosity?",
      keywords: ["resistance", "flow", "internal friction"],
    },
    {
      question: "What is Bernoulli’s equation used for?",
      keywords: ["energy", "pressure", "velocity", "flow"],
    },
    {
      question: "Define laminar and turbulent flow.",
      keywords: ["smooth", "chaotic", "reynolds"],
    },
  ],
  som: [
    {
      question: "What is stress and strain?",
      keywords: ["force", "area", "deformation", "ratio"],
    },
    {
      question: "What is Young’s modulus?",
      keywords: ["modulus", "elasticity", "stress", "strain"],
    },
    {
      question: "Explain the concept of factor of safety.",
      keywords: ["maximum", "load", "failure"],
    },
  ],
  structural: [
    {
      question: "What is the difference between beam, column, and slab?",
      keywords: ["compression", "bending", "flexural"],
    },
    {
      question: "What is reinforced concrete and why is steel used?",
      keywords: ["tension", "compressive", "rebar"],
    },
    {
      question: "Define simply supported beam.",
      keywords: ["support", "end", "pinned", "roller"],
    },
  ],
  calculus: [
    {
      question: "What is a derivative in simple terms?",
      keywords: ["rate", "change", "slope"],
    },
    {
      question: "What is the integral used for?",
      keywords: ["area", "accumulation"],
    },
    {
      question: "State the relationship between differentiation and integration.",
      keywords: ["inverse", "fundamental theorem"],
    },
  ],
  linear_algebra: [
    {
      question: "What is a matrix?",
      keywords: ["rows", "columns", "array"],
    },
    {
      question: "What is the determinant of a matrix used for?",
      keywords: ["invertible", "area", "volume"],
    },
    {
      question: "Define eigenvalue in one line.",
      keywords: ["scalar", "vector", "direction"],
    },
  ],
  probability: [
    {
      question: "What is a random variable?",
      keywords: ["takes values", "outcome"],
    },
    {
      question: "What is the difference between probability and probability density?",
      keywords: ["discrete", "continuous"],
    },
    {
      question: "What is expected value?",
      keywords: ["mean", "average", "weighted"],
    },
  ],
  physics: [
    {
      question: "State Newton’s second law of motion in simple words.",
      keywords: ["force", "mass", "acceleration"],
    },
    {
      question: "What is the difference between speed and velocity?",
      keywords: ["direction", "scalar", "vector"],
    },
    {
      question: "What is work done?",
      keywords: ["force", "displacement"],
    },
  ],
  chemistry: [
    {
      question: "What is a mole in chemistry?",
      keywords: ["6.022", "avogadro"],
    },
    {
      question: "What is the difference between ionic and covalent bond?",
      keywords: ["transfer", "sharing", "electrons"],
    },
    {
      question: "Define pH and what it indicates.",
      keywords: ["acidic", "basic", "hydrogen"],
    },
  ],
};

const detectPrimaryTopic = (text, manualSubject) => {
  if (manualSubject && topicBank[manualSubject]) return manualSubject;

  const t = (text || "").toLowerCase();

  if (
    t.includes("dsa") ||
    t.includes("data structure") ||
    t.includes("linked list") ||
    t.includes("stack") ||
    t.includes("queue") ||
    t.includes("tree") ||
    t.includes("graph")
  )
    return "dsa";

  if (t.includes("algorithm") || t.includes("sorting") || t.includes("searching"))
    return "algorithms";

  if (
    t.includes("oop") ||
    t.includes("object oriented") ||
    t.includes("class") ||
    t.includes("inheritance")
  )
    return "oop";

  if (
    t.includes("os") ||
    t.includes("operating system") ||
    t.includes("process") ||
    t.includes("thread") ||
    t.includes("deadlock")
  )
    return "os";

  if (
    t.includes("computer network") ||
    t.includes("networking") ||
    t.includes("tcp") ||
    t.includes("udp") ||
    t.includes("ip address")
  )
    return "cn";

  if (
    t.includes("dbms") ||
    t.includes("database") ||
    t.includes("sql") ||
    t.includes("normalization")
  )
    return "dbms";

  if (
    t.includes("html") ||
    t.includes("css") ||
    t.includes("javascript") ||
    t.includes("web development")
  )
    return "web";

  if (t.includes("ai") || t.includes("ml") || t.includes("machine learning"))
    return "ai_ml";

  if (
    t.includes("software engineering") ||
    t.includes("sdlc") ||
    t.includes("requirements")
  )
    return "software_eng";

  if (t.includes("electronics") || t.includes("diode") || t.includes("transistor"))
    return "electronics";

  if (
    t.includes("logic gate") ||
    t.includes("flip-flop") ||
    t.includes("digital electronics")
  )
    return "digital";

  if (
    t.includes("signal") ||
    t.includes("sampling") ||
    t.includes("snr") ||
    t.includes("fourier")
  )
    return "signals";

  if (
    t.includes("microcontroller") ||
    t.includes("embedded") ||
    t.includes("8051") ||
    t.includes("arduino")
  )
    return "microcontrollers";

  if (t.includes("thermodynamics") || t.includes("entropy")) return "thermo";

  if (
    t.includes("fluid mechanics") ||
    t.includes("bernoulli") ||
    t.includes("laminar") ||
    t.includes("turbulent")
  )
    return "fluid";

  if (
    t.includes("strength of materials") ||
    t.includes("som") ||
    t.includes("stress") ||
    t.includes("strain")
  )
    return "som";

  if (
    t.includes("structural") ||
    t.includes("rc structure") ||
    t.includes("beam") ||
    t.includes("column")
  )
    return "structural";

  if (
    t.includes("calculus") ||
    t.includes("derivative") ||
    t.includes("integral")
  )
    return "calculus";

  if (
    t.includes("linear algebra") ||
    t.includes("matrix") ||
    t.includes("eigen")
  )
    return "linear_algebra";

  if (
    t.includes("probability") ||
    t.includes("random variable") ||
    t.includes("statistics")
  )
    return "probability";

  if (t.includes("physics") || t.includes("kinematics") || t.includes("newton"))
    return "physics";

  if (t.includes("chemistry") || t.includes("bond") || t.includes("mole") || t.includes("ph"))
    return "chemistry";

  return null;
};

const buildQuizQuestions = (studiedToday, quizQuestionCount, manualSubject) => {
  const topicKey = detectPrimaryTopic(studiedToday, manualSubject);
  if (!topicKey || !topicBank[topicKey]) return [];

  const all = topicBank[topicKey];
  const count = Math.min(Math.max(quizQuestionCount, 1), all.length);

  return all.slice(0, count).map((qObj, index) => ({
    id: `quiz_${index + 1}`,
    ...qObj,
  }));
};

const evaluateQuiz = (quizQuestions, quizAnswers) => {
  if (!quizQuestions || quizQuestions.length === 0) return null;

  let correctCount = 0;
  const details = quizQuestions.map((q) => {
    const userAnswer = (quizAnswers[q.id] || "").toLowerCase();
    let isCorrect = false;

    if (q.keywords && q.keywords.length > 0) {
      isCorrect = q.keywords.some((kw) =>
        userAnswer.includes(kw.toLowerCase())
      );
    }

    if (isCorrect) correctCount += 1;

    const feedback = isCorrect
      ? "✅ Good! Your answer touches the key idea for this question."
      : "❌ Your answer is missing some important keywords. Revisit this concept and try again.";

    return {
      question: q.question,
      userAnswer: quizAnswers[q.id] || "",
      isCorrect,
      feedback,
    };
  });

  const total = quizQuestions.length;
  const percentage = Math.round((correctCount / total) * 100);

  return {
    totalQuestions: total,
    correctCount,
    percentage,
    details,
  };
};

/* ============================================================
   ORIGINAL COMPONENT + APPENDED QUIZ LOGIC
   ============================================================ */

const Questionnaire = ({ onSubmitResponses }) => {
  const [studiedToday, setStudiedToday] = useState("");
  const [answers, setAnswers] = useState({
    summary: "",
    keyConcept: "",
    understandingLevel: "3",
    doubts: "",
    selfQuestion: "",
  });

  const [numberOfQuestions, setNumberOfQuestions] = useState(5); // how many reflection questions to show (1–5)
  const [report, setReport] = useState(null);

  // 🔹 NEW: quiz-related state (APPENDED, does not change old state)
  const [quizQuestionCount, setQuizQuestionCount] = useState(3);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [manualSubject, setManualSubject] = useState("");

  const questions = [
    {
      id: "summary",
      label: "1. In your own words, summarize what you studied today.",
      placeholder:
        "E.g. I revised PN junction diodes and learned about biasing...",
    },
    {
      id: "keyConcept",
      label:
        "2. From what you studied today, what is one key concept you understood well?",
      placeholder: "E.g. Forward bias and reverse bias behaviour...",
    },
    {
      id: "understandingLevel",
      label: "3. How confident do you feel about today’s topic?",
      type: "scale",
      helpText: "1 = Very low, 5 = Very high",
    },
    {
      id: "doubts",
      label:
        "4. What doubts or confusing areas do you still have from what you studied today?",
      placeholder: "E.g. I’m still confused about the VI characteristics...",
    },
    {
      id: "selfQuestion",
      label:
        "5. Write one question about today’s topic that a teacher could ask you.",
      placeholder: "E.g. Explain the working of a full-wave rectifier.",
    },
  ];

  const handleAnswerChange = (id, value) => {
    setAnswers((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleNumberOfQuestionsChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value)) {
      setNumberOfQuestions(1);
    } else {
      // clamp between 1 and total questions
      const clamped = Math.min(Math.max(value, 1), questions.length);
      setNumberOfQuestions(clamped);
    }
  };

  // 🔹 NEW: quiz handlers (APPENDED)
  const handleQuizQuestionCountChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value)) {
      setQuizQuestionCount(1);
    } else {
      const clamped = Math.min(Math.max(value, 1), 5);
      setQuizQuestionCount(clamped);
    }
  };

  const handleQuizAnswerChange = (id, value) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Helper: check if an answer seems related to what the user studied
  const getTopicAlignmentFeedback = (answer, studiedTopic, label) => {
    const clean = (str) =>
      (str || "")
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 3);

    const topicWords = clean(studiedTopic);
    const answerWords = clean(answer);

    if (!studiedTopic.trim() || answerWords.length === 0) {
      return `Not enough detail to check if your ${label} is on-topic. Try adding a bit more.`;
    }

    const overlap = answerWords.filter((w) => topicWords.includes(w));

    if (overlap.length === 0) {
      return `❌ Your ${label} doesn’t seem connected to what you said you studied. Re-read the topic and try to link it more clearly.`;
    } else if (overlap.length === 1) {
      return `⚠️ Your ${label} is partially on-topic, but you can be more specific about today’s topic.`;
    } else {
      return `✅ Your ${label} is clearly related to what you studied today. Good job staying on-topic!`;
    }
  };

  // Generates a simple progress report based on the answers
  const generateProgressReport = (payload) => {
    const level = Number(payload.answers.understandingLevel || 0);
    const summaryLength = (payload.answers.summary || "").trim().length;
    const keyConceptLength = (payload.answers.keyConcept || "").trim().length;
    const doubtsLength = (payload.answers.doubts || "").trim().length;
    const selfQuestionLength = (payload.answers.selfQuestion || "").trim()
      .length;

    // Basic engagement score (just for report, not serious grading)
    let engagementScore = 0;
    if (summaryLength > 20) engagementScore += 1;
    if (keyConceptLength > 10) engagementScore += 1;
    if (selfQuestionLength > 10) engagementScore += 1;

    const understandingScore = level * 20; // 1–5 → 20–100

    let performanceBand = "";
    let remarkTitle = "";
    let remarkBody = "";
    let encouragement = "";
    let highlightColor = "#2563eb";

    if (level <= 2) {
      performanceBand = "Growing Zone";
      remarkTitle = "You’re in the Learning Phase 🌱";
      remarkBody =
        "It’s okay to feel low confidence right now. This just means you’re at the start of mastering this topic, not the end.";
      encouragement =
        "Don’t give up because of one tough day. Even toppers have confusing days. Take a short break, re-watch the concept, and try one more small problem today. You’re still in the game. 💪";
      highlightColor = "#f97316"; // orange
    } else if (level === 3) {
      performanceBand = "Building Confidence";
      remarkTitle = "Solid Start, Keep Building 💡";
      remarkBody =
        "You have a basic grip on the topic. With a bit more practice and revision, you’ll feel much more confident.";
      encouragement =
        "Tiny improvements every day are more powerful than one big study sprint. Keep showing up, even if it feels slow. You’re doing better than you think. 🚀";
      highlightColor = "#22c55e"; // green-ish
    } else if (level >= 4) {
      performanceBand = "Strong Understanding";
      remarkTitle = "Great Work Today 🌟";
      remarkBody =
        "You seem to understand today’s topic quite well. This is a great time to test yourself with previous year questions or higher-level problems.";
      encouragement =
        "Be proud of yourself for putting in focused effort. Keep this consistency, and setbacks won’t be able to stop you. Legends are built one day at a time. 🔥";
      highlightColor = "#22c55e"; // green
    }

    let doubtsComment = "";
    if (doubtsLength === 0) {
      doubtsComment =
        "You haven’t written any doubts. That’s okay, but try to note at least one small question daily – it sharpens your thinking.";
    } else {
      doubtsComment =
        "Great that you wrote your doubts. Asking questions is one of the fastest ways to improve.";
    }

    let engagementComment = "";
    if (engagementScore === 0) {
      engagementComment =
        "Your answers are quite short today. Even writing 1–2 lines more next time will help your brain remember better.";
    } else if (engagementScore === 1 || engagementScore === 2) {
      engagementComment =
        "Nice effort on reflecting today. A little more detail in your answers can make revision easier later.";
    } else {
      engagementComment =
        "Your reflections are detailed. This will really help Future You during exam revision. Great job!";
    }

    // Topic alignment feedback (right/wrong about today's topic)
    const summaryTopicFeedback = getTopicAlignmentFeedback(
      payload.answers.summary,
      payload.studiedToday,
      "summary"
    );
    const keyConceptTopicFeedback = getTopicAlignmentFeedback(
      payload.answers.keyConcept,
      payload.studiedToday,
      "key concept"
    );
    const selfQuestionTopicFeedback = getTopicAlignmentFeedback(
      payload.answers.selfQuestion,
      payload.studiedToday,
      "self-question"
    );

    return {
      date: payload.date,
      studiedToday: payload.studiedToday,
      understandingScore,
      performanceBand,
      remarkTitle,
      remarkBody,
      doubtsComment,
      engagementComment,
      encouragement,
      highlightColor,
      summaryTopicFeedback,
      keyConceptTopicFeedback,
      selfQuestionTopicFeedback,
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      date: new Date().toISOString(),
      studiedToday,
      answers,
    };

    console.log("📘 Questionnaire responses:", payload);

    if (onSubmitResponses) {
      onSubmitResponses(payload);
    }

    const generatedReport = generateProgressReport(payload);

    // 🔹 NEW: evaluate quiz and attach to report
    const quizQuestions = buildQuizQuestions(
      studiedToday,
      quizQuestionCount,
      manualSubject
    );
    const quizEvaluation =
      quizQuestions.length > 0
        ? evaluateQuiz(quizQuestions, quizAnswers)
        : null;

    setReport({
      ...generatedReport,
      quiz: quizEvaluation,
      quizTopic: detectPrimaryTopic(studiedToday, manualSubject),
    });
  };

  // 🔹 Build quiz questions for display in the form
  const quizQuestions = buildQuizQuestions(
    studiedToday,
    quizQuestionCount,
    manualSubject
  );
  const detectedTopicKey = detectPrimaryTopic(studiedToday, manualSubject);

  return (
    <div className="questionnaire-page" style={styles.pageWrapper}>
      <div className="questionnaire-container" style={styles.card}>
        <h2 style={styles.title}>Daily Study Questionnaire</h2>
        <p className="questionnaire-subtitle" style={styles.subtitle}>
          Reflect on what you studied today. This helps you remember better and
          track your understanding. Then answer topic-based quiz questions to
          check if you’re right about what you learned.
        </p>

        <form
          className="questionnaire-form"
          onSubmit={handleSubmit}
          style={styles.form}
        >
          {/* What did you study today? */}
          <div className="questionnaire-field" style={styles.field}>
            <label className="questionnaire-label" style={styles.label}>
              What did you study today? (Mention topic names clearly)
            </label>
            <textarea
              value={studiedToday}
              onChange={(e) => setStudiedToday(e.target.value)}
              placeholder="E.g. Data Structures – linked lists, stacks; Basic Electronics – rectifiers..."
              style={styles.textarea}
              required
            />
          </div>

          {/* OPTIONAL: manual subject override dropdown for quiz */}
          <div className="questionnaire-field" style={styles.field}>
            <label className="questionnaire-label" style={styles.label}>
              (Optional) Choose subject for quiz, or leave as auto-detect:
            </label>
            <select
              value={manualSubject}
              onChange={(e) => setManualSubject(e.target.value)}
              style={{
                ...styles.numberInput,
                width: "100%",
                padding: "8px 10px",
              }}
            >
              <option value="">Auto detect from what you typed</option>
              <option value="dsa">DSA</option>
              <option value="algorithms">Algorithms</option>
              <option value="oop">OOP</option>
              <option value="os">Operating Systems</option>
              <option value="cn">Computer Networks</option>
              <option value="dbms">DBMS</option>
              <option value="web">Web Development</option>
              <option value="ai_ml">AI / ML</option>
              <option value="software_eng">Software Engineering</option>
              <option value="electronics">Electronics</option>
              <option value="digital">Digital Electronics</option>
              <option value="signals">Signals & Systems</option>
              <option value="microcontrollers">Microcontrollers</option>
              <option value="thermo">Thermodynamics</option>
              <option value="fluid">Fluid Mechanics</option>
              <option value="som">Strength of Materials</option>
              <option value="structural">Structural Engineering</option>
              <option value="calculus">Calculus</option>
              <option value="linear_algebra">Linear Algebra</option>
              <option value="probability">Probability & Stats</option>
              <option value="physics">Physics</option>
              <option value="chemistry">Chemistry</option>
            </select>
          </div>

          {/* How many reflection questions to answer today */}
          <div className="questionnaire-field" style={styles.field}>
            <label className="questionnaire-label" style={styles.label}>
              How many reflection questions do you want to answer today?
            </label>
            <input
              type="number"
              min="1"
              max={questions.length}
              value={numberOfQuestions}
              onChange={handleNumberOfQuestionsChange}
              style={styles.numberInput}
            />
            <small className="questionnaire-help" style={styles.helpText}>
              You can choose between 1 and {questions.length}. On busy days,
              answer fewer; on focused days, answer more.
            </small>
          </div>

          {/* Dynamic Reflection Questions - only show the selected number */}
          {questions.slice(0, numberOfQuestions).map((q) => (
            <div
              key={q.id}
              className="questionnaire-field"
              style={styles.field}
            >
              <label className="questionnaire-label" style={styles.label}>
                {q.label}
              </label>

              {q.type === "scale" ? (
                <div
                  className="questionnaire-scale-wrapper"
                  style={styles.scaleWrapper}
                >
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={answers[q.id]}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    style={styles.range}
                  />
                  <div
                    className="questionnaire-scale-labels"
                    style={styles.scaleLabels}
                  >
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>5</span>
                  </div>
                  {q.helpText && (
                    <small
                      className="questionnaire-help"
                      style={styles.helpText}
                    >
                      {q.helpText}
                    </small>
                  )}
                </div>
              ) : (
                <textarea
                  value={answers[q.id]}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  placeholder={q.placeholder}
                  style={styles.textarea}
                />
              )}
            </div>
          ))}

          {/* KNOWLEDGE QUIZ SECTION (APPENDED) */}
          <hr style={{ margin: "20px 0", opacity: 0.3 }} />
          <h3
            className="questionnaire-label"
            style={{ ...styles.label, fontSize: "1.05rem" }}
          >
            Knowledge Quiz – Questions from what you studied
          </h3>

          <div className="questionnaire-field" style={styles.field}>
            <label className="questionnaire-label" style={styles.label}>
              How many quiz questions do you want today?
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={quizQuestionCount}
              onChange={handleQuizQuestionCountChange}
              style={styles.numberInput}
            />
            <small className="questionnaire-help" style={styles.helpText}>
              These will be based on the subject detected or selected above.
            </small>
          </div>

          {studiedToday.trim() && !detectedTopicKey && (
            <p className="questionnaire-help" style={styles.helpText}>
              Tip: Mention the subject name clearly (e.g. "DSA - linked lists",
              "OS - processes") or choose it from the dropdown so quiz questions
              can match better.
            </p>
          )}

          {quizQuestions.length > 0 && (
            <>
              {detectedTopicKey && (
                <p className="questionnaire-help" style={styles.helpText}>
                  Quiz Topic: <strong>{detectedTopicKey}</strong>
                </p>
              )}
              {quizQuestions.map((q, index) => (
                <div
                  key={q.id}
                  className="questionnaire-field"
                  style={styles.field}
                >
                  <label className="questionnaire-label" style={styles.label}>
                    {index + 1}. {q.question}
                  </label>
                  <textarea
                    value={quizAnswers[q.id] || ""}
                    onChange={(e) =>
                      handleQuizAnswerChange(q.id, e.target.value)
                    }
                    placeholder="Write your answer here..."
                    style={styles.textarea}
                  />
                </div>
              ))}
            </>
          )}

          <button
            type="submit"
            className="questionnaire-submit"
            style={styles.button}
          >
            Save Today’s Reflection &amp; View Progress Report
          </button>
        </form>
      </div>

      {/* PROGRESS REPORT CARD */}
      {report && (
        <div
          className="progress-report"
          style={{
            ...styles.card,
            borderTop: `4px solid ${report.highlightColor}`,
          }}
        >
          <h2 style={styles.title}>Progress Report</h2>
          <p className="progress-report-date" style={styles.reportDate}>
            Date: {new Date(report.date).toLocaleString()}
          </p>

          <div className="progress-report-section" style={styles.reportSection}>
            <h3 className="progress-report-heading" style={styles.reportHeading}>
              Today’s Study Snapshot
            </h3>
            <p className="progress-report-text" style={styles.reportText}>
              <strong>Studied:</strong>{" "}
              {report.studiedToday || "Not specified"}
            </p>
            <p className="progress-report-text" style={styles.reportText}>
              <strong>Understanding Score:</strong>{" "}
              {report.understandingScore}/100{" "}
              <span style={{ fontStyle: "italic" }}>
                ({report.performanceBand})
              </span>
            </p>
          </div>

          <div className="progress-report-section" style={styles.reportSection}>
            <h3 className="progress-report-heading" style={styles.reportHeading}>
              {report.remarkTitle}
            </h3>
            <p className="progress-report-text" style={styles.reportText}>
              {report.remarkBody}
            </p>
          </div>

          <div className="progress-report-section" style={styles.reportSection}>
            <h3 className="progress-report-heading" style={styles.reportHeading}>
              Feedback &amp; Remarks
            </h3>
            <ul className="progress-report-list" style={styles.list}>
              <li>{report.doubtsComment}</li>
              <li>{report.engagementComment}</li>
            </ul>
          </div>

          <div className="progress-report-section" style={styles.reportSection}>
            <h3 className="progress-report-heading" style={styles.reportHeading}>
              Are your answers on-topic?
            </h3>
            <ul className="progress-report-list" style={styles.list}>
              <li>{report.summaryTopicFeedback}</li>
              <li>{report.keyConceptTopicFeedback}</li>
              <li>{report.selfQuestionTopicFeedback}</li>
            </ul>
          </div>

          {/* 🔹 Knowledge Quiz Performance (APPENDED) */}
          {report.quiz && (
            <div
              className="progress-report-section"
              style={styles.reportSection}
            >
              <h3
                className="progress-report-heading"
                style={styles.reportHeading}
              >
                Knowledge Quiz – Performance
              </h3>
              {report.quiz.totalQuestions > 0 ? (
                <>
                  <p
                    className="progress-report-text"
                    style={styles.reportText}
                  >
                    You answered {report.quiz.correctCount} out of{" "}
                    {report.quiz.totalQuestions} questions correctly (
                    {report.quiz.percentage}
                    %).
                  </p>
                  <ul className="progress-report-list" style={styles.list}>
                    {report.quiz.details.map((item, idx) => (
                      <li key={idx}>
                        <strong>Q{idx + 1}:</strong> {item.question}
                        <br />
                        <strong>Your answer:</strong>{" "}
                        {item.userAnswer || "—"}
                        <br />
                        <strong>Result:</strong> {item.feedback}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="progress-report-text" style={styles.reportText}>
                  No quiz questions were generated for today’s topic. Try
                  mentioning the subject more clearly next time.
                </p>
              )}
            </div>
          )}

          <div className="progress-report-section" style={styles.reportSection}>
            <h3 className="progress-report-heading" style={styles.reportHeading}>
              Motivation for You 💙
            </h3>
            <p className="progress-report-text" style={styles.reportText}>
              {report.encouragement}
            </p>
            <p
              className="progress-report-text"
              style={{
                ...styles.reportText,
                fontWeight: "600",
                marginTop: "8px",
              }}
            >
              Remember: One setback doesn’t decide your future. Showing up again
              tomorrow does. 🌟
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple inline styles so it's ready to use without CSS file
const styles = {
  pageWrapper: {
    maxWidth: "1100px",
    margin: "20px auto",
    padding: "0 12px",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "16px",
  },
  card: {
    width: "100%",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
    backgroundColor: "#ffffff",
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  title: {
    margin: "0 0 8px",
    fontSize: "1.6rem",
    fontWeight: "600",
  },
  subtitle: {
    margin: "0 0 16px",
    fontSize: "0.95rem",
    color: "#666",
  },
  form: {
    marginTop: "10px",
  },
  field: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "0.95rem",
    fontWeight: "500",
  },
  textarea: {
    width: "100%",
    minHeight: "70px",
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "0.95rem",
    resize: "vertical",
    outline: "none",
  },
  numberInput: {
    width: "80px",
    padding: "6px 8px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "0.95rem",
    outline: "none",
    marginBottom: "4px",
  },
  scaleWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  range: {
    width: "100%",
  },
  scaleLabels: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.8rem",
    color: "#555",
  },
  helpText: {
    fontSize: "0.8rem",
    color: "#777",
  },
  button: {
    marginTop: "8px",
    padding: "10px 16px",
    borderRadius: "999px",
    border: "none",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "600",
    background: "#2563eb",
    color: "#fff",
  },
  reportDate: {
    fontSize: "0.85rem",
    color: "#777",
    marginBottom: "10px",
  },
  reportSection: {
    marginTop: "10px",
    marginBottom: "10px",
  },
  reportHeading: {
    fontSize: "1.05rem",
    fontWeight: "600",
    marginBottom: "4px",
  },
  reportText: {
    fontSize: "0.95rem",
    color: "#444",
    lineHeight: "1.4",
  },
  list: {
    paddingLeft: "18px",
    margin: "4px 0",
    fontSize: "0.95rem",
    color: "#444",
  },
};

export default Questionnaire;
