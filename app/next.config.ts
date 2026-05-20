import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Permite hot-reload (HMR) de qualquer dispositivo na rede local
  allowedDevOrigins: [
    "localhost",
    "localhost:3000",
    "192.168.15.7",
    "192.168.15.7:3000",
    // wildcard para qualquer IP 192.168.x.x (celular, tablet, etc.)
    "*.192.168.15.*",
  ],
};

export default nextConfig;
