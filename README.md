# 🚀 Student Productivity Tracker (SprintX-2k25)

> **Internal Project Title:** SprintX-2k25  
> **Theme:** Modern Cyberpunk / Hacker UI

A comprehensive productivity companion designed exclusively for students. This application helps users plan goals, track study routines, manage tasks, and view performance analytics—all wrapped in an immersive, high-contrast Cyberpunk aesthetic.

**[🎥 Watch the Video Explanation / Demo](https://drive.google.com/drive/folders/1S9T2JHfYqaeMtZVq_EGKc7FaOjxen5KN?usp=sharing)**

---

## ⚡ Features

### 1️⃣ Dashboard Analytics
* Visual productivity graphs powered by **React ApexCharts**.
* Smart suggestions for optimal study time slots based on your history.

### 2️⃣ Task Manager
* Streamlined interface to add, edit, and complete academic tasks.
* Priority management for assignments and exams.

### 3️⃣ Routine Planner
* Schedule and maintain consistent study habits.
* Drag-and-drop capability (if applicable) or easy time-blocking.

### 4️⃣ Goal & Syllabus Setup
* Add specific subjects and track syllabus coverage visually.
* Progress bars to keep you motivated.

### 5️⃣ Health Focused
* **Wellness Module:** Integrated hydration tracking and break reminders to prevent burnout.

### 6️⃣ Cross-Platform Support
* **Web:** Runs as a responsive React Single Page Application.
* **Android:** Fully deployable on real devices using **Capacitor**.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React (SPA), React Router DOM, CSS3 (Cyberpunk Theme) |
| **State Mgmt** | Context API (`SyllabusContext`, `HealthContext`) |
| **Visualization** | React ApexCharts |
| **Backend** | Node.js, Express.js |
| **Mobile Runtime** | Capacitor, Android Studio |
| **Storage** | LocalStorage (Client-side persistence) |

---

## 📂 Project Structure

```text
Student-Productivity-Tracker/
├── android/                 # Android native project (Capacitor generated)
├── Backend/                 # Independent Node.js API server
│   ├── server.js
│   ├── .env
│   └── package.json
├── build/                   # Production build output
├── public/                  # Static assets
├── src/                     # React Source Code
│   ├── components/          # Reusable UI components
│   ├── pages/               # Route pages
│   ├── utils/               # Helper functions
│   ├── App.js               # Main Component
│   ├── App.css              # Global styles
│   ├── HealthContext.js     # State management
│   ├── SyllabusContext.js   # State management
│   └── index.js             # Entry point
├── capacitor.config.ts      # Capacitor configuration
├── package.json             # Frontend dependencies
└── README.md                # Project documentation
====================================================
THANK YOU ❤
====================================================
If you like this project, please ⭐ star this repository!
