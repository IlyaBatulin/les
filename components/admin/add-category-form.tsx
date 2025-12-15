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
import { addCategory } from "@/app/admin/categories/actions"
import { createClientSupabaseClient } from "@/lib/supabase"
import { XCircle, Loader2 } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

interface AddCategoryFormProps {
  categories: Category[]
}

export default function AddCategoryForm({ categories }: AddCategoryFormProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [parentId, setParentId] = useState<string | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setImageFile(null)
      setImagePreview(null)
      return
    }

    const file = e.target.files[0]
    setImageFile(file)
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
      const { error } = await supabase.storage
        .from("product")
        .upload(filePath, imageFile)
        
      if (error) {
        console.error("Ошибка при загрузке изображения:", error)
        setUploadError(`Ошибка загрузки: ${error.message}`)
        return null
      }
      
      // Получаем публичный URL для загруженного изображения
      const { data: { publicUrl } } = supabase.storage
        .from("product")
        .getPublicUrl(filePath)
        
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
      // Загружаем изображение, если оно выбрано
      let imageUrl = null
      
      if (imageFile) {
        imageUrl = await uploadImage()
        
        if (uploadError) {
          // Если есть ошибка загрузки, прерываем отправку формы
          setIsSubmitting(false)
          return
        }
      }
      
      const parent_id = parentId === "0" || !parentId ? null : Number.parseInt(parentId)
      
      console.log("Sending data to server:", {
        name,
        description: description || null,
        parent_id,
        image_url: imageUrl,
      })
      
      await addCategory({
        name,
        description: description || null,
        parent_id,
        image_url: imageUrl,
      })

      // Reset form
      setName("")
      setDescription("")
      setParentId(undefined)
      clearImage()
    } catch (error) {
      console.error("Error adding category:", error)
      alert("Ошибка при добавлении категории")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border rounded-md p-4">
      <div className="space-y-2">
        <Label htmlFor="name">Название категории</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Описание</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="parent">Родительская категория (опционально)</Label>
        <Select value={parentId} onValueChange={setParentId}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите родительскую категорию" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Нет (корневая категория)</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Изображение категории (опционально)</Label>
        <Input 
          id="image" 
          type="file" 
          ref={fileInputRef}
          accept="image/*" 
          onChange={handleImageChange} 
        />
        
        {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
        
        {imagePreview && (
          <div className="relative mt-2 inline-block">
            <div className="relative h-40 w-40 rounded-md overflow-hidden border border-gray-200">
              <Image 
                src={imagePreview} 
                alt="Preview" 
                fill 
                className="object-cover" 
              />
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

      <Button type="submit" disabled={isSubmitting || isUploading}>
        {(isSubmitting || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isUploading ? "Загрузка изображения..." : isSubmitting ? "Добавление..." : "Добавить категорию"}
      </Button>
    </form>
  )
}
