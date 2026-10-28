import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/gio-hang', destination: '/san-pham', permanent: true },
      { source: '/thanh-toan', destination: '/lien-he', permanent: true },
      { source: '/dat-hang/:token', destination: '/lien-he', permanent: true },
      { source: '/don-hang-da-dat', destination: '/lien-he', permanent: true },
      { source: '/don-hang-da-dat/:id', destination: '/lien-he', permanent: true },
      { source: '/tra-cuu-don-hang', destination: '/lien-he', permanent: true },
      { source: '/dang-nhap', destination: '/admin/dang-nhap', permanent: true },
      { source: '/tai-khoan', destination: '/admin/dang-nhap', permanent: true },
      { source: '/tai-khoan/:path*', destination: '/admin/dang-nhap', permanent: true },
      { source: '/chinh-sach/chinh-sach-thanh-toan', destination: '/chinh-sach/dieu-khoan-dich-vu', permanent: true },
    ]
  },
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