import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // 本地开发时显式指定 root，减少自动探测带来的卡顿。
    root: process.cwd(),
  },
};

export default nextConfig;
