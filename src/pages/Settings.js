import React, { useState, useEffect } from "react";
import "./Settings.css";

const Settings = () => {
  const [openaiKey, setOpenaiKey] = useState("");
  const [youtubeKey, setYoutubeKey] = useState("");
  const [themeMode, setThemeMode] = useState("auto");
  const [status, setStatus] = useState("");

  useEffect(() => {
    try {
      const storedOpenai = localStorage.getItem("openaiApiKey");
      const storedYouTube = localStorage.getItem("youtubeApiKey");
      const storedTheme = localStorage.getItem("themeMode");

      if (storedOpenai) setOpenaiKey(storedOpenai);
      if (storedYouTube) setYoutubeKey(storedYouTube);
      if (storedTheme) setThemeMode(storedTheme);
    } catch {}
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem("openaiApiKey", openaiKey.trim());
      localStorage.setItem("youtubeApiKey", youtubeKey.trim());
      localStorage.setItem("themeMode", themeMode);

      setStatus("✅ Settings saved successfully!");
      document.dispatchEvent(new Event("themeUpdated"));

      setTimeout(() => setStatus(""), 2500);
    } catch {
      setStatus("❌ Failed to save settings.");
    }
  };

  const handleClear = () => {
    try {
      localStorage.removeItem("openaiApiKey");
      localStorage.removeItem("youtubeApiKey");
      localStorage.removeItem("themeMode");

      setOpenaiKey("");
      setYoutubeKey("");
      setThemeMode("auto");

      setStatus("🧹 Cleared everything successfully!");
      document.dispatchEvent(new Event("themeUpdated"));

      setTimeout(() => setStatus(""), 2500);
    } catch {
      setStatus("❌ Failed to clear keys.");
    }
  };

  return (
    <div className="settings-container cyber-border">
      <h2 className="cyber-title">⚙ Settings Control Hub</h2>

      <p className="settings-subtitle">
        Manage API keys and futuristic theme behavior 🔧
      </p>

      {/* THEME OPTIONS */}
      <div className="settings-card glitch-box">
        <h3 className="cyber-subtitle">Theme Mode 🎨</h3>
        <p className="settings-hint">
          Cyberpunk 🟣 / Hacker Matrix 🟩 auto-switch each refresh or choose one!
        </p>
        
        <select
          className="settings-input"
          value={themeMode}
          onChange={(e) => setThemeMode(e.target.value)}
        >
          <option value="auto">Auto Switch</option>
          <option value="cyberpunk">Cyberpunk</option>
          <option value="hacker">Hacker Matrix</option>
        </select>
      </div>

      {/* OPENAI KEY */}
      <div className="settings-card">
        <h3>OpenAI API Key</h3>
        <input
          type="password"
          className="settings-input"
          placeholder="sk-***************"
          value={openaiKey}
          onChange={(e) => setOpenaiKey(e.target.value)}
        />
      </div>

      {/* YOUTUBE KEY */}
      <div className="settings-card">
        <h3>YouTube API Key</h3>
        <input
          type="password"
          className="settings-input"
          placeholder="AIza************"
          value={youtubeKey}
          onChange={(e) => setYoutubeKey(e.target.value)}
        />
      </div>

      {/* ACTION BUTTONS */}
      <div className="settings-actions">
        <button className="settings-btn primary" onClick={handleSave}>
          💾 Save
        </button>
        <button className="settings-btn danger" onClick={handleClear}>
          🧹 Reset
        </button>
      </div>

      {status && <p className="settings-status">{status}</p>}
    </div>
  );
};

export default Settings;
