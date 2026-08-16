import path from "node:path";
import type { NextConfig } from "next";

const backend = process.env.BACKEND_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backend}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
