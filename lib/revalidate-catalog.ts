import { revalidatePath } from "next/cache"
export function revalidateCatalog() {
  for (const path of ["/", "/catalog", "/admin/products", "/admin/categories"]) revalidatePath(path)
  revalidatePath("/product/[id]", "page")
}
