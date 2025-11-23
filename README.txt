====================================================
STUDENT PRODUCTIVITY TRACKER (React + Capacitor)
====================================================

A productivity companion app designed exclusively for students to
plan goals, track study routines, manage tasks, and view
performance analytics — all in a modern cyberpunk/hacker UI theme.

====================================================
FEATURES
====================================================
⿡ Dashboard Analytics
    - Productivity graphs using React ApexCharts
    - Smart suggestions for best study time slots

⿢ Task Manager
    - Add, edit, and complete tasks easily

⿣ Routine Planner
    - Schedule and follow study routines

⿤ Goal / Syllabus Setup
    - Define subjects and track progress

⿥ Health Focused
    - Integrated HealthContext (hydration, breaks reminder etc.)

⿦ Android App Support
    - Fully deployable on real Android devices with Capacitor

====================================================
TECH STACK
====================================================
Frontend:
    • React (SPA)
    • React Router
    • Custom CSS - Cyberpunk Theme

Charts:
    • React ApexCharts

State Sharing:
    • Context API (SyllabusContext, HealthContext)

Backend:
    • Node.js + Express
    • Runs independently in /Backend folder

Mobile Deployment:
    • Capacitor + Android Studio

Storage:
    • Local storage helper functions

====================================================
PROJECT STRUCTURE (LATEST)
====================================================
Student-Productivity-Tracker/
|
├── android/                 -> Capacitor Android project
│
├── Backend/                 -> Backend server folder
│   ├── server.js
│   ├── package.json
│   ├── node_modules/
│   └── .env
│
├── build/                   -> Production build output
├── node_modules/
├── public/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── utils/
│   ├── App.js
│   ├── App.css
│   ├── HealthContext.js
│   ├── SyllabusContext.js
│   ├── index.js
│   └── index.css
|
├── capacitor.config.ts
├── .gitignore
├── package.json
└── README.txt  (this file)

====================================================
HOW TO RUN FRONTEND (WEB VERSION)
====================================================
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

====================================================
HOW TO RUN BACKEND SERVER
====================================================
cd Backend
npm install
node server.js

Make sure backend URL is reachable by the phone:
Example:
    http://YOUR_LOCAL_IP:5000/

====================================================
BUILD & INSTALL ANDROID APP
====================================================
# Sync web build with Android
npx cap sync android

# Open in Android Studio
npx cap open android

Then build + run to real phone (USB debugging enabled)

====================================================
FUTURE ENHANCEMENTS
====================================================
• Cloud sync + authentication
• Gamification (XP, level badges)
• Offline-first experience with service worker
• Notifications for study reminders
• Improved analytics and time-tracking
• UI redesign with animations and sound effects

====================================================
CREDITS
====================================================
Developer:
• Atul
• Ritika 
• Kunal
Project name assigned internally: "SprintX-2k25"

====================================================
THANK YOU ❤
====================================================
If you like this project, please give the repository a ★ star!

