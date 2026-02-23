import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 네트워크 IP(183.98.94.40)로 접속 시 교차 출처 경고 및 파일 접근 오류 방지
  allowedDevOrigins: ["http://183.98.94.40:3000", "http://localhost:3000"],
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
