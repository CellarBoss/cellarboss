import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.APP_VERSION ?? "development",
  },
  output: "standalone",
  // Trace files from the monorepo root so workspace packages (packages/*)
  // are included in the standalone bundle.
  outputFileTracingRoot: path.resolve(__dirname, "../../"),
  reactCompiler: true,
  transpilePackages: ["@cellarboss/types", "@cellarboss/validators"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
