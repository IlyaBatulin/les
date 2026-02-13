import { NextResponse } from "next/server"
import { writeFile, mkdir } from "node:fs/promises"
import path from "node:path"
import { checkAdminSession } from "@/lib/admin-auth"

export const runtime = "nodejs"

export async function POST(request: Request) {
  if (!(await checkAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file" }, { status: 400 })
    }
    const ext = path.extname(file.name) || ".jpg"
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
    const dir = path.join(process.cwd(), "public", "uploads")
    await mkdir(dir, { recursive: true })
    const buf = Buffer.from(await file.arrayBuffer())
    await writeFile(path.join(dir, name), buf)
    const url = `/uploads/${name}`
    return NextResponse.json({ url })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed"
    console.error("Upload error:", e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
