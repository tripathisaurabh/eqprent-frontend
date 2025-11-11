// ✅ frontend/lib/apiConfig.js
// Default to localhost for now (safe for development)
// ✅ Smart API base URL — works both locally and over LAN or public IP
// ✅ Auto-detect correct backend base URL
// ✅ Smart API base URL detection
export const API_BASE_URL =
  typeof window !== "undefined"
    ? window.location.hostname === "localhost"
      ? "http://localhost:5001"
      : `http://${window.location.hostname}:5001`
    : "http://localhost:5001";

/**
 * Optional helper for consistent fetch calls
 * Example: const data = await apiFetch("/api/equipments");
 */
export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const res = await fetch(url, options);
  if (!res.ok) {
    console.error(`❌ API Error [${res.status}]: ${url}`);
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json();
};
