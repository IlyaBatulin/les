// Скрипт для проверки наличия изображений у товаров
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Читаем .env.local файл
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

loadEnv()

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Отсутствуют переменные окружения для Supabase')
  console.log('Проверьте файл .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkProducts() {
  console.log('🔍 Проверка товаров в базе данных...\n')
  console.log(`📡 Подключение к: ${supabaseUrl}\n`)

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, image_url')
    .order('id')

  if (error) {
    console.error('❌ Ошибка при загрузке товаров:', error.message)
    return
  }

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
    console.log('   1. Зайдите в админку: http://localhost:3002/admin/products')
    console.log('   2. Для каждого товара без фото загрузите изображение')
    console.log('   3. Или используйте те же переменные окружения, что на продакшене')
  } else {
    console.log('✅ У всех товаров есть изображения!')
  }

  if (productsWithImages.length > 0) {
    console.log('\n📸 Примеры товаров с изображениями:')
    productsWithImages.slice(0, 3).forEach(p => {
      console.log(`   - ID: ${p.id}, Название: ${p.name}`)
      console.log(`     URL: ${p.image_url?.substring(0, 80)}...`)
    })
  }
}

checkProducts().catch(console.error)

