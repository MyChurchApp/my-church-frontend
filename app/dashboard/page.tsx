"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, DollarSign, Star, Heart, Gift, ChevronLeft, ChevronRight, BellIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/use-auth"
import Image from "next/image"

// Função helper para gerar iniciais de forma segura
const getInitials = (name: string | undefined | null): string => {
  if (!name || typeof name !== "string") return "U"

  return (
    name
      .split(" ")
      .filter((n) => n.length > 0)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"
  )
}

// Tipo para notificações
interface Notification {
  id: number
  type: string
  title: string
  message: string
  date: string
  read: boolean
}

// Tipo para itens do feed
interface FeedItem {
  id: number
  member: {
    id: number
    name: string
    photo?: string | null
  }
  content: string
  created: string
  likes: number
  comments: number
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [isLoadingFeed, setIsLoadingFeed] = useState(false)
  const [birthdays, setBirthdays] = useState<any[]>([])
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0)
  const [visibleNotifications, setVisibleNotifications] = useState(3)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false)
  const [newPostContent, setNewPostContent] = useState("")
  const [isCreatingPost, setIsCreatingPost] = useState(false)
  const [editingUser, setEditingUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  })
  const [userPhoto, setUserPhoto] = useState<string>("")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<FeedItem | null>(null)
  const [editPostContent, setEditPostContent] = useState("")
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<FeedItem | null>(null)
  const [isDeletingPost, setIsDeletingPost] = useState(false)

  // Banners de eventos
  const banners = [
    {
      id: 1,
      title: "Retiro de Jovens 2025",
      subtitle: "15-17 de Março",
      image: "/placeholder.svg?height=200&width=300",
      color: "from-blue-500 to-purple-600",
    },
    {
      id: 2,
      title: "Campanha de Oração",
      subtitle: "21 dias de jejum",
      image: "/placeholder.svg?height=200&width=300",
      color: "from-green-500 to-teal-600",
    },
    {
      id: 3,
      title: "Escola Bíblica",
      subtitle: "Inscrições abertas",
      image: "/placeholder.svg?height=200&width=300",
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

  // Função para carregar o feed
  const loadFeed = async () => {
    setIsLoadingFeed(true)
    try {
      // Simular carregamento de feed da API
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Dados de exemplo para o feed
      const fakeFeedItems: FeedItem[] = [
        {
          id: 1,
          member: {
            id: user?.member?.id || 1,
            name: user?.member?.name || "Administrador",
            photo: null,
          },
          content: "Bem-vindos à nova plataforma da nossa igreja! Estamos muito felizes em ter todos vocês aqui.",
          created: new Date(Date.now() - 3600000).toISOString(),
          likes: 12,
          comments: 3,
        },
        {
          id: 2,
          member: {
            id: 2,
            name: "Maria Santos",
            photo: null,
          },
          content: "O culto de domingo foi maravilhoso! Quem mais sentiu a presença de Deus?",
          created: new Date(Date.now() - 86400000).toISOString(),
          likes: 24,
          comments: 8,
        },
        {
          id: 3,
          member: {
            id: 3,
            name: "Pedro Oliveira",
            photo: null,
          },
          content: "Lembrando a todos que temos ensaio do coral hoje às 19h. Contamos com a presença de todos!",
          created: new Date(Date.now() - 172800000).toISOString(),
          likes: 8,
          comments: 2,
        },
      ]

      setFeedItems(fakeFeedItems)

      // Notificações de exemplo
      const fakeNotifications: Notification[] = [
        {
          id: 1,
          type: "event",
          title: "Novo Evento",
          message: "Retiro de Jovens confirmado para março",
          date: new Date(Date.now() - 3600000).toISOString(),
          read: false,
        },
        {
          id: 2,
          type: "announcement",
          title: "Anúncio Importante",
          message: "Reunião de líderes adiada para a próxima semana",
          date: new Date(Date.now() - 86400000).toISOString(),
          read: true,
        },
        {
          id: 3,
          type: "prayer",
          title: "Pedido de Oração",
          message: "Novo pedido de oração adicionado",
          date: new Date(Date.now() - 172800000).toISOString(),
          read: false,
        },
        {
          id: 4,
          type: "birthday",
          title: "Aniversário",
          message: "João Silva faz aniversário hoje!",
          date: new Date(Date.now() - 259200000).toISOString(),
          read: true,
        },
        {
          id: 5,
          type: "finance",
          title: "Relatório Financeiro",
          message: "Novo relatório financeiro disponível",
          date: new Date(Date.now() - 345600000).toISOString(),
          read: false,
        },
      ]

      setNotifications(fakeNotifications)

      // Aniversariantes da semana
      const fakeBirthdays = [
        {
          id: 1,
          name: "Ana Clara",
          birthDate: "1992-06-04T00:00:00",
          birthdayThisYear: new Date(new Date().getFullYear(), 5, 4),
        },
        {
          id: 2,
          name: "Carlos Eduardo",
          birthDate: "1985-06-06T00:00:00",
          birthdayThisYear: new Date(new Date().getFullYear(), 5, 6),
        },
        {
          id: 3,
          name: "Mariana Silva",
          birthDate: "1990-06-08T00:00:00",
          birthdayThisYear: new Date(new Date().getFullYear(), 5, 8),
        },
      ]

      setBirthdays(fakeBirthdays)
    } catch (error) {
      console.error("Erro ao carregar feed:", error)
    } finally {
      setIsLoadingFeed(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && user) {
      loadFeed()
    }
  }, [isAuthenticated, user])

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
    if (user?.member) {
      setEditingUser({
        name: user.member.name || "",
        email: user.member.email || "",
        phone: user.member.phone || "",
        role: user.role || "",
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

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return

    setIsCreatingPost(true)
    try {
      // Simular criação de post
      await new Promise((resolve) => setTimeout(resolve, 800))

      const newPost: FeedItem = {
        id: Date.now(),
        member: {
          id: user?.member?.id || 0,
          name: user?.member?.name || "Usuário",
          photo: null,
        },
        content: newPostContent,
        created: new Date().toISOString(),
        likes: 0,
        comments: 0,
      }

      setFeedItems((prev) => [newPost, ...prev])
      setNewPostContent("")
      setIsNewPostModalOpen(false)
    } catch (error) {
      console.error("Erro ao criar post:", error)
      alert("Erro ao criar post. Por favor, tente novamente.")
    } finally {
      setIsCreatingPost(false)
    }
  }

  const handleEditPost = (item: FeedItem) => {
    setEditingPost(item)
    setEditPostContent(item.content)
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingPost || !editPostContent.trim()) {
      return
    }

    setIsSavingEdit(true)
    try {
      // Simular atualização
      await new Promise((resolve) => setTimeout(resolve, 800))

      setFeedItems((prevItems) =>
        prevItems.map((item) => (item.id === editingPost.id ? { ...item, content: editPostContent } : item)),
      )

      setIsEditModalOpen(false)
      setEditingPost(null)
      setEditPostContent("")
    } catch (error) {
      console.error("Erro ao salvar edição:", error)
      alert("Erro ao salvar edição. Por favor, tente novamente.")
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleDeletePost = (item: FeedItem) => {
    setPostToDelete(item)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeletePost = async () => {
    if (!postToDelete) return

    setIsDeletingPost(true)
    try {
      // Simular exclusão
      await new Promise((resolve) => setTimeout(resolve, 800))

      setFeedItems((prevItems) => prevItems.filter((item) => item.id !== postToDelete.id))
      setIsDeleteDialogOpen(false)
      setPostToDelete(null)
    } catch (error) {
      console.error("Erro ao deletar post:", error)
      alert("Erro ao deletar post. Por favor, tente novamente.")
    } finally {
      setIsDeletingPost(false)
    }
  }

  // Função para verificar se o usuário pode editar/deletar o post
  const canUserEditOrDeletePost = (item: FeedItem): boolean => {
    return user?.member?.id === item.member.id
  }

  const displayedNotifications = notifications.slice(0, visibleNotifications)
  const hasMoreNotifications = visibleNotifications < notifications.length

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-600">
              <BellIcon className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            <div className="flex items-center space-x-2 cursor-pointer" onClick={openProfileModal}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.member?.photo || ""} alt={user.member?.name || "Usuário"} />
                <AvatarFallback>{getInitials(user.member?.name)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden md:inline-block">{user.member?.name}</span>
            </div>
          </div>
        </header>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Feed Column */}
              <div className="md:col-span-2 space-y-6">
                {/* Create Post Card */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.member?.photo || ""} alt={user.member?.name || "Usuário"} />
                        <AvatarFallback>{getInitials(user.member?.name)}</AvatarFallback>
                      </Avatar>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-gray-500 font-normal"
                        onClick={() => setIsNewPostModalOpen(true)}
                      >
                        Compartilhe algo com a comunidade...
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Feed Items */}
                {isLoadingFeed ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <>
                    {feedItems.length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <p className="text-gray-500">Nenhuma publicação encontrada.</p>
                          <Button variant="outline" className="mt-4" onClick={() => setIsNewPostModalOpen(true)}>
                            Criar primeira publicação
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      feedItems.map((item) => (
                        <Card key={item.id} className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="p-4 flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={item.member.photo || ""} alt={item.member.name} />
                                  <AvatarFallback>{getInitials(item.member.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{item.member.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(item.created).toLocaleString("pt-BR", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                </div>
                              </div>

                              {canUserEditOrDeletePost(item) && (
                                <div className="flex space-x-2">
                                  <Button variant="ghost" size="sm" onClick={() => handleEditPost(item)}>
                                    Editar
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDeletePost(item)}
                                  >
                                    Excluir
                                  </Button>
                                </div>
                              )}
                            </div>

                            <div className="px-4 pb-4 whitespace-pre-wrap">{item.content}</div>

                            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600">
                                  <span className="text-sm">{item.likes}</span>
                                  <span className="text-sm">Curtidas</span>
                                </button>
                                <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600">
                                  <span className="text-sm">{item.comments}</span>
                                  <span className="text-sm">Comentários</span>
                                </button>
                              </div>
                              <div>
                                <Button variant="ghost" size="sm">
                                  Compartilhar
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </>
                )}
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                {/* Banner Rotativo */}
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative">
                      <div className="relative h-40 overflow-hidden">
                        <div
                          className={`absolute inset-0 bg-gradient-to-r ${banners[currentBannerIndex].color} opacity-80`}
                        ></div>
                        <Image
                          src={banners[currentBannerIndex].image || "/placeholder.svg"}
                          alt={banners[currentBannerIndex].title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 flex flex-col justify-center p-6 text-white">
                          <h3 className="text-xl font-bold">{banners[currentBannerIndex].title}</h3>
                          <p className="text-sm mt-1">{banners[currentBannerIndex].subtitle}</p>
                          <Button className="mt-4 bg-white text-gray-800 hover:bg-gray-100 w-full md:w-auto">
                            Saiba Mais
                          </Button>
                        </div>
                      </div>
                      <div className="absolute top-1/2 left-2 -translate-y-1/2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full bg-white/80 hover:bg-white"
                          onClick={prevBanner}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="absolute top-1/2 right-2 -translate-y-1/2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full bg-white/80 hover:bg-white"
                          onClick={nextBanner}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notificações */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Notificações</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {displayedNotifications.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">Nenhuma notificação</p>
                    ) : (
                      displayedNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`flex items-start space-x-3 p-2 rounded-md ${
                            notification.read ? "" : "bg-blue-50"
                          }`}
                        >
                          <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm">{notification.title}</p>
                              <span className="text-xs text-gray-500">
                                {new Date(notification.date).toLocaleString("pt-BR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{notification.message}</p>
                            <div className="mt-1">
                              <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                                {getNotificationBadge(notification.type)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}

                    {hasMoreNotifications && (
                      <Button
                        variant="ghost"
                        className="w-full text-blue-600 hover:text-blue-700"
                        onClick={loadMoreNotifications}
                      >
                        Ver mais notificações
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Aniversariantes */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Aniversariantes da Semana</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {birthdays.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">Nenhum aniversariante esta semana</p>
                    ) : (
                      <div className="space-y-3">
                        {birthdays.map((person) => (
                          <div key={person.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-sm">{person.name}</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {person.birthdayThisYear.toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Banner Promocional */}
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative">
                      <div className={`bg-gradient-to-r ${promoBanners[currentPromoIndex].color} p-4 text-white`}>
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white/20 rounded-full">{promoBanners[currentPromoIndex].icon}</div>
                          <div>
                            <h3 className="font-bold">{promoBanners[currentPromoIndex].title}</h3>
                            <p className="text-sm">{promoBanners[currentPromoIndex].subtitle}</p>
                          </div>
                        </div>
                        <Button className="mt-3 bg-white text-gray-800 hover:bg-gray-100 w-full">
                          {promoBanners[currentPromoIndex].action}
                        </Button>
                      </div>
                      <div className="absolute top-1/2 left-2 -translate-y-1/2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full bg-white/30 hover:bg-white/50 text-white"
                          onClick={prevPromo}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="absolute top-1/2 right-2 -translate-y-1/2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full bg-white/30 hover:bg-white/50 text-white"
                          onClick={nextPromo}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Perfil */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={userPhoto || user.member?.photo || ""} alt={user.member?.name || "Usuário"} />
                <AvatarFallback className="text-2xl">{getInitials(user.member?.name)}</AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="photo" className="sr-only">
                  Foto
                </Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="w-full max-w-xs"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={editingUser.name}
                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editingUser.email}
                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={editingUser.phone}
                onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Cargo</Label>
              <Input
                id="role"
                value={editingUser.role}
                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                disabled
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProfileModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveProfile}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Nova Publicação */}
      <Dialog open={isNewPostModalOpen} onOpenChange={setIsNewPostModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nova Publicação</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-start space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.member?.photo || ""} alt={user.member?.name || "Usuário"} />
                <AvatarFallback>{getInitials(user.member?.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{user.member?.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
            </div>
            <div className="grid gap-2">
              <Textarea
                placeholder="Compartilhe algo com a comunidade..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewPostModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreatePost} disabled={isCreatingPost || !newPostContent.trim()}>
              {isCreatingPost ? "Publicando..." : "Publicar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição de Post */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Publicação</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Textarea
                placeholder="Edite sua publicação..."
                value={editPostContent}
                onChange={(e) => setEditPostContent(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSavingEdit || !editPostContent.trim()}>
              {isSavingEdit ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Tem certeza que deseja excluir esta publicação? Esta ação não pode ser desfeita.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeletePost} disabled={isDeletingPost}>
              {isDeletingPost ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
