// lib/image.js

const BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001"
).replace(/\/$/, "");

export function normalizeImages(imagesInput) {
  try {
    const images = Array.isArray(imagesInput) ? imagesInput : [];

    return images
      .map((img) => {
        if (!img) return null;

        // CASE 1 — already absolute URL (Supabase)
        if (typeof img === "string" && img.startsWith("http")) {
          return img;
        }

        if (typeof img === "object" && typeof img.url === "string") {
          if (img.url.startsWith("http")) return img.url;
          return `${BASE_URL}${img.url.startsWith("/") ? img.url : "/" + img.url}`;
        }

        // CASE 2 — plain string but relative URL
        if (typeof img === "string") {
          return `${BASE_URL}${img.startsWith("/") ? img : "/" + img}`;
        }

        // CASE 3 — nested { url: { path: "/xxx" } }
        if (typeof img === "object" && img.url?.path) {
          return `${BASE_URL}${img.url.path.startsWith("/") ? img.url.path : "/" + img.url.path}`;
        }

        return null;
      })
      .filter(Boolean);
  } catch (e) {
    console.error("❌ normalizeImages failed:", e);
    return [];
  }
}
