import { NextResponse } from "next/server"

import { editCategory, removeCategory } from "@/lib/admin-catalog"
import { authorizeAdminRequest, adminErrorResponse } from "@/lib/admin-http"
import { revalidateCatalog } from "@/lib/revalidate-catalog"
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await authorizeAdminRequest(request)
  if (denied) return denied
  try {
    const result = await editCategory((await params).id, await request.json())
    revalidateCatalog()
    return NextResponse.json(result)
  } catch (error) { return adminErrorResponse(error) }
}
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await authorizeAdminRequest(request)
  if (denied) return denied
  try {
    await removeCategory((await params).id)
    revalidateCatalog()
    return NextResponse.json({ ok: true })
  } catch (error) { return adminErrorResponse(error) }
}
