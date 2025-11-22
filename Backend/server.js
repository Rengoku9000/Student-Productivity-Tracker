// -----------------------------------------
// IMPORTS + SETUP
// -----------------------------------------
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import multer from "multer";
import FormData from "form-data";
import webpush from "web-push";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// -----------------------------------------
// Debug check for keys
// -----------------------------------------
const ocrKey = process.env.OCRSPACE_API_KEY;
if (ocrKey) {
  console.log(`🔐 OCR Key Loaded: ${ocrKey.slice(0, 6)}*****`);
} else {
  console.log("❌ OCRSPACE_API_KEY missing in .env");
}

const openrouterKey = process.env.OPENROUTER_API_KEY;
if (openrouterKey) {
  console.log(`🔐 OpenRouter Key Loaded: ${openrouterKey.slice(0, 6)}*****`);
} else {
  console.log("❌ OPENROUTER_API_KEY missing in .env");
}

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (!vapidPublicKey || !vapidPrivateKey) {
  console.warn("⚠️ VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY missing in .env (push will not work).");
} else {
  webpush.setVapidDetails(
    "mailto:you@example.com", // change to your email if you want
    vapidPublicKey,
    vapidPrivateKey
  );
}

// -----------------------------------------
// IN-MEMORY STATE
// -----------------------------------------
let lastParsedTimetable = [];      // periods from parseCollegeTimetable (for notifications)
let pushSubscriptions = [];        // list of push subscriptions
let sentNotifications = new Set(); // to avoid duplicate sends per day

// -----------------------------------------
// 1️⃣ CHAT ROUTE
// -----------------------------------------
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openrouterKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free",
        messages,
        max_tokens: 300,
      }),
    });

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;
    res.json({ reply: reply || "⚠️ No response from model." });
  } catch (err) {
    console.error("Chat Error:", err);
    res.status(500).json({ reply: "Server error." });
  }
});

// -----------------------------------------
// 2️⃣ TIMETABLE OCR ROUTE
// -----------------------------------------
const upload = multer({ storage: multer.memoryStorage() });

app.post("/api/timetable/parse", upload.single("timetable"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image file uploaded." });

    console.log("📌 Timetable image received. Sending to OCR.Space…");

    const formData = new FormData();
    formData.append("apikey", ocrKey);
    formData.append("language", "eng");
    formData.append("isTable", "true");
    formData.append("file", req.file.buffer, req.file.originalname);

    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: formData,
    });

    const ocrData = await response.json();
    const text = ocrData?.ParsedResults?.[0]?.ParsedText;

    if (!text) {
      console.log("❌ OCR returned no text");
      return res.status(500).json({ error: "OCR returned no text" });
    }

    console.log("🧠 OCR RAW TEXT:\n", text);

    const periods = parseCollegeTimetable(text);
    console.log(`📅 Final recognized periods: ${periods.length}`);

    // save for notifications
    lastParsedTimetable = periods || [];

    res.json({ periods });
  } catch (err) {
    console.error("OCR Route Error:", err);
    res.status(500).json({ error: "Server error parsing timetable" });
  }
});

// -----------------------------------------
// UPDATED SMART PARSER WITH LAB MERGE (OPTION B)
// -----------------------------------------
function parseCollegeTimetable(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  const days = {
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
  };

  const timeSlots = [
    { start: "08:30", end: "09:25" },
    { start: "09:25", end: "10:20" },
    { start: "10:40", end: "11:35" },
    { start: "11:35", end: "12:30" },
    { start: "13:25", end: "14:20" },
    { start: "14:20", end: "15:15" },
    { start: "15:15", end: "16:10" },
  ];

  let result = [];
  let currentDay = null;
  let dayBlock = "";

  const flushDay = () => {
    if (currentDay == null) return;
    const subjects = extractSubjects(dayBlock);
    addSubjectsWithLabs(result, currentDay, subjects, timeSlots);
    dayBlock = "";
  };

  for (let line of lines) {
    const upper = line.toUpperCase();

    const dayKey = Object.keys(days).find((d) => upper.startsWith(d));
    if (dayKey) {
      flushDay();
      currentDay = days[dayKey];
      dayBlock = line.slice(dayKey.length).trim() + " ";
      continue;
    }

    if (currentDay != null) {
      dayBlock += line + " ";
    }
  }

  flushDay();
  return result;
}

// very simple subject extraction based on known subjects list
function extractSubjects(text) {
  let cleaned = text.replace(/\s+/g, " ").trim();
  const subjects = [];

  const subjectsList = [
    "PROJECT",
    "DS LAB",
    "DDCO",
    "MAT",
    "OS LAB",
    "OS",
    "DSA",
    "CRC",
    "SCR",
    "YOGA",
    "PROCTORING",
    "OOPS",
    "ENGLISH",
    "TUTORIAL",
    "REMEDIAL",
    "JAVA",
  ];

  subjectsList.forEach((name) => {
    const regex = new RegExp(name, "gi");
    let match;
    while ((match = regex.exec(cleaned)) !== null) {
      if (!subjects.includes(name)) {
        subjects.push(name);
      }
    }
  });

  return subjects;
}

