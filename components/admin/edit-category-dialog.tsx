"use client"

import type React from "react"
import { useState, useRef } from "react"
import Image from "next/image"
import type { Category } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { updateCategory } from "@/app/admin/categories/actions"
import { createClientSupabaseClient } from "@/lib/supabase"
import { XCircle, Loader2 } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

interface EditCategoryDialogProps {
  category: Category
  categories: Category[]
  onClose: () => void
}

export default function EditCategoryDialog({ category, categories, onClose }: EditCategoryDialogProps) {
  const [name, setName] = useState(category.name)
  const [description, setDescription] = useState(category.description || "")
  const [parentId, setParentId] = useState<string | undefined>(
    category.parent_id ? category.parent_id.toString() : undefined,
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(category.image_url)
  const [imageChanged, setImageChanged] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    const file = e.target.files[0]
    setImageFile(file)
    setImageChanged(true)
    setUploadError(null)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const clearImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setImageChanged(true)
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
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

      console.log("Загрузка файла:", fileName)

      // Загружаем файл в хранилище
      const { error } = await supabase.storage.from("product").upload(filePath, imageFile)

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
      console.error("Exception during upload:", error)
      setUploadError(`Ошибка загрузки: ${error.message || "Неизвестная ошибка"}`)
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmitting || isUploading) return

    setIsSubmitting(true)
    setUploadError(null)

    try {
      let imageUrl = category.image_url

      if (imageChanged) {
        if (imageFile) {
          imageUrl = await uploadImage()

          if (uploadError) {
            // Если есть ошибка загрузки, прерываем отправку формы
            setIsSubmitting(false)
            return
          }
        } else {
          imageUrl = null
        }
      }

      const parent_id = !parentId || parentId === "none" ? null : Number.parseInt(parentId)

      console.log("Sending data to server:", {
        id: category.id,
        name,
        description: description || null,
        parent_id,
        image_url: imageUrl,
      })

      await updateCategory({
        id: category.id,
        name,
        description: description || null,
        parent_id,
        image_url: imageUrl,
      })

      onClose()
    } catch (error) {
      console.error("Error updating category:", error)
      alert("Ошибка при обновлении категории")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter out the current category and its subcategories to prevent circular references
  const availableParentCategories = categories.filter(
    (c) => c.id !== category.id && !isSubcategoryOf(c, category.id, categories),
  )

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактировать категорию</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Название категории</Label>
            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Описание</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-parent">Родительская категория (опционально)</Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите родительскую категорию" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Нет (корневая категория)</SelectItem>
                {availableParentCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-image">Изображение категории (опционально)</Label>
            <Input id="edit-image" type="file" ref={fileInputRef} accept="image/*" onChange={handleImageChange} />

            {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}

            {imagePreview && (
              <div className="relative mt-2 inline-block">
                <div className="relative h-40 w-40 rounded-md overflow-hidden border border-gray-200">
                  <Image src={imagePreview || "/placeholder.svg"} alt={name} fill className="object-cover" />
                </div>
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 bg-white rounded-full text-red-500 hover:text-red-700"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {(isSubmitting || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploading ? "Загрузка изображения..." : isSubmitting ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Helper function to check if a category is a subcategory of another
function isSubcategoryOf(category: Category, potentialParentId: number, allCategories: Category[]): boolean {
  if (category.parent_id === potentialParentId) return true

  if (category.parent_id) {
    const parentCategory = allCategories.find((c) => c.id === category.parent_id)
    if (parentCategory) {
      return isSubcategoryOf(parentCategory, potentialParentId, allCategories)
    }
  }

  return false
}
