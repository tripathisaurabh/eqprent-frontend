// lib/image.js

const BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001"
).replace(/\/$/, "");

export function normalizeImages(images) {
  if (!Array.isArray(images)) return [];

  return images
    .map((img) => {
      if (!img) return null;

      // --------------------
      // CASE 1 — direct string
      // --------------------
      if (typeof img === "string") {
        const url = img.trim();
        if (url.startsWith("http")) return url;
        return `${BASE_URL}${url.startsWith("/") ? url : "/" + url}`;
      }

      // --------------------
      // CASE 2 — object with url field
      // --------------------
      if (typeof img === "object" && typeof img.url === "string") {
        const url = img.url.trim();
        if (url.startsWith("http")) return url;
        return `${BASE_URL}${url.startsWith("/") ? url : "/" + url}`;
      }

      return null;
    })
    .filter(Boolean);
}
