"use client"


import ProtectedRoute from "@/components/admin/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Настройки</h1>
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
      </div>
    </ProtectedRoute>
  )
}

function AccountSettings() {
  return <Card><CardHeader><CardTitle>Учетная запись</CardTitle></CardHeader>
    <CardContent><p className="text-gray-600">Логин и пароль администратора задаются в настройках сервера. Для их изменения обратитесь к администратору сервера. Смена пароля через эту страницу пока недоступна.</p></CardContent>
  </Card>
}
