"use server"
import { checkAdminSession } from "@/lib/admin-auth"
import { createProduct, editProduct, removeProduct } from "@/lib/admin-catalog"
import { revalidateCatalog } from "@/lib/revalidate-catalog"

export async function addProduct(input: unknown) {
  if (!(await checkAdminSession())) throw new Error("Необходим вход")
  const result = await createProduct(input)
  revalidateCatalog()
  return result
}
export async function updateProduct(input: { id: number } & Record<string, unknown>) {
  if (!(await checkAdminSession())) throw new Error("Необходим вход")
  const { id, ...data } = input
  const result = await editProduct(id, data)
  revalidateCatalog()
  return result
}
export async function deleteProduct(id: number) {
  if (!(await checkAdminSession())) throw new Error("Необходим вход")
  await removeProduct(id)
  revalidateCatalog()
}
