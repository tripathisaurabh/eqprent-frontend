// frontend/lib/apiConfig.js
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://heavyequiments.onrender.com";

export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const res = await fetch(url, options);
  if (!res.ok) {
    console.error(`❌ API Error [${res.status}]: ${url}`);
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json();
};
