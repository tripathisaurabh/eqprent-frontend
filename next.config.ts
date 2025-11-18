// frontend/next.config.ts

const nextConfig = {
  experimental: {
    serverExternalPackages: ["bcrypt", "@prisma/client"],
  },

  // ⭐ Required for displaying Supabase images in Next.js
  images: {
    domains: [
      "xgtvxtvvbnavqhaqfzvi.supabase.co", // your Supabase domain
    ],
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5001/api/:path*", 
      },
    ];
  },
};

export default nextConfig;
