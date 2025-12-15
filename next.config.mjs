/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Включаем оптимизацию изображений
    unoptimized: false,
    // Разрешаем загрузку изображений из Supabase
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
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