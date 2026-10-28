import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'chitinoid-funiculate-dakota.ngrok-free.dev',
    'provenly-nonwavering-jerri.ngrok-free.dev',
  ],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.fbcdn.net' },
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },

  // Alias cho Turbopack (Next.js 16+)
  turbopack: {
    resolveAlias: {
      '@': './src',
    },
  },

  // Giữ webpack cho production fallback
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
};

export default nextConfig;