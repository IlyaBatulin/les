import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("categories").select("*").order("name")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Organize categories into a hierarchical structure
  const rootCategories: any[] = []
  const categoryMap = new Map()

  // First pass: create a map of all categories
  data.forEach((category: any) => {
    categoryMap.set(category.id, { ...category, subcategories: [] })
  })

  // Second pass: build the hierarchy
  data.forEach((category: any) => {
    const categoryWithSubs = categoryMap.get(category.id)

    if (category.parent_id === null) {
      rootCategories.push(categoryWithSubs)
    } else {
      const parentCategory = categoryMap.get(category.parent_id)
      if (parentCategory) {
        parentCategory.subcategories.push(categoryWithSubs)
      }
    }
  })

  return NextResponse.json(rootCategories)
}
