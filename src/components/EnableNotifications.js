// src/components/EnableNotifications.js
import React, { useState } from "react";

// Read from CRA env (must be REACT_APP_VAPID_PUBLIC_KEY in frontend .env)
const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY || "";

// helper: base64 → Uint8Array
function urlBase64ToUint8Array(base64String) {
  if (!base64String) {
    throw new Error(
      "VAPID public key is empty. Set REACT_APP_VAPID_PUBLIC_KEY in frontend .env and restart npm start."
    );
  }

  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const outputArray = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) {
    outputArray[i] = raw.charCodeAt(i);
  }
  return outputArray;
}

export default function EnableNotifications() {
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState("");

  const registerAndSubscribe = async () => {
    try {
      setError("");

      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setError("Push notifications not supported in this browser.");
        return;
      }

      if (!VAPID_PUBLIC_KEY) {
        setError(
          "VAPID key missing. Set REACT_APP_VAPID_PUBLIC_KEY in frontend .env and restart npm start."
        );
        console.error("VAPID_PUBLIC_KEY is empty in frontend.");
        return;
      }

      console.log(
        "VAPID key (frontend, first 16 chars):",
        VAPID_PUBLIC_KEY.substring(0, 16) + "..."
      );

      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("✅ Service worker registered:", registration);

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setError("Please allow notifications in the browser.");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      console.log("✅ Push subscription:", subscription);

      await fetch("http://localhost:5000/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });

      setEnabled(true);
    } catch (err) {
      console.error("Notification setup error:", err);
      setError(err.message || "Failed to enable notifications.");
    }
  };

  return (
    <div style={{ marginBottom: "12px" }}>
      <button
        style={{
          background: enabled ? "#22c55e" : "#3b82f6",
          color: "#fff",
          padding: "10px 16px",
          borderRadius: "8px",
          border: "none",
          cursor: enabled ? "default" : "pointer",
          fontWeight: 600,
        }}
        onClick={registerAndSubscribe}
        disabled={enabled}
      >
        {enabled ? "Notifications Enabled ✅" : "Enable Class Notifications 🔔"}
      </button>

      {error && (
        <p style={{ marginTop: "8px", color: "#f97373", fontSize: "0.85rem" }}>
          {error}
        </p>
      )}
    </div>
  );
}
