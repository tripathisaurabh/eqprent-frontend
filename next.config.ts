// frontend/next.config.ts
const nextConfig = {
  experimental: {
    // ✅ rename this (Next.js 15+ moved it)
    serverExternalPackages: ["bcrypt", "@prisma/client"], // if you need them
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5001/api/:path*", // or your live backend
      },
    ];
  },
};

export default nextConfig;