// labs occupy 2 periods
function addSubjectsWithLabs(result, dayIndex, subjects, timeSlots) {
  let i = 0;
  let slot = 0;

  while (i < subjects.length && slot < timeSlots.length) {
    const subj = subjects[i];
    const isLab = /LAB/i.test(subj);
    const span = isLab ? 2 : 1;

    const endSlot = Math.min(slot + span - 1, timeSlots.length - 1);

    result.push({
      id: `d${dayIndex}s${slot}`,
      dayIndex,
      subject: subj,
      startTime: timeSlots[slot].start,
      endTime: timeSlots[endSlot].end,
    });

    slot += span;
    i++;
  }
}

// -----------------------------------------
// 3️⃣ ACTIVITY TRACKER
// -----------------------------------------
let activityLogs = [];

app.get("/api/pedometer/today", (req, res) => {
  const steps = 6000 + Math.floor(Math.random() * 3000);
  const minutes = 20 + Math.floor(Math.random() * 30);
  res.json({ steps, minutes });
});

app.post("/api/activity-log", (req, res) => {
  const log = req.body;
  activityLogs.push(log);
  res.json({ message: "Saved", log });
});

app.get("/api/activity-log", (req, res) => {
  res.json(activityLogs);
});

// -----------------------------------------
// 4️⃣ PUSH NOTIFICATION SUBSCRIPTION ROUTE
// -----------------------------------------
app.post("/api/subscribe", (req, res) => {
  const subscription = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: "Invalid subscription object" });
  }

  const exists = pushSubscriptions.find((s) => s.endpoint === subscription.endpoint);
  if (!exists) {
    pushSubscriptions.push(subscription);
    console.log("✅ New push subscription saved. Total:", pushSubscriptions.length);
  }

  res.status(201).json({ message: "Subscription saved" });
});

// -----------------------------------------
// 5️⃣ NOTIFICATION SCHEDULER (5 mins before class)
// -----------------------------------------
function minutesSinceMidnight(date) {
  const h = date.getHours();
  const m = date.getMinutes();
  return h * 60 + m;
}

function parseTimeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function resetSentNotificationsIfNewDay() {
  const now = new Date();
  const key = now.toDateString();
  if (!resetSentNotificationsIfNewDay.lastKey) {
    resetSentNotificationsIfNewDay.lastKey = key;
  }
  if (resetSentNotificationsIfNewDay.lastKey !== key) {
    console.log("🔄 New day – reset sentNotifications");
    sentNotifications.clear();
    resetSentNotificationsIfNewDay.lastKey = key;
  }
}

async function checkAndSendNotifications() {
  if (!lastParsedTimetable || lastParsedTimetable.length === 0) return;
  if (pushSubscriptions.length === 0) return;

  resetSentNotificationsIfNewDay();

  const now = new Date();
  const todayIndex = now.getDay(); // 0=Sun..6=Sat
  const nowMinutes = minutesSinceMidnight(now);

  const todaysPeriods = lastParsedTimetable.filter((p) => p.dayIndex === todayIndex);

  todaysPeriods.forEach((p) => {
    const start = parseTimeToMinutes(p.startTime);
    const diff = start - nowMinutes;

    if (diff <= 5 && diff >= 0) {
      const key = `${p.dayIndex}-${p.startTime}-${p.subject}`;
      if (sentNotifications.has(key)) return;

      sentNotifications.add(key);
      console.log("🔔 Sending notification for:", p.subject, p.startTime);

      const payload = JSON.stringify({
        title: "📚 Class starting soon",
        body: `${p.subject} at ${p.startTime}`,
        data: { subject: p.subject, startTime: p.startTime },
      });

      pushSubscriptions.forEach((sub) => {
        webpush
          .sendNotification(sub, payload)
          .catch((err) => {
            console.error("Push send error:", err.statusCode || err.message);
          });
      });
    }
  });
}

// check every minute
setInterval(checkAndSendNotifications, 60 * 1000);

// -----------------------------------------
// 6️⃣ TASKS API (Backend-powered checklist)
// -----------------------------------------
let pendingTasks = []; // in-memory for now

// Add a new task from StartGoals (Day + full subject name)
app.post("/api/tasks/add", (req, res) => {
  const { day, subject } = req.body;

  if (!day || !subject) {
    return res.status(400).json({ error: "Day & Subject required" });
  }

  const id = `${day}-${subject}-${Date.now()}`;

  pendingTasks.push({
    id,
    day,        // e.g. "Day 1"
    subject,    // e.g. "Deep Learning"
    completed: false,
  });

  console.log("🆕 Task Added:", subject, "➡️", day);
  res.json({ message: "Task added", id });
});

// Get all pending (not completed) tasks
app.get("/api/tasks", (req, res) => {
  res.json(pendingTasks.filter((task) => !task.completed));
});

// Mark a task as completed
app.post("/api/tasks/complete", (req, res) => {
  const { id } = req.body;

  const task = pendingTasks.find((t) => t.id === id);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  task.completed = true;
  console.log("✔ Task Completed:", task.subject, "➡️", task.day);
  res.json({ message: "Task updated" });
});

// -----------------------------------------
app.listen(5000, () => console.log("🚀 Backend running on http://localhost:5000"));
