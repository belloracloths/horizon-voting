import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/:path*`, // Proxy to Backend
      },
      {
        source: '/rpc',
        destination: `${RPC_URL}`, // Proxy to Blockchain Node
      },
      {
        source: '/rpc/:path*',
        destination: `${RPC_URL}/:path*`, // Proxy to Blockchain Node
      }
    ]
  }
};

export default nextConfig;
