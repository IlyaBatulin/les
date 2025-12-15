import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categoryIds = searchParams.getAll("category")
  const woodTypes = searchParams.getAll("woodType")
  const thicknesses = searchParams.getAll("thickness")
  const widths = searchParams.getAll("width")
  const lengths = searchParams.getAll("length")
  const grades = searchParams.getAll("grade")
  const moistures = searchParams.getAll("moisture")
  const surfaceTreatments = searchParams.getAll("surfaceTreatment")
  const purposes = searchParams.getAll("purpose")
  const search = searchParams.get("search")
  const sort = searchParams.get("sort") || "default"

  const supabase = createServerSupabaseClient()

  let query = supabase.from("products").select(`
      *,
      category:categories(id, name)
    `)

  // Apply filters
  if (categoryIds.length > 0) {
    // Get all subcategory IDs for the given categories
    const allCategoryIds = []
    for (const categoryId of categoryIds) {
      const subcategoryIds = await getAllSubcategoryIds(Number.parseInt(categoryId))
      allCategoryIds.push(Number.parseInt(categoryId), ...subcategoryIds)
    }

    // Filter products by all these category IDs
    query = query.in("category_id", [...new Set(allCategoryIds)])
  }

  if (woodTypes.length > 0) {
    query = query.in("wood_type", woodTypes)
  }

  if (thicknesses.length > 0) {
    query = query.in("thickness", thicknesses)
  }

  if (widths.length > 0) {
    query = query.in("width", widths)
  }

  if (lengths.length > 0) {
    query = query.in("length", lengths)
  }

  if (grades.length > 0) {
    query = query.in("grade", grades)
  }

  if (moistures.length > 0) {
    query = query.in("moisture", moistures)
  }

  if (surfaceTreatments.length > 0) {
    query = query.in("surface_treatment", surfaceTreatments)
  }

  if (purposes.length > 0) {
    query = query.in("purpose", purposes)
  }

  if (search) {
    query = query.ilike("name", `%${search}%`)
  }

  // Apply sorting
  switch (sort) {
    case "price-asc":
      query = query.order("price", { ascending: true })
      break
    case "price-desc":
      query = query.order("price", { ascending: false })
      break
    case "name-asc":
      query = query.order("name", { ascending: true })
      break
    case "name-desc":
      query = query.order("name", { ascending: false })
      break
    default:
      query = query.order("name", { ascending: true })
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// Helper function to get all subcategory IDs recursively
async function getAllSubcategoryIds(categoryId: number): Promise<number[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("categories").select("id").eq("parent_id", categoryId)

  if (error || !data || data.length === 0) {
    return []
  }

  const directSubcategoryIds = data.map((cat) => cat.id)

  // Recursively get subcategories of subcategories
  const nestedSubcategoryIds = await Promise.all(directSubcategoryIds.map((id) => getAllSubcategoryIds(id)))

  // Flatten the array of arrays
  return [...directSubcategoryIds, ...nestedSubcategoryIds.flat()]
}
