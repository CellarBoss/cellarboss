import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  transpilePackages: ["@cellarboss/types", "@cellarboss/validators"],
};

export default nextConfig;
