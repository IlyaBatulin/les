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
import { XCircle, Loader2 } from "lucide-react"

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

  const setFileFromBlob = (file: File) => {
    if (!file.type.startsWith("image/")) return
    setImageFile(file)
    setUploadError(null)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFileFromBlob(e.target.files[0])
    else {
      setImageFile(null)
      setImagePreview(null)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0]
    if (file) setFileFromBlob(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const file = e.clipboardData.files?.[0]
    if (file?.type.startsWith("image/")) {
      e.preventDefault()
      setFileFromBlob(file)
    }
  }

  const clearImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null
    setIsUploading(true)
    setUploadError(null)
    try {
      const formData = new FormData()
      formData.append("file", imageFile)
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData, credentials: "include" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = data.error || "Ошибка загрузки"
        setUploadError(msg)
        return null
      }
      return data.url || null
    } catch {
      setUploadError("Ошибка загрузки")
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
      let imageUrl: string | null = null
      if (imageFile) {
        imageUrl = await uploadImage()
        if (imageUrl === null) {
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
        <div
          className="border border-dashed border-gray-300 rounded-md p-4 hover:bg-gray-50 cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onPaste={handlePaste}
        >
          <p className="text-sm text-gray-600">Выберите файл, перетащите или вставьте (Ctrl+V)</p>
        </div>
        <Input 
          id="image" 
          type="file" 
          ref={fileInputRef}
          accept="image/*" 
          onChange={handleImageChange}
          className="hidden"
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
