import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend:3001/:path*', // Proxy to Backend
      },
    ]
  }
};

export default nextConfig;
