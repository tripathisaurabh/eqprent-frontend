import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5001/api/:path*", // ✅ proxy to backend
      },
    ];
  },

  // 👇 Use the correct flag name (as of Next 15)
  experimental: {
    // ✅ The key is now `typedRoutes: true` etc., so we must wrap this under `serverComponentsExternalPackages`
    // but for allowed origins, the property is under `serverActions.allowedOrigins`
    // However, Next recently moved it under `serverExternalOrigins`.
    // The easiest fix (and officially supported) is:
    serverComponentsExternalPackages: [],
    // @ts-expect-error (allowedDevOrigins is experimental and not yet typed)
    allowedDevOrigins: [
      "http://localhost:3000",
    "http://45.115.54.111:3000",
    ],
  },
};

export default nextConfig;
