import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  env: {
    API: process.env.API_URL,
  },
};

export default nextConfig;
