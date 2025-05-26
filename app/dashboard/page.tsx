"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Users, DollarSign, TrendingUp } from "lucide-react"
import {
  getUser,
  getChurchData,
  getNotifications,
  formatTimeAgo,
  type User,
  type ChurchData,
  type Notification,
} from "@/lib/fake-api"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [churchData, setChurchData] = useState<ChurchData | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const userData = getUser()
    if (!userData) {
      router.push("/login")
      return
    }

    setUser(userData)
    setChurchData(getChurchData())
    setNotifications(getNotifications())
  }, [router])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "event":
        return <Calendar className="h-5 w-5 text-blue-500" />
      case "announcement":
        return <Users className="h-5 w-5 text-green-500" />
      case "prayer":
        return <Calendar className="h-5 w-5 text-red-500" />
      case "birthday":
        return <Users className="h-5 w-5 text-purple-500" />
      case "finance":
        return <DollarSign className="h-5 w-5 text-yellow-500" />
      default:
        return <Users className="h-5 w-5 text-gray-500" />
    }
  }

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case "event":
        return "Evento"
      case "announcement":
        return "Anúncio"
      case "prayer":
        return "Oração"
      case "birthday":
        return "Aniversário"
      case "finance":
        return "Financeiro"
      default:
        return "Notificação"
    }
  }

  if (!user || !churchData) {
    return <div>Carregando...</div>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="ml-12 md:ml-0">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 text-sm md:text-base">{churchData.name}</p>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <div className="text-right hidden md:block">
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-600">{user.role}</p>
              </div>
              <Avatar className="h-8 w-8 md:h-10 md:w-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40&query=pastor+profile" />
                <AvatarFallback className="text-xs md:text-sm">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6">
            {/* Stats Cards - Apenas para Admin */}
            {user.accessLevel === "admin" && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs md:text-sm font-medium">Total de Membros</CardTitle>
                    <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg md:text-2xl font-bold">{churchData.members}</div>
                    <p className="text-xs text-muted-foreground">+12 este mês</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs md:text-sm font-medium">Eventos este Mês</CardTitle>
                    <Calendar className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg md:text-2xl font-bold">8</div>
                    <p className="text-xs text-muted-foreground">+2 da semana passada</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs md:text-sm font-medium">Dízimos e Ofertas</CardTitle>
                    <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg md:text-2xl font-bold">R$ 28.450</div>
                    <p className="text-xs text-muted-foreground">+15% vs mês anterior</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs md:text-sm font-medium">Crescimento</CardTitle>
                    <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg md:text-2xl font-bold">+5.2%</div>
                    <p className="text-xs text-muted-foreground">Últimos 3 meses</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Feed de Notificações */}
            <div className="max-w-2xl mx-auto pb-8">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Mural da Igreja</h2>

              <div className="space-y-4 md:space-y-6">
                {notifications.map((notification) => (
                  <Card key={notification.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 md:h-10 md:w-10">
                          <AvatarImage src="/placeholder.svg?height=40&width=40&query=church+member" />
                          <AvatarFallback className="text-xs md:text-sm">
                            {notification.author
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 text-sm md:text-base">{notification.author}</p>
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                              {getNotificationBadge(notification.type)}
                            </span>
                          </div>
                          <p className="text-xs md:text-sm text-gray-600">{formatTimeAgo(notification.timestamp)}</p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="flex items-center gap-2 mb-3">
                        {getNotificationIcon(notification.type)}
                        <h3 className="font-semibold text-gray-900 text-sm md:text-base">{notification.title}</h3>
                      </div>

                      <p className="text-gray-700 mb-4 text-sm md:text-base">{notification.content}</p>

                      {notification.image && (
                        <div className="mb-4 rounded-lg overflow-hidden">
                          <Image
                            src={notification.image || "/placeholder.svg"}
                            alt={notification.title}
                            width={500}
                            height={300}
                            className="w-full h-48 md:h-64 object-cover"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
