import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a phone on the same Wi-Fi reach the dev server. Hostname only, no scheme or port.
  allowedDevOrigins: ["192.168.1.9", "*.local"],
};

export default nextConfig;
