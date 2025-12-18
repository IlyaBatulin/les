/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Отключаем проверку приватных IP для изображений в dev-режиме
  experimental: {
    // Разрешаем загрузку изображений с приватных IP (только для dev)
    ...(process.env.NODE_ENV === 'development' && {
      serverActions: {
        bodySizeLimit: '2mb',
      },
    }),
  },
  images: {
    // Отключаем оптимизацию в dev-режиме, чтобы обойти блокировку приватных IP
    // В production оптимизация будет включена
    unoptimized: process.env.NODE_ENV === 'development',
    // Разрешаем загрузку изображений из Supabase
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'vccagsyqenvfttmghscn.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Форматы для оптимизации
    formats: ['image/webp', 'image/avif'],
    // Размеры для генерации
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Минимизация времени кеширования для быстрой загрузки
    minimumCacheTTL: 60,
  },
}

export default nextConfig