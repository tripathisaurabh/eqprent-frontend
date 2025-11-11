// ✅ frontend/lib/apiConfig.js
// Works for both local dev (localhost) and production (Render backend)

const isBrowser = typeof window !== "undefined";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (isBrowser && window.location.hostname === "localhost"
    ? "http://localhost:5001" // Local backend
    : "https://heavyequiments.onrender.com"); // Production backend

/**
 * ✅ Unified helper for API calls
 * Example:
 *   const data = await apiFetch("/api/equipments");
 */
export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const res = await fetch(url, options);

  if (!res.ok) {
    console.error(`❌ API Error [${res.status}] → ${url}`);
    throw new Error(`Request failed: ${res.status}`);
  }

  return res.json();
};
