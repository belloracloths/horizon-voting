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
      {
        source: '/rpc',
        destination: 'http://blockchain:8545', // Proxy to Blockchain Node
      },
      {
        source: '/rpc/:path*',
        destination: 'http://blockchain:8545/:path*', // Proxy to Blockchain Node
      }
    ]
  }
};

export default nextConfig;
