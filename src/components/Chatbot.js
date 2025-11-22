import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "SYSTEM ONLINE. How can I assist you, Operator?" }
  ]);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const toggleChat = () => setIsOpen(!isOpen);

  // Formatter for bold text from AI
  const formatMessage = (text) => {
    if (!text) return "";
    const cleanText = text.replace(/<s>|\[\/?INST\]/g, "").trim();
    const parts = cleanText.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="highlight-text">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Gather ALL User Data for AI Context
  const getUserContext = () => {
    try {
      const profileData = JSON.parse(localStorage.getItem("profileData") || "{}");
      const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const studyPlan = JSON.parse(localStorage.getItem("studyPlan") || "{}");
      const healthData = JSON.parse(localStorage.getItem("healthData") || "{}");
      const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
      
      const completedTasks = tasks.filter(t => t.completed);
      const pendingTasks = tasks.filter(t => !t.completed);
      const highPriority = pendingTasks.filter(t => t.priority === 'High').map(t => t.text).join(", ");
      const todaysRoutine = studyPlan.days?.[0]?.slots?.map(s => `${s.subject} (${s.hours}h)`).join(", ") || "No fixed routine today";
      const xp = completedTasks.length * 150 + 500;
      const rank = Math.max(1, 200 - completedTasks.length);

      return `
        CONTEXT: You are talking to a student named ${userProfile.name || "Student"}.
        === 👤 PROFILE ===
        - Stream: ${profileData.stream || "Not set"}
        - Skills: ${profileData.languages?.join(", ") || "None"}
        === 🩺 HEALTH (Live) ===
        - Sleep: ${healthData.sleep || "?"}h | Water: ${healthData.water || 0}ml | Mood: ${healthData.mood || "?"}
        *If sleep < 6h or water < 2L, warn them gently.*
        === ✅ TASKS ===
        - Pending: ${pendingTasks.length} tasks
        - High Priority: ${highPriority || "None"}
        - Completed: ${completedTasks.length} tasks
        === 📅 ROUTINE (Today) ===
        - Schedule: ${todaysRoutine}
        === 🏆 LEADERBOARD STATUS ===
        - XP: ${xp}
        - Global Rank: #${rank}
        - Status: ${xp > 1000 ? "Elite Hacker" : "Rookie"}
        INSTRUCTIONS:
        - Be their "System Operator" (Cyberpunk persona).
        - Use **bold** for important items.
        - Keep responses concise.
      `.trim();
    } catch (error) {
      return "You are a helpful study assistant.";
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const systemContext = { role: "system", content: getUserContext() };
      const apiMessages = [systemContext, ...newMessages];

      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await response.json();

      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Connection lost." }]);
      }

    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ System Offline." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Portal Content: Floating Button + Window
  const chatbotContent = (
    <div className="chatbot-portal-overlay">
      
      {/* Floating Button with Robot Image Icon */}
      <div className="cyber-float-btn" onClick={toggleChat}>
        {isOpen ? (
          <span className="close-icon">✕</span>
        ) : (
          <img 
            src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png" 
            alt="AI" 
            className="bot-icon-img" 
          />
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="cyber-chat-window">
          <video autoPlay loop muted playsInline className="chat-bg-video">
            <source src="https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-blue-circuit-board-232-large.mp4" type="video/mp4" />
          </video>

          <div className="chat-header">
            <div className="header-title">
              <span className="status-dot"></span>
              NEURAL UPLINK
            </div>
            <button className="close-btn" onClick={toggleChat}>×</button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message-row ${msg.role === 'user' ? 'user-row' : 'bot-row'}`}>
                <div className="avatar">{msg.role === 'user' ? '👤' : '🤖'}</div>
                <div className="message-bubble">{formatMessage(msg.content)}</div>
              </div>
            ))}
            {isLoading && (
              <div className="message-row bot-row">
                <div className="avatar">🤖</div>
                <div className="message-bubble typing">
                  <span>•</span><span>•</span><span>•</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-area" onSubmit={handleSend}>
            <input
              type="text"
              className="chat-input"
              placeholder="Enter command..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" className="send-btn" disabled={isLoading}>&gt;</button>
          </form>
        </div>
      )}
    </div>
  );

  // Render to body to break out of parent layout constraints
  return ReactDOM.createPortal(chatbotContent, document.body);
};

export default Chatbot;