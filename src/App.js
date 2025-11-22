import React, { createContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";

// Core Pages
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Routine from "./pages/Routine";
import Profile from "./pages/Profile";
import StartGoals from "./pages/StartGoals";

// ⭐ NEW LEADERBOARD IMPORT
import Leaderboard from "./pages/Leaderboard";

// Insights & Detail Pages
import TaskAnalytics from "./pages/TaskAnalytics";
import StudyPlanDetail from "./pages/StudyPlanDetail";
import SubjectFocusDetail from "./pages/SubjectFocusDetail";
import AIsuggestionsDetail from "./pages/AIsuggestionsDetail";
import TodayMissionsDetail from "./pages/TodayMissionsDetail";
import DashboardDetail from "./pages/DashboardDetail";
import MotivationCenter from "./pages/MotivationCenter";

// ⭐ HEALTH IMPORTS
import HealthPage from "./pages/health/HealthPage";
import { HealthProvider } from "./pages/health/HealthContext";

// ⭐ CHATBOT IMPORT
import Chatbot from "./components/Chatbot";

// ⭐ QUESTIONNAIRE IMPORT
import Questionnaire from "./pages/Questionnaire";


import "./App.css";

// =========================================================
// GLOBAL SYLLABUS CONTEXT DATA
// =========================================================
export const SyllabusContext = createContext(null);

const syllabusData = {
  cse: {
    name: 'Computer Science and Engineering',
    years: {
      1: {
        sem1: {
          label: '1st Sem (Common)',
          subjects: [
            'Calculus and Linear Algebra',
            'Engineering Physics',
            'Basic Electrical / Electronics Engineering',
            'Engineering Graphics',
            'Problem Solving and C Programming',
            'Communication / Life Skills',
          ],
        },
        sem2: {
          label: '2nd Sem (Common)',
          subjects: [
            'Advanced Calculus / Differential Equations',
            'Engineering Chemistry / Environmental Studies',
            'Engineering Mechanics / Basic Mechanical',
            'Introduction to IT / Computing',
            'C / Python Programming',
            'Professional Communication',
          ],
        },
      },
      2: {
        sem3: {
          label: '3rd Sem CSE',
          subjects: [
            'Transform Calculus / Numerical Techniques',
            'Data Structures and Applications',
            'Analog and Digital Electronics',
            'Computer Organization and Architecture',
            'Object Oriented Programming (Java)',
            'Constitution of India & Professional Ethics',
          ],
        },
        sem4: {
          label: '4th Sem CSE',
          subjects: [
            'Discrete Mathematics and Graph Theory',
            'Analysis and Design of Algorithms',
            'Operating Systems',
            'Database Management Systems (Intro)',
            'Web Technologies / Web Design',
            'Biology / Open HSS Elective (as per VTU)',
          ],
        },
      },
      3: {
        sem5: {
          label: '5th Sem CSE',
          subjects: [
            'Software Engineering and Tools',
            'Computer Networks',
            'Operating Systems (Advanced / Labs)',
            'Database Management Systems (Full)',
            'Formal Languages / Theory of Computation or RMI',
            'Environmental Studies / Research Methodology',
          ],
        },
        sem6: {
          label: '6th Sem CSE',
          subjects: [
            'Entrepreneurship / Management and Finance',
            'Computer Graphics & Image Processing or Full Stack Dev',
            'Artificial Intelligence and Machine Learning',
            'Professional Elective I (e.g., IoT, Security, Cloud)',
            'Open Elective I',
            'AI & ML Lab / Mini Project',
          ],
        },
      },
    },
  },

  aiml: {
    name: 'Artificial Intelligence and Machine Learning',
    years: {
      1: {
        sem1: {
          label: '1st Sem (Common)',
          subjects: [
            'Calculus and Linear Algebra',
            'Engineering Physics',
            'Basic Electrical / Electronics Engineering',
            'Engineering Graphics',
            'C / Python Programming Basics',
            'Professional Communication / Life Skills',
          ],
        },
        sem2: {
          label: '2nd Sem (Common)',
          subjects: [
            'Advanced Calculus / Differential Equations',
            'Engineering Chemistry / Environmental Studies',
            'Engineering Mechanics',
            'Introduction to AI & Computing',
            'Python Programming',
            'Communication / HSS Elective',
          ],
        },
      },
      2: {
        sem3: {
          label: '3rd Sem AIML',
          subjects: [
            'Transform Calculus / Fourier Series',
            'Data Structures and Applications',
            'Probability and Statistics for AI',
            'Object Oriented Programming (Python/Java)',
            'Digital Logic / Computer Organization',
            'Constitution of India & Professional Ethics',
          ],
        },
        sem4: {
          label: '4th Sem AIML',
          subjects: [
            'Linear Algebra for Machine Learning',
            'Design and Analysis of Algorithms',
            'Database Management Systems',
            'Introduction to Artificial Intelligence',
            'Machine Learning Fundamentals',
            'Open HSS / Life Skills',
          ],
        },
      },
      3: {
        sem5: {
          label: '5th Sem AIML',
          subjects: [
            'Advanced Machine Learning',
            'Deep Learning',
            'Computer Networks / Distributed Systems',
            'Data Mining / Data Warehousing',
            'Professional Elective I (e.g., NLP, CV)',
            'Mini Project / Research Methodology',
          ],
        },
        sem6: {
          label: '6th Sem AIML',
          subjects: [
            'Reinforcement Learning / Advanced AI',
            'Big Data / Cloud for AI',
            'AI in Robotics / Edge AI (Elective)',
            'Open Elective I',
            'AI Project / Capstone (Phase - 1)',
          ],
        },
      },
    },
  },

  mechanical: {
    name: 'Mechanical Engineering',
    years: {
      1: {
        sem1: {
          label: '1st Sem (Common)',
          subjects: [
            'Calculus and Linear Algebra',
            'Engineering Physics',
            'Basic Electrical / Electronics Engineering',
            'Engineering Graphics',
            'Programming for Problem Solving',
          ],
        },
        sem2: {
          label: '2nd Sem (Common)',
          subjects: [
            'Advanced Calculus / Differential Equations',
            'Engineering Chemistry',
            'Engineering Mechanics',
            'Workshop Practice',
            'Basic Thermodynamics Intro',
          ],
        },
      },
      2: {
        sem3: {
          label: '3rd Sem Mechanical',
          subjects: [
            'Transform Calculus / Numerical Techniques',
            'Mechanics of Materials',
            'Basic Thermodynamics',
            'Manufacturing Processes',
            'Machine Drawing',
            'Constitution of India & Professional Ethics',
          ],
        },
        sem4: {
          label: '4th Sem Mechanical',
          subjects: [
            'Applied Thermodynamics',
            'Kinematics of Machines',
            'Fluid Mechanics',
            'Materials Science and Metallurgy',
            'Mechanical Measurements / Metrology',
          ],
        },
      },
      3: {
        sem5: {
          label: '5th Sem Mechanical',
          subjects: [
            'Dynamics of Machines',
            'Heat Transfer',
            'Design of Machine Elements I',
            'Turbo Machines / IC Engines',
            'Manufacturing Technology (Advanced)',
          ],
        },
        sem6: {
          label: '6th Sem Mechanical',
          subjects: [
            'Design of Machine Elements II',
            'Finite Element Methods / Analysis',
            'Mechanical Vibrations',
            'Production Planning and Control',
            'Professional & Open Electives',
          ],
        },
      },
    },
  },

  civil: {
    name: 'Civil Engineering',
    years: {
      1: {
        sem1: {
          label: '1st Sem (Common)',
          subjects: [
            'Calculus and Linear Algebra',
            'Engineering Physics',
            'Basic Civil & Mechanical Engineering',
            'Engineering Graphics',
            'Programming for Problem Solving',
          ],
        },
        sem2: {
          label: '2nd Sem (Common)',
          subjects: [
            'Advanced Calculus / Differential Equations',
            'Engineering Chemistry',
            'Building Materials and Construction Basics',
            'Surveying Basics',
            'Environmental Studies',
          ],
        },
      },
      2: {
        sem3: {
          label: '3rd Sem Civil',
          subjects: [
            'Transform Calculus / Numerical Methods',
            'Strength of Materials',
            'Surveying I',
            'Fluid Mechanics',
            'Building Planning and Drawing',
          ],
        },
        sem4: {
          label: '4th Sem Civil',
          subjects: [
            'Concrete Technology',
            'Structural Analysis I',
            'Hydraulics and Hydraulic Machines',
            'Geotechnical Engineering I',
            'Highway Engineering',
          ],
        },
      },
      3: {
        sem5: {
          label: '5th Sem Civil',
          subjects: [
            'Design of RC Structures',
            'Geotechnical Engineering II',
            'Environmental Engineering',
            'Surveying II / Remote Sensing',
            'Water Resources Engineering',
          ],
        },
        sem6: {
          label: '6th Sem Civil',
          subjects: [
            'Design of Steel Structures',
            'Transportation Engineering',
            'Construction Management',
            'Earthquake / Advanced Structural Engineering (Elective)',
            'Open Elective',
          ],
        },
      },
    },
  },

  csbs: {
    name: 'Computer Science and Business Systems',
    years: {
      1: {
        sem1: {
          label: '1st Sem (Common)',
          subjects: [
            'Calculus and Linear Algebra',
            'Engineering Science (Physics / Chemistry)',
            'Programming for Problem Solving',
            'Basics of Electronics / IT',
            'Communication Skills',
          ],
        },
        sem2: {
          label: '2nd Sem (Common)',
          subjects: [
            'Advanced Mathematics',
            'Engineering Economics Basics',
            'Data Structures using C / Python',
            'Digital Logic',
            'Professional Communication',
          ],
        },
      },
      2: {
        sem3: {
          label: '3rd Sem CSBS',
          subjects: [
            'Probability and Statistics',
            'Data Structures and Algorithms',
            'Database Systems',
            'Object Oriented Programming',
            'Principles of Management',
          ],
        },
        sem4: {
          label: '4th Sem CSBS',
          subjects: [
            'Computer Networks',
            'Operating Systems',
            'Software Engineering',
            'Business Analytics / Data Mining',
            'Financial Accounting for Engineers',
          ],
        },
      },
      3: {
        sem5: {
          label: '5th Sem CSBS',
          subjects: [
            'Web Technologies & E-Business',
            'Cloud Computing / Big Data',
            'Machine Learning Foundations',
            'Business Strategy / Marketing Basics',
            'Professional Elective I',
          ],
        },
        sem6: {
          label: '6th Sem CSBS',
          subjects: [
            'Enterprise Systems / ERP',
            'Advanced Analytics / AI for Business',
            'Open Elective I',
            'Mini Project / Domain Project',
          ],
        },
      },
    },
  },

  electronics: {
    name: 'Electronics and Communication Engineering',
    years: {
      1: {
        sem1: {
          label: '1st Sem (Common)',
          subjects: [
            'Calculus and Linear Algebra',
            'Engineering Physics',
            'Basic Electrical Engineering',
            'Programming for Problem Solving',
            'Engineering Graphics',
          ],
        },
        sem2: {
          label: '2nd Sem (Common)',
          subjects: [
            'Advanced Calculus / Differential Equations',
            'Engineering Chemistry',
            'Basic Electronics',
            'Digital Logic Design',
            'Communication Skills',
          ],
        },
      },
      2: {
        sem3: {
          label: '3rd Sem ECE',
          subjects: [
            'Transform Calculus / Numerical Techniques',
            'Electronic Devices and Circuits',
            'Digital System Design',
            'Network Theory',
            'Signals and Systems',
          ],
        },
        sem4: {
          label: '4th Sem ECE',
          subjects: [
            'Analog Electronics',
            'Microcontrollers and Embedded Systems',
            'Control Systems',
            'Communication Theory',
            'Linear ICs and Applications',
          ],
        },
      },
      3: {
        sem5: {
          label: '5th Sem ECE',
          subjects: [
            'Digital Communication',
            'Digital Signal Processing',
            'Microprocessors',
            'Antenna and Wave Propagation',
            'Professional Elective I',
          ],
        },
        sem6: {
          label: '6th Sem ECE',
          subjects: [
            'Wireless Communication',
            'VLSI Design Basics',
            'Optical / Satellite Communication (Elective)',
            'Open Elective I',
            'Mini Project / Design Project',
          ],
        },
      },
    },
  },

  electrical: {
    name: 'Electrical and Electronics Engineering',
    years: {
      1: {
        sem1: {
          label: '1st Sem (Common)',
          subjects: [
            'Calculus and Linear Algebra',
            'Engineering Physics',
            'Basic Electrical Engineering',
            'Engineering Graphics',
            'Programming for Problem Solving',
          ],
        },
        sem2: {
          label: '2nd Sem (Common)',
          subjects: [
            'Advanced Calculus / Differential Equations',
            'Engineering Chemistry',
            'Basic Electronics',
            'Network Analysis Basics',
            'Professional Communication',
          ],
        },
      },
      2: {
        sem3: {
          label: '3rd Sem EEE',
          subjects: [
            'Transform Calculus / Numerical Techniques',
            'DC Machines and Transformers',
            'Network Theory',
            'Analog Electronics for EEE',
            'Digital Electronics',
          ],
        },
        sem4: {
          label: '4th Sem EEE',
          subjects: [
            'AC Machines',
            'Power Generation and Economics',
            'Signals and Systems',
            'Control Systems',
            'Measurements and Instrumentation',
          ],
        },
      },
      3: {
        sem5: {
          label: '5th Sem EEE',
          subjects: [
            'Power System Analysis',
            'Power Electronics',
            'Microcontrollers for Power Applications',
            'High Voltage Engineering',
            'Professional Elective I',
          ],
        },
        sem6: {
          label: '6th Sem EEE',
          subjects: [
            'Power System Protection',
            'Renewable Energy Systems',
            'Electrical Drives',
            'Open Elective I',
            'Mini Project',
          ],
        },
      },
    },
  },
};

// =========================================================
// NAVIGATION COMPONENT
// =========================================================
function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: "📊" },
    { path: "/tasks", label: "Tasks", icon: "✅" },
    { path: "/routine", label: "Routine", icon: "📅" },
    // Analytics Removed
    { path: "/start-goals", label: "Start Goals", icon: "🚀" },
    { path: "/health", label: "Health", icon: "🩺" },
    { path: "/questionnaire", label: "Questionnaire", icon: "📝" }, // ⭐ NEW
    { path: "/leaderboard", label: "Ranks", icon: "🏆" },
    { path: "/profile", label: "Profile", icon: "👤" },
    // Settings Removed
  ];

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span className="brand-icon">🎯</span>
        <span className="brand-text">Nexus</span>
      </div>
      <div className="nav-links">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${
              location.pathname === item.path ? "active" : ""
            }`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

// =========================================================
// MAIN APP COMPONENT WITH ROUTING
// =========================================================
function App() {
  return (
    <HealthProvider>
      {/* Wrapped inside HealthProvider for global health state */}
      <Router>
        <SyllabusContext.Provider value={syllabusData}>
          <div className="app-wrapper">
            <div className="app">
              <Navigation />
              <main className="main-content">
                <Routes>
                  {/* Main Screens */}
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/routine" element={<Routine />} />
                  <Route path="/start-goals" element={<StartGoals />} />
                  <Route path="/health" element={<HealthPage />} />
                  <Route path="/profile" element={<Profile />} />

                  {/* ⭐ NEW QUESTIONNAIRE ROUTE */}
                  <Route path="/questionnaire" element={<Questionnaire />} />

                  {/* Detailed Screens */}
                  <Route path="/insights/tasks" element={<TaskAnalytics />} />
                  <Route path="/insights/study" element={<StudyPlanDetail />} />
                  <Route
                    path="/insights/subjects"
                    element={<SubjectFocusDetail />}
                  />
                  <Route
                    path="/insights/ai"
                    element={<AIsuggestionsDetail />}
                  />
                  <Route
                    path="/insights/missions"
                    element={<TodayMissionsDetail />}
                  />
                  <Route
                    path="/insights/dashboard"
                    element={<DashboardDetail />}
                  />
                  <Route path="/motivation" element={<MotivationCenter />} />

                  {/* Subject Deep-Dive */}
                  <Route
                    path="/subject/:subjectId"
                    element={<SubjectFocusDetail />}
                  />
                </Routes>
              </main>
            </div>

            {/* ⭐ CHATBOT MOVED OUTSIDE .app TO FIX POPPING ISSUE */}
            <Chatbot />
          </div>
        </SyllabusContext.Provider>
      </Router>
    </HealthProvider>
  );
}

export default App;
