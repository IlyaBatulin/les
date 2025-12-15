"use client"


import React, { Fragment } from "react"

import { useState } from "react"
import type { Category } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addProduct } from "@/app/admin/products/actions"
import { createClientSupabaseClient } from "@/lib/supabase"
import { Loader2, Upload, Plus, Trash } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface AddProductFormProps {
  categories: Category[]
}

export default function AddProductForm({ categories }: AddProductFormProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [unit, setUnit] = useState("шт")
  const [stock, setStock] = useState("0")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Характеристики товара в формате JSON
  const [characteristics, setCharacteristics] = useState<Record<string, string>>({})
  const [newCharKey, setNewCharKey] = useState("")
  const [newCharValue, setNewCharValue] = useState("")

  const router = useRouter()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
      setUploadError(null) // Сбрасываем ошибку при выборе нового файла
    }
  }

  const uploadImage = async () => {
    if (!imageFile) return null

    setIsUploading(true)
    setUploadError(null)

    try {
      const supabase = createClientSupabaseClient()
      const fileExt = imageFile.name.split(".").pop()
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `${fileName}`

      // Загружаем файл в хранилище
      const { data, error } = await supabase.storage.from("product").upload(filePath, imageFile)

      if (error) {
        console.error("Ошибка при загрузке изображения:", error)
        setUploadError(`Ошибка загрузки: ${error.message}`)
        return null
      }

      // Получаем публичный URL для загруженного изображения
      const {
        data: { publicUrl },
      } = supabase.storage.from("product").getPublicUrl(filePath)

      return publicUrl
    } catch (error: any) {
      console.error("Ошибка при загрузке изображения:", error)
      setUploadError(`Ошибка загрузки: ${error.message || "Неизвестная ошибка"}`)
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setUploadError(null)

    try {
      // Загружаем изображение, если оно выбрано
      let imageUrlToSave = imageUrl
      if (imageFile) {
        const uploadedUrl = await uploadImage()
        if (uploadedUrl) {
          imageUrlToSave = uploadedUrl
        } else if (uploadError) {
          // Если есть ошибка загрузки, прерываем отправку формы
          setIsSubmitting(false)
          return
        }
      }

      await addProduct({
        name,
        description: description || null,
        price: Number.parseFloat(price),
        price_per_cubic: null, // Пока не используем
        image_url: imageUrlToSave || null,
        category_id: Number.parseInt(categoryId),
        unit,
        stock: Number.parseInt(stock),
        characteristics,
      })

      toast({
        title: "Товар добавлен",
        description: "Товар успешно добавлен в каталог",
      })

      router.push("/admin/products")
      router.refresh() // Важно для обновления списка товаров
    } catch (error: any) {
      console.error("Ошибка при добавлении товара:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось добавить товар. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addCharacteristic = () => {
    if (newCharKey.trim() && newCharValue.trim()) {
      setCharacteristics((prev) => ({
        ...prev,
        [newCharKey.trim()]: newCharValue.trim(),
      }))
      setNewCharKey("")
      setNewCharValue("")
    }
  }

  const removeCharacteristic = (key: string) => {
    setCharacteristics((prev) => {
      const newCharacteristics = { ...prev }
      delete newCharacteristics[key]
      return newCharacteristics
    })
  }

  // Предустановленные шаблоны характеристик для разных категорий
  const characteristicTemplates = {
    lumber: {
      wood_type: "",
      thickness: "",
      width: "",
      length: "",
      grade: "",
      moisture: "",
      surface_treatment: "",
      purpose: "",
    },
    tools: {
      power: "",
      weight: "",
      dimensions: "",
      warranty: "",
      manufacturer: "",
      country: "",
      features: "",
    },
    roofing: {
      material: "",
      thickness: "",
      width: "",
      length: "",
      color: "",
      coating: "",
      warranty: "",
    },
  }

  const applyTemplate = (template: string) => {
    setCharacteristics((prev) => ({
      ...prev,
      ...characteristicTemplates[template as keyof typeof characteristicTemplates],
    }))
  }

  // Organize categories into a hierarchical structure for better display
  const organizedCategories = organizeCategories(categories)

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border rounded-md p-4">
      <Tabs defaultValue="basic">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Основная информация</TabsTrigger>
          <TabsTrigger value="characteristics">Характеристики</TabsTrigger>
          <TabsTrigger value="image">Изображение</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Название товара</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Цена (₽)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Единица измерения</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите единицу" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="шт">шт</SelectItem>
                  <SelectItem value="м²">м²</SelectItem>
                  <SelectItem value="м³">м³</SelectItem>
                  <SelectItem value="кг">кг</SelectItem>
                  <SelectItem value="тонна">тонна</SelectItem>
                  <SelectItem value="мешок">мешок</SelectItem>
                  <SelectItem value="рулон">рулон</SelectItem>
                  <SelectItem value="лист">лист</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Количество на складе</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Категория</Label>
              <Select value={categoryId} onValueChange={setCategoryId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>{renderCategoryOptions(organizedCategories)}</SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="characteristics" className="space-y-4 pt-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <Button type="button" size="sm" variant="outline" onClick={() => applyTemplate("lumber")}>
              Шаблон для пиломатериалов
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => applyTemplate("tools")}>
              Шаблон для инструментов
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => applyTemplate("roofing")}>
              Шаблон для кровли
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {Object.entries(characteristics).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <Input
                      value={key}
                      onChange={(e) => {
                        const newKey = e.target.value
                        setCharacteristics((prev) => {
                          const newCharacteristics = { ...prev }
                          delete newCharacteristics[key]
                          newCharacteristics[newKey] = value
                          return newCharacteristics
                        })
                      }}
                      placeholder="Название характеристики"
                      className="flex-1"
                    />
                    <Input
                      value={value}
                      onChange={(e) => {
                        setCharacteristics((prev) => ({
                          ...prev,
                          [key]: e.target.value,
                        }))
                      }}
                      placeholder="Значение"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCharacteristic(key)}
                      className="flex-shrink-0"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <div className="flex items-center gap-2">
                  <Input
                    value={newCharKey}
                    onChange={(e) => setNewCharKey(e.target.value)}
                    placeholder="Название характеристики"
                    className="flex-1"
                  />
                  <Input
                    value={newCharValue}
                    onChange={(e) => setNewCharValue(e.target.value)}
                    placeholder="Значение"
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addCharacteristic()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={addCharacteristic}
                    className="flex-shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="image" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Изображение товара</Label>
            <div className="flex flex-col gap-4">
              {imagePreview && (
                <div className="relative w-40 h-40 border rounded-md overflow-hidden">
                  <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 border border-dashed border-gray-300 rounded-md p-4 hover:bg-gray-50 transition-colors">
                    <Upload className="h-5 w-5 text-gray-400" />
                    <span>Выберите файл или перетащите его сюда</span>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </Label>

                {uploadError && <div className="text-sm text-red-500 mt-1">{uploadError}</div>}

                <p className="text-xs text-gray-500">Или укажите URL изображения (если оно уже загружено)</p>
                <Input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Button type="submit" disabled={isSubmitting || isUploading} className="w-full">
        {(isSubmitting || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isUploading ? "Загрузка изображения..." : isSubmitting ? "Добавление..." : "Добавить товар"}
      </Button>
    </form>
  )
}

// Helper function to organize categories into a hierarchical structure
function organizeCategories(categories: Category[]): Category[] {
  const rootCategories: Category[] = []
  const categoryMap = new Map<number, Category>()

  // First pass: create a map of all categories
  categories.forEach((category) => {
    categoryMap.set(category.id, { ...category, subcategories: [] })
  })

  // Second pass: build the hierarchy
  categories.forEach((category) => {
    const categoryWithSubs = categoryMap.get(category.id)!

    if (category.parent_id === null) {
      rootCategories.push(categoryWithSubs)
    } else {
      const parentCategory = categoryMap.get(category.parent_id)
      if (parentCategory) {
        if (!parentCategory.subcategories) {
          parentCategory.subcategories = []
        }
        parentCategory.subcategories.push(categoryWithSubs)
      }
    }
  })

  return rootCategories
}

// Helper function to render category options with proper indentation
function renderCategoryOptions(categories: Category[], level = 0): React.ReactNode {
  return categories.map((category) => (
    <Fragment key={category.id}>
      <SelectItem value={category.id.toString()}>
        {"\u00A0".repeat(level * 2)}
        {level > 0 ? "└ " : ""}
        {category.name}
      </SelectItem>
      {category.subcategories &&
        category.subcategories.length > 0 &&
        renderCategoryOptions(category.subcategories, level + 1)}
    </Fragment>
  ))
}
