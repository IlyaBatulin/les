import { NextRequest, NextResponse } from "next/server"
import { readFile } from "node:fs/promises"
import path from "node:path"

// Снимок публичного каталога используется только для локального просмотра.
export async function proxy(request: NextRequest) {
  if (process.env.NODE_ENV !== "development" || process.env.CATALOG_PREVIEW !== "1") {
    return NextResponse.next()
  }
  const dataDir = process.env.CATALOG_PREVIEW_DATA_DIR
  const { pathname, searchParams } = request.nextUrl
  if (request.method !== "GET" || !dataDir) {
    return NextResponse.json({ error: "Локальный просмотр: требуется подключение базы данных" }, { status: 503 })
  }
  const read = async (name: string) => JSON.parse((await readFile(path.join(dataDir, name), "utf8")).replace(/^\uFEFF/, ""))
  const categories = await read("live-categories.json")
  const children = (id: number | null): any[] => categories.filter((c: any) => c.parent_id === id).map((c: any) => ({ ...c, subcategories: children(c.id) }))
  if (pathname === "/api/categories") {
    const id = searchParams.get("id")
    const pathFor = searchParams.get("pathFor")
    if (pathFor) {
      const result = []
      let current = categories.find((c: any) => c.id === Number(pathFor))
      while (current) {
        result.unshift({ id: current.id, name: current.name })
        current = categories.find((c: any) => c.id === current.parent_id)
      }
      return NextResponse.json(result)
    }
    if (id) {
      const category = categories.find((c: any) => c.id === Number(id))
      return NextResponse.json({ ...category, subcategories: children(Number(id)) })
    }
    if (searchParams.has("flat")) return NextResponse.json(categories)
    const parent = searchParams.get("parent")
    return NextResponse.json(children(parent && parent !== "null" ? Number(parent) : null))
  }
  if (pathname === "/api/products") {
    let products = await read("live-products.json")
    const category = searchParams.get("category")
    if (category) {
      const ids = new Set<number>([Number(category)])
      const collect = (nodes: any[]) => nodes.forEach(c => { ids.add(c.id); collect(c.subcategories) })
      collect(children(Number(category)))
      products = products.filter((p: any) => ids.has(p.category_id))
    }
    const search = searchParams.get("search")?.toLowerCase()
    if (search) products = products.filter((p: any) => p.name.toLowerCase().includes(search))
    const limit = searchParams.get("limit")
    return NextResponse.json(limit ? products.slice(0, Number(limit)) : products)
  }
  if (pathname === "/api/testimonials") return NextResponse.json(await read("live-testimonials.json"))
  return NextResponse.json({ error: "Операция недоступна в локальном просмотре" }, { status: 503 })
}

export const config = { matcher: "/api/:path*" }
