import React, { useState, useRef, useEffect } from 'react';
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

  // ⭐ Helper function to clean AI responses
  const cleanResponse = (text) => {
    if (!text) return "";
    // Removes <s>, [INST], [/INST], and trims whitespace
    return text.replace(/<s>|\[\/?INST\]/g, "").trim();
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];

    // 1. Add user message to UI immediately
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      // 2. Send to your local backend
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();

      if (data.reply) {
        // ⭐ CLEAN THE RESPONSE BEFORE SETTING IT
        const cleanedText = cleanResponse(data.reply);
        setMessages((prev) => [...prev, { role: "assistant", content: cleanedText }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ CONNECTION ERROR: No reply data." }]);
      }

    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ SYSTEM FAILURE: Cannot reach server." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <div className="cyber-float-btn" onClick={toggleChat}>
        {isOpen ? "✕" : "AI"}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="cyber-chat-window">
          {/* ⭐ UPDATED VIDEO SOURCE: Reliable Tech Background ⭐ */}
          <video autoPlay loop muted playsInline className="chat-bg-video">
            <source src="https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-blue-circuit-board-232-large.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          <div className="chat-header">
            <span>Neural Uplink</span>
            <button className="close-btn" onClick={toggleChat}>×</button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`message-row ${msg.role === 'user' ? 'user-row' : 'bot-row'}`}
              >
                {/* Avatar */}
                <div className="avatar">
                  {msg.role === 'user' ? '👤' : '🤖'}
                </div>
                
                {/* Bubble */}
                <div className="message-bubble">
                  {msg.content}
                </div>
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
            <button type="submit" className="send-btn" disabled={isLoading}>
              {isLoading ? "..." : ">"}
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;