import React, { useState, useRef, useEffect } from 'react';
import './AIChatbot.css';

function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m your AI study assistant. Ask me anything about your tasks, schedule, or study tips! 📚',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Helper function to try multiple models
  const fetchFromGemini = async (apiKey, history, currentMessage, model) => {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [...history, currentMessage],
        systemInstruction: {
          parts: [{ text: "You are a helpful AI study assistant. Keep responses concise and helpful for students." }]
        }
      })
    });
    return response;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // ---------------------------------------------------------
      // 🟢 PASTE YOUR API KEY HERE AGAIN
      // ---------------------------------------------------------
      const API_KEY = 'AIzaSyAGAx2oKEKpii-UuAsWHpq9tTFRL8AKkRI'; 

      if (!API_KEY) throw new Error("Please edit src/pages/AIChatbot.js and paste your API Key.");

      // Prepare Data
      const history = messages.slice(1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));
      const currentMessage = { role: 'user', parts: [{ text: userMessage.content }] };

      // 🔄 ATTEMPT 1: Try Standard Flash Model
      let response = await fetchFromGemini(API_KEY, history, currentMessage, 'gemini-1.5-flash');

      // 🔄 ATTEMPT 2: If Flash not found (404), try Legacy Pro Model
      if (!response.ok && response.status === 404) {
        console.log("Flash model failed, retrying with Gemini Pro...");
        response = await fetchFromGemini(API_KEY, history, currentMessage, 'gemini-pro');
      }

      const data = await response.json();

      // Error Handling
      if (!response.ok) {
        let errorMsg = data.error?.message || response.statusText;
        
        // Specific helpful error for "Not Found"
        if (errorMsg.includes('not found') || response.status === 404) {
          throw new Error("API Not Enabled. Go to console.cloud.google.com, search 'Generative Language API' and click ENABLE.");
        }
        throw new Error(errorMsg);
      }

      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!responseText) throw new Error("Empty response from AI.");

      setMessages(prev => [...prev, { role: 'assistant', content: responseText, timestamp: new Date() }]);

    } catch (error) {
      console.error('API Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `⚠️ Error: ${error.message}`, 
        timestamp: new Date() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      <button 
        className={`chatbot-float-btn ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Assistant"
      >
        <span className="chatbot-icon">🤖</span>
        <span className="chatbot-pulse"></span>
      </button>

      {isOpen && (
        <div className="chatbot-popup">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <span className="chatbot-avatar">🤖</span>
              <div>
                <h3>AI Study Assistant</h3>
                <span className="chatbot-status"><span className="status-dot"></span>Online</span>
              </div>
            </div>
            <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                <div className="message-content">{message.content}</div>
                <div className="message-time">{formatTime(message.timestamp)}</div>
              </div>
            ))}
            {isLoading && (
              <div className="message assistant">
                <div className="message-content">
                  <div className="typing-indicator"><span></span><span></span><span></span></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              className="chatbot-input"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" className="chatbot-send-btn" disabled={!input.trim() || isLoading}>
              {isLoading ? '⏳' : '🚀'}
            </button>
          </form>
          <div className="chatbot-footer"><small>Powered by Gemini</small></div>
        </div>
      )}
    </>
  );
}

export default AIChatbot;