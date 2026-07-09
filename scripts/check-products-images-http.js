// Проверка доступности изображений товаров по HTTP (200/3xx vs 4xx/5xx)
// Требует запущенного dev-сервера: npm run dev
// Запуск: node scripts/check-products-images-http.js

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function fetchStatus(url) {
  // HEAD часто быстрее, но некоторые хосты его блокируют — тогда пробуем GET
  try {
    const head = await fetch(url, { method: "HEAD" })
    return { ok: head.ok, status: head.status, method: "HEAD" }
  } catch {
    // ignore
  }

  try {
    const get = await fetch(url, { method: "GET" })
    return { ok: get.ok, status: get.status, method: "GET" }
  } catch (e) {
    return { ok: false, status: 0, method: "ERR", error: e?.message || String(e) }
  }
}

async function main() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const apiUrl = `${baseUrl}/api/products?limit=500`

  console.log(`📡 Products API: ${apiUrl}`)
  const res = await fetch(apiUrl)
  if (!res.ok) {
    throw new Error(`Products API failed: HTTP ${res.status}`)
  }
  const products = await res.json()
  if (!Array.isArray(products) || products.length === 0) {
    console.log("⚠️  Нет товаров")
    return
  }

  const urls = products
    .map((p) => ({ id: p?.id, name: p?.name, url: (p?.image_url || "").trim() }))
    .filter((x) => x.url)
    .map((x) => {
      // В БД может храниться относительный путь /uploads/...
      if (x.url.startsWith("/")) return { ...x, url: `${baseUrl}${x.url}` }
      return x
    })

  console.log(`📦 Товаров: ${products.length}`)
  console.log(`🖼️  URL картинок: ${urls.length}`)

  const concurrency = 10
  let idx = 0
  const bad = []

  async function worker(workerId) {
    while (idx < urls.length) {
      const cur = urls[idx++]
      const result = await fetchStatus(cur.url)
      if (!result.ok) {
        bad.push({ ...cur, ...result })
        console.log(`❌ [${workerId}] ${result.status} ${cur.url} (ID=${cur.id})`)
      }
      // маленькая пауза, чтобы не DDOS'ить s3
      await sleep(25)
    }
  }

  await Promise.all(Array.from({ length: concurrency }, (_, i) => worker(i + 1)))

  console.log("")
  if (bad.length === 0) {
    console.log("✅ Все изображения отдаются без ошибок.")
    return
  }

  const byStatus = bad.reduce((acc, x) => {
    const key = String(x.status)
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  console.log(`⚠️  Проблемных изображений: ${bad.length}`)
  console.log("📊 По статусам:", byStatus)
  console.log("")
  console.log("Примеры (первые 20):")
  bad.slice(0, 20).forEach((x) => {
    console.log(`- HTTP ${x.status} (${x.method}) | ID=${x.id} | ${x.name}`)
    console.log(`  ${x.url}`)
  })
}

main().catch((e) => {
  console.error("❌ Ошибка:", e?.message || e)
  process.exit(1)
})

