// lib/image.js

// 🌐 Global backend URL (loaded from Vercel / local environment)
const BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001"
).replace(/\/$/, ""); // remove trailing slash

/**
 * Normalize image URLs received from backend.
 * Works with:
 * - plain string path
 * - absolute URLs (http/https)
 * - objects with { url: "/uploads/a.jpg" }
 * - objects with nested { url: { path: "/uploads/a.jpg" } }
 * - arrays inside arrays
 * - null / undefined / weird values
 */
export function normalizeImages(imagesInput) {
  try {
    const images = Array.isArray(imagesInput) ? imagesInput : [];

    return images
      .map((img) => {
        if (!img) return null;

        // ---------------------------
        // CASE 1 — Plain string
        // ---------------------------
        if (typeof img === "string") {
          return img.startsWith("http")
            ? img
            : `${BASE_URL}${img.startsWith("/") ? img : "/" + img}`;
        }

        // ---------------------------
        // CASE 2 — Object with url field
        // ---------------------------
        if (typeof img === "object") {
          const url = img.url;

          // CASE 2a — valid URL string
          if (typeof url === "string") {
            return url.startsWith("http")
              ? url
              : `${BASE_URL}${url.startsWith("/") ? url : "/" + url}`;
          }

          // CASE 2b — { url: { path: "/xxx" } }
          if (url && typeof url === "object" && typeof url.path === "string") {
            return `${BASE_URL}${url.path.startsWith("/") ? url.path : "/" + url.path}`;
          }
        }

        // ---------------------------
        // CASE 3 — Nested arrays
        // ---------------------------
        if (Array.isArray(img)) {
          return normalizeImages(img)[0] || null;
        }

        return null;
      })
      .filter((x) => typeof x === "string" && x.trim() !== "");
  } catch (err) {
    console.error("❌ normalizeImages failed:", err);
    return [];
  }
}
