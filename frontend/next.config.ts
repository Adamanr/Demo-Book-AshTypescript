import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/rpc/:path*",
        destination: "http://localhost:4000/rpc/:path*",
      },
    ];
  },
};

export default nextConfig;
