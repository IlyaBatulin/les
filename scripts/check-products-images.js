// Скрипт для проверки наличия изображений у товаров
// Использует fetch к /api/products (требует запущенного dev-сервера: npm run dev)

const fs = require('fs')
const path = require('path')

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/)
      if (match) {
        const key = match[1].trim()
        const value = match[2].trim().replace(/^["']|["']$/g, '')
        process.env[key] = value
      }
    })
  }
}

async function checkProducts() {
  loadEnv()

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  console.log('🔍 Проверка товаров через API...\n')
  console.log(`📡 URL: ${baseUrl}/api/products\n`)

  try {
    const res = await fetch(`${baseUrl}/api/products?limit=500`)
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }
    const products = await res.json()

    if (!products || products.length === 0) {
      console.log('⚠️  В базе нет товаров')
      return
    }

    const totalProducts = products.length
    const productsWithImages = products.filter(p => p.image_url && p.image_url.trim() !== '')
    const productsWithoutImages = products.filter(p => !p.image_url || p.image_url.trim() === '')

    console.log(`📊 Статистика:`)
    console.log(`   Всего товаров: ${totalProducts}`)
    console.log(`   ✅ С изображениями: ${productsWithImages.length}`)
    console.log(`   ❌ Без изображений: ${productsWithoutImages.length}\n`)

    if (productsWithoutImages.length > 0) {
      console.log('📋 Товары без изображений:')
      productsWithoutImages.slice(0, 10).forEach(p => {
        console.log(`   - ID: ${p.id}, Название: ${p.name}`)
      })
      if (productsWithoutImages.length > 10) {
        console.log(`   ... и еще ${productsWithoutImages.length - 10} товаров`)
      }
      console.log('\n💡 Решение:')
      console.log('   1. Зайдите в админку: /admin/products')
      console.log('   2. Для каждого товара без фото загрузите изображение')
    } else {
      console.log('✅ У всех товаров есть изображения!')
    }

    if (productsWithImages.length > 0) {
      console.log('\n📸 Примеры товаров с изображениями:')
      productsWithImages.slice(0, 3).forEach(p => {
        const url = p.image_url || ''
        console.log(`   - ID: ${p.id}, Название: ${p.name}`)
        console.log(`     URL: ${url.substring(0, 80)}${url.length > 80 ? '...' : ''}`)
      })
    }
  } catch (err) {
    console.error('❌ Ошибка:', err.message)
    console.log('\n💡 Убедитесь, что dev-сервер запущен: npm run dev')
    process.exit(1)
  }
}

checkProducts().catch(console.error)
