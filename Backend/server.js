import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

// Load environment variables from .env file
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Debugging: Check if API key is loaded (only prints first 10 chars for security)
const apiKey = process.env.OPENROUTER_API_KEY;
if (apiKey) {
  console.log(`✅ API Key loaded: ${apiKey.substring(0, 10)}...`);
} else {
  console.error("❌ API Key NOT found! Make sure your .env file is in the root folder.");
}

app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({ reply: "❌ API Key is missing in server configuration." });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        // "HTTP-Referer": "http://localhost:3000", // Optional: Your site URL
        // "X-Title": "My App"                      // Optional: Your site name
      },
      body: JSON.stringify({
        // FIX: Changed to a more reliable free model to avoid "No endpoints" error
        model: "mistralai/mistral-7b-instruct:free", 
        messages: messages,
        max_tokens: 300
      })
    });

    const data = await response.json();

    // Check if OpenRouter returned an error
    if (data.error) {
       console.error("OpenRouter Error:", data.error);
       return res.status(500).json({ reply: `⚠️ API Error: ${data.error.message}` });
    }

    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return res.json({ reply: "⚠️ Mistral returned no response." });
    }

    return res.json({ reply });
  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ reply: "❌ Server Error: " + err.message });
  }
});

app.listen(5000, () => console.log("🚀 Backend running on http://localhost:5000"));