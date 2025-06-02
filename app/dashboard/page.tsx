"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Star,
  Heart,
  Gift,
  Plus,
  Send,
  Pencil,
  Trash2,
} from "lucide-react"
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
import {
  getFeedFromAPI,
  createFeedPostWithFallback,
  isAuthenticated,
  formatTimeAgo as formatApiTimeAgo,
  type ApiFeedItem,
  type ApiFeedResponse,
  updateFeedPost,
  deleteFeedPost,
  canEditOrDeletePost,
} from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

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

// Função helper para verificar se o usuário está logado via API real
const isRealUser = (): boolean => {
  if (typeof window === "undefined") return false
  return !!localStorage.getItem("authToken")
}

// Função para obter dados do usuário real
const getRealUser = (): User | null => {
  if (typeof window === "undefined") return null

  const token = localStorage.getItem("authToken")
  const role = localStorage.getItem("userRole")

  if (!token) return null

  // Decodificar o JWT para obter informações do usuário
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return {
      id: payload.nameid || "1",
      name: payload.name || payload.email || "Usuário",
      email: payload.email || "",
      role: role || "Membro",
      accessLevel: role === "Admin" ? "admin" : "member",
      phone: "",
    }
  } catch (error) {
    console.error("Erro ao decodificar token:", error)
    return null
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [churchData, setChurchData] = useState<ChurchData | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [feedResponse, setFeedResponse] = useState<ApiFeedResponse | null>(null)
  const [feedItems, setFeedItems] = useState<ApiFeedItem[]>([])
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
  const [editingPost, setEditingPost] = useState<ApiFeedItem | null>(null)
  const [editPostContent, setEditPostContent] = useState("")
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<ApiFeedItem | null>(null)
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
    if (!isAuthenticated()) {
      // Se não estiver autenticado, usar dados fake
      setNotifications(getNotifications())
      return
    }

    setIsLoadingFeed(true)
    try {
      const response = await getFeedFromAPI(1, 20) // Carregar primeira página com 20 itens
      setFeedResponse(response)
      setFeedItems(response.items)
      // Limpar notificações fake se tiver feed real
      setNotifications([])
    } catch (error) {
      console.error("Erro ao carregar feed:", error)
      // Fallback para dados fake em caso de erro
      setNotifications(getNotifications())
      setFeedItems([])
      setFeedResponse(null)
    } finally {
      setIsLoadingFeed(false)
    }
  }

  useEffect(() => {
    // Verificar se é usuário real ou fake
    let userData: User | null = null

    if (isRealUser()) {
      userData = getRealUser()
    } else {
      userData = getUser()
    }

    if (!userData) {
      router.push("/login")
      return
    }

    setUser(userData)
    setChurchData(getChurchData())
    setBirthdays(getBirthdaysThisWeek())

    // Carregar feed
    loadFeed()
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
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
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
      console.log("Criando post com conteúdo:", newPostContent)

      // Usar a função melhorada com fallback
      const newPost = await createFeedPostWithFallback(newPostContent)
      console.log("Post criado com sucesso:", newPost)

      // Atualizar a lista de posts imediatamente
      setFeedItems((prev) => {
        // Verificar se o post já existe para evitar duplicatas
        const exists = prev.some((item) => item.id === newPost.id)
        if (exists) {
          return prev
        }
        return [newPost, ...prev]
      })

      // Atualizar contadores se temos resposta da API
      if (feedResponse) {
        setFeedResponse((prev) => ({
          ...prev,
          totalCount: prev.totalCount + 1,
          items: [newPost, ...prev.items.filter((item) => item.id !== newPost.id)],
        }))
      }

      // Limpar formulário e fechar modal
      setNewPostContent("")
      setIsNewPostModalOpen(false)

      console.log("Post adicionado ao feed local com sucesso")
    } catch (error) {
      console.error("Erro detalhado ao criar post:", error)

      // Tentar recarregar o feed como último recurso
      try {
        console.log("Tentando recarregar feed completo...")
        await loadFeed()
        setNewPostContent("")
        setIsNewPostModalOpen(false)
        console.log("Feed recarregado, post pode ter sido criado")
      } catch (reloadError) {
        console.error("Erro ao recarregar feed:", reloadError)
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao criar post"
        alert(`Erro ao criar post: ${errorMessage}`)
      }
    } finally {
      setIsCreatingPost(false)
    }
  }

  const displayedNotifications = notifications.slice(0, visibleNotifications)
  const hasMoreNotifications = visibleNotifications < notifications.length

  // Determinar se deve mostrar feed real ou fake
  const showRealFeed = isAuthenticated() && feedItems.length > 0
  const feedToShow = showRealFeed ? feedItems : displayedNotifications

  const handleEditPost = (item: ApiFeedItem) => {
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
      // Enviar a atualização para a API
      const updatedPost = await updateFeedPost(editingPost.id, editPostContent)

      // Atualizar o estado local com o post atualizado
      setFeedItems((prevItems) =>
        prevItems.map((item) => (item.id === editingPost.id ? { ...item, content: editPostContent } : item)),
      )

      // Fechar o modal e limpar o estado
      setIsEditModalOpen(false)
      setEditingPost(null)
      setEditPostContent("")

      // Recarregar o feed para garantir que tudo esteja atualizado
      await loadFeed()
    } catch (error) {
      console.error("Erro ao salvar edição:", error)
      alert("Erro ao salvar edição. Por favor, tente novamente.")
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleDeletePost = (item: ApiFeedItem) => {
    setPostToDelete(item)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeletePost = async () => {
    if (!postToDelete) return

    setIsDeletingPost(true)
    try {
      // Deletar o post via API
      await deleteFeedPost(postToDelete.id)

      // Remover o post do estado local
      setFeedItems((prevItems) => prevItems.filter((item) => item.id !== postToDelete.id))

      // Atualizar contadores se temos resposta da API
      if (feedResponse) {
        setFeedResponse((prev) => ({
          ...prev,
          totalCount: Math.max(0, prev.totalCount - 1),
          items: prev.items.filter((item) => item.id !== postToDelete.id),
        }))
      }

      // Fechar o dialog e limpar o estado
      setIsDeleteDialogOpen(false)
      setPostToDelete(null)

      console.log("Post deletado com sucesso")
    } catch (error) {
      console.error("Erro ao deletar post:", error)
      alert("Erro ao deletar post. Por favor, tente novamente.")
    } finally {
      setIsDeletingPost(false)
    }
  }

  // Função para verificar se o usuário pode editar/deletar o post
  const canUserEditOrDeletePost = (item: ApiFeedItem): boolean => {
    const isOwner = user?.id === item.member.id.toString()
    const canEdit = canEditOrDeletePost(item.created)
    return isOwner && canEdit
  }

  if (!user || !churchData) {
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
                        <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <p className="font-medium text-gray-900 text-sm mt-1">{user.name || "Usuário"}</p>
                    </div>

                    {/* Desktop: nome e foto lado a lado */}
                    <div className="hidden md:flex items-center gap-3">
                      <p className="font-medium text-gray-900">{user.name || "Usuário"}</p>
                      <Avatar className="h-10 w-10 hover:opacity-80 transition-opacity">
                        <AvatarImage src={userPhoto || "/placeholder.svg?height=40&width=40&query=pastor+profile"} />
                        <AvatarFallback className="text-sm">{getInitials(user.name)}</AvatarFallback>
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
                          <AvatarFallback className="text-lg">{getInitials(user.name)}</AvatarFallback>
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
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">
                    {showRealFeed ? "Feed da Igreja" : "Mural da Igreja"}
                  </h2>
                  {isAuthenticated() && (
                    <Dialog open={isNewPostModalOpen} onOpenChange={setIsNewPostModalOpen}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          style={{ backgroundColor: "#89f0e6", color: "#000" }}
                          className="hover:opacity-90"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Nova Publicação
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Nova Publicação</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="content">Conteúdo</Label>
                            <Textarea
                              id="content"
                              placeholder="O que você gostaria de compartilhar?"
                              value={newPostContent}
                              onChange={(e) => setNewPostContent(e.target.value)}
                              rows={4}
                            />
                          </div>
                          <div className="flex gap-2 pt-4">
                            <Button
                              onClick={handleCreatePost}
                              disabled={!newPostContent.trim() || isCreatingPost}
                              className="flex-1"
                            >
                              {isCreatingPost ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Publicando...
                                </>
                              ) : (
                                <>
                                  <Send className="h-4 w-4 mr-2" />
                                  Publicar
                                </>
                              )}
                            </Button>
                            <Button variant="outline" onClick={() => setIsNewPostModalOpen(false)} className="flex-1">
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                {isLoadingFeed && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando feed...</p>
                  </div>
                )}

                <div className="space-y-4 md:space-y-6">
                  {showRealFeed
                    ? // Feed real da API
                      feedItems.map((item) => (
                        <Card key={item.id} className="overflow-hidden">
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 md:h-10 md:w-10">
                                <AvatarImage
                                  src={item.member.photo || "/placeholder.svg?height=40&width=40&query=church+member"}
                                />
                                <AvatarFallback className="text-xs md:text-sm">
                                  {getInitials(item.member.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-gray-900 text-sm md:text-base">
                                    {item.member.name || "Usuário"}
                                  </p>
                                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                                    Publicação
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <p className="text-xs md:text-sm text-gray-600">{formatApiTimeAgo(item.created)}</p>
                                  {/* Botões de editar e deletar - só mostra se for o post do usuário e dentro de 2h */}
                                  {canUserEditOrDeletePost(item) && (
                                    <div className="flex items-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEditPost(item)}
                                        className="hover:bg-gray-100 rounded-full h-8 w-8"
                                        title="Editar publicação"
                                      >
                                        <Pencil className="h-4 w-4 text-gray-600" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeletePost(item)}
                                        className="hover:bg-red-50 rounded-full h-8 w-8"
                                        title="Deletar publicação"
                                      >
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="pt-0">
                            <p className="text-gray-700 text-sm md:text-base whitespace-pre-wrap">{item.content}</p>

                            {/* Mostrar contagem de likes se houver */}
                            {item.likesCount > 0 && (
                              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                                <Heart className="h-4 w-4 text-red-500" />
                                <span className="text-sm text-gray-600">{item.likesCount} curtidas</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    : // Feed fake (notificações)
                      displayedNotifications.map((notification) => (
                        <Card key={notification.id} className="overflow-hidden">
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 md:h-10 md:w-10">
                                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                                <AvatarFallback className="text-xs md:text-sm">
                                  {getInitials(notification.author)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-gray-900 text-sm md:text-base">
                                    {notification.author || "Usuário"}
                                  </p>
                                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                    {getNotificationBadge(notification.type)}
                                  </span>
                                </div>
                                <p className="text-xs md:text-sm text-gray-600">
                                  {formatTimeAgo(notification.timestamp)}
                                </p>
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

                  {/* Botão Ver Mais - apenas para feed fake */}
                  {!showRealFeed && hasMoreNotifications && (
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
                  {!showRealFeed && !hasMoreNotifications && notifications.length > 3 && (
                    <div className="text-center py-6">
                      <p className="text-gray-500 text-sm">Você viu todos os posts do mural! 🎉</p>
                    </div>
                  )}

                  {/* Mensagem quando não há posts no feed real */}
                  {showRealFeed && feedItems.length === 0 && !isLoadingFeed && (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg mb-2">Nenhuma publicação ainda</p>
                      <p className="text-gray-400 text-sm">Seja o primeiro a compartilhar algo!</p>
                    </div>
                  )}

                  {/* Informações de paginação - apenas para feed real */}
                  {showRealFeed && feedResponse && (
                    <div className="text-center py-6 border-t border-gray-200">
                      <p className="text-sm text-gray-500">
                        Mostrando {feedResponse.items.length} de {feedResponse.totalCount} publicações
                      </p>
                      {feedResponse.totalPages > 1 && (
                        <p className="text-xs text-gray-400 mt-1">
                          Página {feedResponse.pageNumber} de {feedResponse.totalPages}
                        </p>
                      )}
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
                                  {getInitials(member.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 text-sm truncate">{member.name || "Membro"}</p>
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

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Publicação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo</Label>
              <Textarea
                id="content"
                placeholder="Edite sua publicação"
                value={editPostContent}
                onChange={(e) => setEditPostContent(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveEdit} disabled={!editPostContent.trim() || isSavingEdit} className="flex-1">
                {isSavingEdit ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar esta publicação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingPost}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePost}
              disabled={isDeletingPost}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingPost ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deletando...
                </>
              ) : (
                "Deletar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
