export interface Category {
  id: number
  name: string
  description: string | null
  parent_id: number | null
  image_url: string | null
  created_at: string
  updated_at: string
  subcategories?: Category[]
}

export interface Product {
  id: number
  name: string
  description: string | null
  price: number
  price_per_cubic?: number | null // Цена за кубический метр для пиломатериалов
  image_url: string | null
  category_id: number
  unit: string
  stock: number
  created_at: string
  updated_at: string
  category?: Category
  characteristics: Record<string, any>
}

export interface FilterOptions {
  categories: string[]
  [key: string]: string[]
}
