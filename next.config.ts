import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@schoolbase/database"],
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
