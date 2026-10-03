import { NextResponse } from "next/server"
import { writeFile, mkdir } from "node:fs/promises"
import { randomUUID } from "node:crypto"
import sharp from "sharp"
import path from "node:path"
import { authorizeAdminRequest, adminErrorResponse } from "@/lib/admin-http"
import { AdminError } from "@/lib/admin-validation"
export const runtime = "nodejs"
const MAX_BYTES = 5 * 1024 * 1024
export async function POST(request: Request) {
  const denied = await authorizeAdminRequest(request)
  if (denied) return denied
  try {
    if (Number(request.headers.get("content-length")) > MAX_BYTES + 64 * 1024) throw new AdminError("Изображение должно быть не больше 5 МБ", 413)
    const formData = await request.formData()
    const file = formData.get("file")
    if (!(file instanceof File) || !file.size) throw new AdminError("Выберите изображение")
    if (file.size > MAX_BYTES) throw new AdminError("Изображение должно быть не больше 5 МБ", 413)
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) throw new AdminError("Допустимы JPEG, PNG, WebP и GIF", 415)
    let image: Buffer
    try {
      const source = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 40_000_000 })
      const metadata = await source.metadata()
      if (!["jpeg", "png", "webp", "gif"].includes(metadata.format || "")) throw new Error("Invalid image")
      image = await source.rotate().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toBuffer()
    } catch { throw new AdminError("Не удалось прочитать изображение", 415) }
    const name = `${randomUUID()}.webp`
    const dir = path.join(process.cwd(), "public", "uploads")
    await mkdir(dir, { recursive: true })
    await writeFile(path.join(dir, name), image, { flag: "wx" })
    return NextResponse.json({ url: `/uploads/${name}` })
  } catch (error) { return adminErrorResponse(error) }
}
