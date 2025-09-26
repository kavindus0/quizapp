import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["172.19.55.198"],
  eslint: {
    // Disable ESLint during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript checking during builds
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_CONVEX_URL: "https://wry-goldfinch-589.convex.cloud",
  },
};

export default nextConfig;
