/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // Лимит для загрузки файлов (админка) — и dev, и production
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    // Отключаем оптимизацию — Next.js не будет загружать изображения сервером,
    // браузер грузит их напрямую с s3.regru.cloud (обходит блокировку приватных IP при VPN/DNS)
    unoptimized: true,
    // Разрешаем загрузку изображений из S3 REG.RU и других источников
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.regru.cloud',
        port: '',
        pathname: '/product/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'vyborplus.ru',
        port: '',
        pathname: '/uploads/**',
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