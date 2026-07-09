/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    // Zen verification: позволяет обслуживать URL вида /zen_<token>.html через app router
    const rules = [
      {
        source: "/zen_:token.html",
        destination: "/zen/:token",
      },
    ]
    // В dev файлы /uploads лежат только на продакшен-сервере — проксируем туда
    if (process.env.NODE_ENV === "development") {
      rules.push({
        source: "/uploads/:path*",
        destination: "https://vyborplus.ru/uploads/:path*",
      })
    }
    return rules
  },
  experimental: {
    // Лимит для загрузки файлов (админка) — и dev, и production
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    // Оптимизация ВКЛЮЧЕНА: оригиналы на s3.regru.cloud весят 1-2 МБ,
    // Next.js сжимает их в webp-превью нужного размера — карточки грузятся в разы быстрее
    // Разрешаем загрузку изображений из S3 REG.RU и других источников
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.regru.cloud',
        port: '',
        // В базе могут быть разные префиксы (не только /product/)
        pathname: '/**',
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
      {
        protocol: 'https',
        hostname: 'www.vyborplus.ru',
        port: '',
        pathname: '/uploads/**',
      },
      // Демо-аватары и плейсхолдеры (главная страница / отзывы)
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        port: '',
        pathname: '/api/portraits/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      // Supabase Storage (встречается в image_url у категорий/товаров)
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
    // Кешируем оптимизированные изображения на 31 день — товарные фото меняются редко
    minimumCacheTTL: 2678400,
  },
}

export default nextConfig