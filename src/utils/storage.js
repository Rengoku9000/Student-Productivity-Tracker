// src/utils/storage.js

// main "load" function
export const loadFromStorage = (key, defaultValue) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (err) {
    console.error("Storage load error:", err);
    return defaultValue;
  }
};

// main "save" function
export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error("Storage save error:", err);
  }
};

// ✅ ALIAS so all old code using getFromStorage still works
export const getFromStorage = loadFromStorage;
