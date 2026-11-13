import type { NextConfig } from "next";

const config: NextConfig = {
  turbopack: { root: process.cwd() },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "rickandmortyapi.com", pathname: "/api/character/avatar/**" }],
  },
};

export default config;
