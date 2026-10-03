"use server"
import { checkAdminSession } from "@/lib/admin-auth"
import { createCategory, editCategory, removeCategory } from "@/lib/admin-catalog"
import { revalidateCatalog } from "@/lib/revalidate-catalog"

export async function addCategory(input: unknown) {
  if (!(await checkAdminSession())) throw new Error("Необходим вход")
  const result = await createCategory(input)
  revalidateCatalog()
  return result
}
export async function updateCategory(input: { id: number } & Record<string, unknown>) {
  if (!(await checkAdminSession())) throw new Error("Необходим вход")
  const { id, ...data } = input
  const result = await editCategory(id, data)
  revalidateCatalog()
  return result
}
export async function deleteCategory(id: number) {
  if (!(await checkAdminSession())) throw new Error("Необходим вход")
  await removeCategory(id)
  revalidateCatalog()
}
