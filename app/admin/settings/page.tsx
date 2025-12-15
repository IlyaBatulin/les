"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/components/admin/auth-provider"
import ProtectedRoute from "@/components/admin/protected-route"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">��астройки</h1>
          <p className="text-gray-500 mt-2">Управление настройками системы</p>
        </div>

        <Tabs defaultValue="account" className="max-w-3xl">
          <TabsList>
            <TabsTrigger value="account">Учетная запись</TabsTrigger>
            <TabsTrigger value="store">Магазин</TabsTrigger>
            <TabsTrigger value="notifications">Уведомления</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <AccountSettings />
          </TabsContent>
          <TabsContent value="store">
            <Card>
              <CardHeader>
                <CardTitle>Настройки магазина</CardTitle>
                <CardDescription>Настройте параметры вашего магазина</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Эта функция находится в разработке</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Настройки уведомлений</CardTitle>
                <CardDescription>Настройте параметры уведомлений</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Эта функция находится в разработке</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <Toaster />
      </div>
    </ProtectedRoute>
  )
}

function AccountSettings() {
  const { updateCredentials } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || !password) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все поля",
        variant: "destructive",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Ошибка",
        description: "Пароли не совпадают",
        variant: "destructive",
      })
      return
    }

    updateCredentials(username, password)
    toast({
      title: "Успех",
      description: "Учетные данные успешно обновлены",
    })

    // Очистка полей формы
    setUsername("")
    setPassword("")
    setConfirmPassword("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Учетная запись</CardTitle>
        <CardDescription>Изменение учетных данных для входа в админ-панель</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Новый логин</Label>
            <Input
              id="username"
              placeholder="Введите новый логин"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Новый пароль</Label>
            <Input
              id="password"
              type="password"
              placeholder="Введите новый пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Подтверждение пароля</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Подтвердите новый пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="bg-green-600 hover:bg-green-700">
            Сохранить изменения
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
