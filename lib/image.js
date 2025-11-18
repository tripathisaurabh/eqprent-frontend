// lib/image.js

// Safe BASE_URL extraction — prevents crashes
const BASE_URL =
  (typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_API_URL &&
    process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")) ||
  "http://localhost:5001";

export function normalizeImages(imagesInput) {
  try {
    const images = Array.isArray(imagesInput) ? imagesInput : [];

    return images
      .map((img) => {
        if (!img) return null;

        // CASE 1 — absolute URL
        if (typeof img === "string" && img.startsWith("http")) return img;

        // CASE 2 — object with url
        if (typeof img === "object" && typeof img.url === "string") {
          if (img.url.startsWith("http")) return img.url;
          return `${BASE_URL}${img.url.startsWith("/") ? img.url : "/" + img.url}`;
        }

        // CASE 3 — plain string (relative)
        if (typeof img === "string") {
          return `${BASE_URL}${img.startsWith("/") ? img : "/" + img}`;
        }

        // CASE 4 — nested structure
        if (typeof img === "object" && img.url?.path) {
          const path = img.url.path;
          return `${BASE_URL}${path.startsWith("/") ? path : "/" + path}`;
        }

        return null;
      })
      .filter(Boolean);
  } catch (e) {
    console.error("❌ normalizeImages failed:", e);
    return [];
  }
}
