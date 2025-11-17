// frontend/lib/apiConfig.js

// 🔗 Ensure backend URL is always correct
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "https://heavyequiments.onrender.com"
).replace(/\/$/, ""); // Remove trailing slash if any

// 🧠 Safe fetch wrapper (auto handles / prefix)
export const apiFetch = async (endpoint, options = {}) => {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });

    if (!res.ok) {
      console.error(`❌ API Error [${res.status}]: ${url}`);
      throw new Error(`Request failed: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error(`❌ Fetch failed: ${url}`, err);
    throw err;
  }
};
