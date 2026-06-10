import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Jab bhi hum frontend se /api/ call karenge...
        source: "/api/:path*",
        // ...Next.js usko chupchap is URL par bhej dega (Bypassing CORS)
        destination: "http://4.224.186.213/evaluation-service/:path*",
      },
    ];
  },
};

export default nextConfig;