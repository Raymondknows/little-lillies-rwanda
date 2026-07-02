import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  transpilePackages: ["@schoolbase/database"],
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
