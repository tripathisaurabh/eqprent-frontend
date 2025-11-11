// lib/image.js

export function normalizeImages(imagesInput) {
  // 🛡 Absolute safety — even if backend sends null, number, object, or anything weird
  try {
    const images = Array.isArray(imagesInput) ? imagesInput : [];

    return images
      .map((img) => {
        // If value is falsy
        if (!img) return null;

        // Case 1 — plain string (absolute or relative path)
        if (typeof img === "string") {
          return img.startsWith("http")
            ? img
            : `http://localhost:5001${img.startsWith("/") ? img : "/" + img}`;
        }

        // Case 2 — object with `url` field (string only)
        if (typeof img === "object") {
          const val = img.url;

          if (typeof val === "string") {
            return val.startsWith("http")
              ? val
              : `http://localhost:5001${val.startsWith("/") ? val : "/" + val}`;
          }

          // Case 2b — nested or invalid `url` (like { url: { path: "/a" } })
          if (val && typeof val === "object" && typeof val.path === "string") {
            return `http://localhost:5001${val.path.startsWith("/") ? val.path : "/" + val.path}`;
          }
        }

        // Case 3 — nested arrays
        if (Array.isArray(img)) {
          return normalizeImages(img)[0] || null;
        }

        // Fallback
        return null;
      })
      .filter((x) => typeof x === "string" && x.trim().length > 0);
  } catch (err) {
    console.error("❌ normalizeImages failed:", err);
    return [];
  }
}
