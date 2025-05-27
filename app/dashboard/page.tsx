"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar, Users, DollarSign, TrendingUp, ChevronLeft, ChevronRight, Star, Heart, Gift } from "lucide-react"
import {
  getUser,
  getChurchData,
  getNotifications,
  formatTimeAgo,
  fakeMembers,
  type User,
  type ChurchData,
  type Notification,
} from "@/lib/fake-api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [churchData, setChurchData] = useState<ChurchData | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [birthdays, setBirthdays] = useState<any[]>([])
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0)
  const [visibleNotifications, setVisibleNotifications] = useState(3)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  })
  const [userPhoto, setUserPhoto] = useState<string>("")

  // Banners de eventos
  const banners = [
    {
      id: 1,
      title: "Retiro de Jovens 2025",
      subtitle: "15-17 de Março",
      image: "/placeholder.svg?height=200&width=300&query=youth+retreat+banner",
      color: "from-blue-500 to-purple-600",
    },
    {
      id: 2,
      title: "Campanha de Oração",
      subtitle: "21 dias de jejum",
      image: "/placeholder.svg?height=200&width=300&query=prayer+campaign+banner",
      color: "from-green-500 to-teal-600",
    },
    {
      id: 3,
      title: "Escola Bíblica",
      subtitle: "Inscrições abertas",
      image: "/placeholder.svg?height=200&width=300&query=bible+school+banner",
      color: "from-orange-500 to-red-600",
    },
  ]

  // Banners de propaganda
  const promoBanners = [
    {
      id: 1,
      title: "Livraria Cristã",
      subtitle: "20% OFF em livros",
      icon: <Star className="h-6 w-6" />,
      color: "from-pink-500 to-rose-600",
      action: "Comprar Agora",
    },
    {
      id: 2,
      title: "Café da Igreja",
      subtitle: "Novos sabores disponíveis",
      icon: <Heart className="h-6 w-6" />,
      color: "from-amber-500 to-orange-600",
      action: "Ver Cardápio",
    },
    {
      id: 3,
      title: "Bazar Beneficente",
      subtitle: "Ajude nossa comunidade",
      icon: <Gift className="h-6 w-6" />,
      color: "from-emerald-500 to-green-600",
      action: "Participar",
    },
  ]

  useEffect(() => {
    const userData = getUser()
    if (!userData) {
      router.push("/login")
      return
    }

    setUser(userData)
    setChurchData(getChurchData())
    setNotifications(getNotifications())
    setBirthdays(getBirthdaysThisWeek())
  }, [router])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length)
    }, 5000) // Troca a cada 5 segundos

    return () => clearInterval(interval)
  }, [banners.length])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % promoBanners.length)
    }, 4000) // Troca a cada 4 segundos (diferente do primeiro)

    return () => clearInterval(interval)
  }, [promoBanners.length])

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

  const getBirthdaysThisWeek = () => {
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)

    return fakeMembers
      .filter((member) => {
        const birthDate = new Date(member.birthDate)
        const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())
        return thisYearBirthday >= weekStart && thisYearBirthday <= weekEnd
      })
      .map((member) => ({
        ...member,
        birthdayThisYear: new Date(
          today.getFullYear(),
          new Date(member.birthDate).getMonth(),
          new Date(member.birthDate).getDate(),
        ),
      }))
      .sort((a, b) => a.birthdayThisYear.getTime() - b.birthdayThisYear.getTime())
  }

  const nextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length)
  }

  const prevBanner = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const nextPromo = () => {
    setCurrentPromoIndex((prev) => (prev + 1) % promoBanners.length)
  }

  const prevPromo = () => {
    setCurrentPromoIndex((prev) => (prev - 1 + promoBanners.length) % promoBanners.length)
  }

  const loadMoreNotifications = () => {
    setVisibleNotifications((prev) => prev + 5)
  }

  const openProfileModal = () => {
    if (user) {
      setEditingUser({
        name: user.name,
        email: user.email || "",
        phone: user.phone || "",
        role: user.role,
      })
      setIsProfileModalOpen(true)
    }
  }

  const saveProfile = () => {
    // Aqui você implementaria a lógica para salvar os dados
    console.log("Salvando perfil:", editingUser)
    setIsProfileModalOpen(false)
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setUserPhoto(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const displayedNotifications = notifications.slice(0, visibleNotifications)
  const hasMoreNotifications = visibleNotifications < notifications.length

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
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
              <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
                <DialogTrigger asChild>
                  <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    {/* Mobile: foto em cima, nome embaixo */}
                    <div className="flex flex-col items-center md:hidden">
                      <Avatar className="h-8 w-8 hover:opacity-80 transition-opacity">
                        <AvatarImage src={userPhoto || "/placeholder.svg?height=40&width=40&query=pastor+profile"} />
                        <AvatarFallback className="text-xs">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <p className="font-medium text-gray-900 text-sm mt-1">{user.name}</p>
                    </div>

                    {/* Desktop: nome e foto lado a lado */}
                    <div className="hidden md:flex items-center gap-3">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <Avatar className="h-10 w-10 hover:opacity-80 transition-opacity">
                        <AvatarImage src={userPhoto || "/placeholder.svg?height=40&width=40&query=pastor+profile"} />
                        <AvatarFallback className="text-sm">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Editar Perfil</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {/* Seção de foto */}
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative">
                        <Avatar className="h-20 w-20">
                          <AvatarImage src={userPhoto || "/placeholder.svg?height=80&width=80&query=pastor+profile"} />
                          <AvatarFallback className="text-lg">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          id="photo-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("photo-upload")?.click()}
                          className="text-sm"
                        >
                          Alterar Foto
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        value={editingUser.name}
                        onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editingUser.email}
                        onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={editingUser.phone}
                        onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Cargo</Label>
                      <Input id="role" value={editingUser.role} disabled className="bg-gray-100" />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={saveProfile}
                        className="flex-1"
                        style={{ backgroundColor: "#89f0e6", color: "#000" }}
                      >
                        Salvar
                      </Button>
                      <Button variant="outline" onClick={() => setIsProfileModalOpen(false)} className="flex-1">
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
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

            {/* Conteúdo Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
              {/* Feed de Notificações */}
              <div className="lg:col-span-2">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Mural da Igreja</h2>

                <div className="space-y-4 md:space-y-6">
                  {displayedNotifications.map((notification) => (
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
                      </CardContent>
                    </Card>
                  ))}

                  {/* Botão Ver Mais */}
                  {hasMoreNotifications && (
                    <div className="text-center py-6">
                      <Button
                        onClick={loadMoreNotifications}
                        variant="outline"
                        className="px-8 py-2 text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                      >
                        Ver mais posts ({notifications.length - visibleNotifications} restantes)
                      </Button>
                    </div>
                  )}

                  {/* Mensagem quando todos os posts foram carregados */}
                  {!hasMoreNotifications && notifications.length > 3 && (
                    <div className="text-center py-6">
                      <p className="text-gray-500 text-sm">Você viu todos os posts do mural! 🎉</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar - Aniversários e Banners */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-6 space-y-6">
                  {/* Versículo do Dia */}
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
                    <CardContent className="p-4">
                      <div className="text-center space-y-3">
                        <div className="text-sm font-medium text-blue-800 italic leading-relaxed">
                          "Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz
                          e não de mal, para vos dar o fim que esperais."
                        </div>
                        <div className="text-xs text-blue-600 font-semibold">Jeremias 29:11</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Aniversários da Semana */}
                  <Card>
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-purple-500" />
                        <CardTitle className="text-lg">Aniversários da Semana</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {birthdays.length > 0 ? (
                        <div className="space-y-3">
                          {birthdays.map((member) => (
                            <div key={member.id} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={member.photo || "/placeholder.svg?height=40&width=40&query=church+member"}
                                />
                                <AvatarFallback className="bg-purple-100 text-purple-700">
                                  {member.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 text-sm truncate">{member.name}</p>
                                <p className="text-xs text-gray-600">
                                  {member.birthdayThisYear.toLocaleDateString("pt-BR", {
                                    weekday: "short",
                                    day: "numeric",
                                    month: "short",
                                  })}
                                </p>
                                <p className="text-xs text-purple-600">
                                  {new Date().getFullYear() - new Date(member.birthDate).getFullYear()} anos
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 text-sm">Nenhum aniversário esta semana</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Carrossel de Banners de Eventos */}
                  <Card className="overflow-hidden">
                    <div className="relative h-48">
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${banners[currentBannerIndex].color} flex items-center justify-center text-white`}
                      >
                        <div className="text-center p-4">
                          <h3 className="text-lg font-bold mb-2">{banners[currentBannerIndex].title}</h3>
                          <p className="text-sm opacity-90">{banners[currentBannerIndex].subtitle}</p>
                        </div>
                      </div>

                      {/* Controles do carrossel */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
                        onClick={prevBanner}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
                        onClick={nextBanner}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>

                      {/* Indicadores */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                        {banners.map((_, index) => (
                          <button
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all ${
                              index === currentBannerIndex ? "bg-white" : "bg-white/50"
                            }`}
                            onClick={() => setCurrentBannerIndex(index)}
                          />
                        ))}
                      </div>
                    </div>
                  </Card>

                  {/* Carrossel de Banners de Propaganda */}
                  <Card className="overflow-hidden">
                    <div className="relative h-48">
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${promoBanners[currentPromoIndex].color} flex items-center justify-center text-white`}
                      >
                        <div className="text-center p-4">
                          <div className="mb-3">{promoBanners[currentPromoIndex].icon}</div>
                          <h3 className="text-lg font-bold mb-2">{promoBanners[currentPromoIndex].title}</h3>
                          <p className="text-sm opacity-90 mb-3">{promoBanners[currentPromoIndex].subtitle}</p>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                          >
                            {promoBanners[currentPromoIndex].action}
                          </Button>
                        </div>
                      </div>

                      {/* Controles do carrossel */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
                        onClick={prevPromo}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
                        onClick={nextPromo}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>

                      {/* Indicadores */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                        {promoBanners.map((_, index) => (
                          <button
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all ${
                              index === currentPromoIndex ? "bg-white" : "bg-white/50"
                            }`}
                            onClick={() => setCurrentPromoIndex(index)}
                          />
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
