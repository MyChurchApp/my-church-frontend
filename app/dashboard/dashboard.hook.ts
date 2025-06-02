"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { FeedService } from "@/lib/services/feed.service"
import type { FeedItem, FeedResponse } from "@/lib/types/feed.types"

// Tipos locais para o dashboard
interface Notification {
  id: number
  type: string
  title: string
  message: string
  date: string
  read: boolean
}

interface Banner {
  id: number
  title: string
  subtitle: string
  image: string
  color: string
}

interface PromoBanner {
  id: number
  title: string
  subtitle: string
  icon: React.ReactNode
  color: string
  action: string
}

interface Birthday {
  id: number
  name: string
  birthDate: string
  birthdayThisYear: Date
}

export const useDashboard = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [isLoadingFeed, setIsLoadingFeed] = useState(false)
  const [feedError, setFeedError] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isUnauthorized, setIsUnauthorized] = useState(false)
  const [birthdays, setBirthdays] = useState<Birthday[]>([])
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
  const [feedPagination, setFeedPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  })

  // Arrays vazios - SEM DADOS FAKE
  const banners: Banner[] = []
  const promoBanners: PromoBanner[] = []

  // Função para verificar se o post pode ser editado/deletado (menos de 2 horas)
  const canEditOrDeletePost = (createdDate: string): boolean => {
    try {
      // Converter a data UTC para data local
      const utcDate = new Date(createdDate)
      const localDate = new Date(utcDate)

      console.log("Data UTC do post:", utcDate.toISOString())
      console.log("Data local do post:", localDate.toLocaleString())

      const now = new Date()
      console.log("Data atual:", now.toLocaleString())

      const timeDiff = now.getTime() - localDate.getTime()
      const twoHoursInMs = 2 * 60 * 60 * 1000 // 2 horas em milissegundos

      console.log("Diferença de tempo (ms):", timeDiff)
      console.log("2 horas em ms:", twoHoursInMs)
      console.log("Pode editar/deletar:", timeDiff < twoHoursInMs)

      return timeDiff < twoHoursInMs
    } catch (error) {
      console.error("Erro ao verificar tempo do post:", error)
      return false
    }
  }

  // Função para carregar o feed da API real com validação
  const loadFeed = async (pageNumber = 1, pageSize = 10) => {
    setIsLoadingFeed(true)
    setFeedError(null)
    setApiError(null)
    setIsUnauthorized(false)

    try {
      console.log("🔄 Carregando feed...")
      const response: FeedResponse = await FeedService.getFeed(pageNumber, pageSize)

      if (pageNumber === 1) {
        setFeedItems(response.items)
      } else {
        setFeedItems((prev) => [...prev, ...response.items])
      }

      setFeedPagination({
        pageNumber: response.pageNumber,
        pageSize: response.pageSize,
        totalCount: response.totalCount,
        totalPages: response.totalPages,
      })

      console.log("✅ Feed carregado com sucesso:", response)
    } catch (error: any) {
      console.error("❌ Erro ao carregar feed:", error)

      // Tratamento específico para diferentes tipos de erro
      if (error.message?.includes("UNAUTHORIZED")) {
        setIsUnauthorized(true)
        setApiError("Sessão expirada ou token inválido. Faça login novamente para acessar o feed.")
      } else if (error.message?.includes("BAD_REQUEST")) {
        setApiError("Requisição inválida. Verifique os parâmetros e tente novamente.")
      } else if (error.message?.includes("HTTP_ERROR")) {
        const statusCode = error.message.match(/HTTP_ERROR_(\d+)/)?.[1]
        setApiError(`Erro do servidor (${statusCode}). Tente novamente em alguns minutos.`)
      } else if (error.message?.includes("fetch")) {
        setApiError("Erro de conexão. Verifique sua internet e tente novamente.")
      } else {
        setApiError("Erro inesperado ao carregar o feed. Tente atualizar a página.")
      }

      // Em caso de erro, manter os dados vazios apenas na primeira página
      if (pageNumber === 1) {
        setFeedItems([])
        setFeedPagination({
          pageNumber: 1,
          pageSize: pageSize,
          totalCount: 0,
          totalPages: 0,
        })
      }
    } finally {
      setIsLoadingFeed(false)
    }
  }

  // Função para tentar novamente carregar o feed
  const retryLoadFeed = () => {
    setApiError(null)
    setIsUnauthorized(false)
    loadFeed(1, feedPagination.pageSize)
  }

  // Função para refresh da página
  const refreshPage = () => {
    window.location.reload()
  }

  // Função para fazer logout quando não autorizado
  const handleLogout = () => {
    logout()
    window.location.href = "/login"
  }

  // Função para carregar mais itens do feed
  const loadMoreFeed = async () => {
    if (feedPagination.pageNumber < feedPagination.totalPages && !isLoadingFeed) {
      await loadFeed(feedPagination.pageNumber + 1, feedPagination.pageSize)
    }
  }

  // Efeitos
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("🔐 Usuário autenticado, carregando feed...")
      loadFeed()
    }
  }, [isAuthenticated, user])

  // Funções de ação - sem dados fake
  const nextBanner = () => {
    // Sem banners fake
  }

  const prevBanner = () => {
    // Sem banners fake
  }

  const nextPromo = () => {
    // Sem promos fake
  }

  const prevPromo = () => {
    // Sem promos fake
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

  const saveProfile = async () => {
    try {
      // TODO: Implementar chamada para API real de perfil
      console.log("Salvando perfil - aguardando integração com API real:", editingUser)
      setIsProfileModalOpen(false)
    } catch (error) {
      console.error("Erro ao salvar perfil:", error)
    }
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setUserPhoto(result)
        // TODO: Implementar upload para API real
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return

    setIsCreatingPost(true)
    try {
      const postId = await FeedService.createPost({ content: newPostContent })
      console.log("Post criado com ID:", postId)

      // Recarregar o feed para mostrar o novo post
      await loadFeed(1, feedPagination.pageSize)

      setNewPostContent("")
      setIsNewPostModalOpen(false)
    } catch (error: any) {
      console.error("Erro ao criar post:", error)
      if (error.message?.includes("UNAUTHORIZED")) {
        alert("Sessão expirada. Faça login novamente.")
        handleLogout()
      } else if (error.message?.includes("BAD_REQUEST")) {
        alert("Dados inválidos. Verifique o conteúdo do post.")
      } else {
        alert("Erro ao criar post. Verifique sua conexão e tente novamente.")
      }
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
      // Agora updatePost retorna o objeto FeedItem atualizado
      const updatedPost = await FeedService.updatePost(editingPost.id, {
        postId: editingPost.id,
        content: editPostContent,
      })

      // Atualizar o item com o objeto completo retornado pela API
      setFeedItems((prevItems) => prevItems.map((item) => (item.id === editingPost.id ? updatedPost : item)))

      setIsEditModalOpen(false)
      setEditingPost(null)
      setEditPostContent("")
    } catch (error: any) {
      console.error("Erro ao salvar edição:", error)
      if (error.message?.includes("UNAUTHORIZED")) {
        alert("Sessão expirada. Faça login novamente.")
        handleLogout()
      } else {
        alert("Erro ao editar post. Verifique sua conexão e tente novamente.")
      }
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
      await FeedService.deletePost(postToDelete.id)

      // Remover o item localmente
      setFeedItems((prevItems) => prevItems.filter((item) => item.id !== postToDelete.id))

      setIsDeleteDialogOpen(false)
      setPostToDelete(null)
    } catch (error: any) {
      console.error("Erro ao deletar post:", error)
      if (error.message?.includes("UNAUTHORIZED")) {
        alert("Sessão expirada. Faça login novamente.")
        handleLogout()
      } else {
        alert("Erro ao deletar post. Verifique sua conexão e tente novamente.")
      }
    } finally {
      setIsDeletingPost(false)
    }
  }

  const canUserEditOrDeletePost = (item: FeedItem): boolean => {
    // Verificar se é o autor do post
    const isAuthor = user?.member?.id === item.memberId

    // Verificar se ainda está dentro do prazo de 2 horas
    const canEditByTime = canEditOrDeletePost(item.created)

    console.log("Verificação de edição/exclusão:")
    console.log("- É autor:", isAuthor)
    console.log("- Pode editar por tempo:", canEditByTime)
    console.log("- Resultado final:", isAuthor && canEditByTime)

    return isAuthor && canEditByTime
  }

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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "event":
        return "📅"
      case "announcement":
        return "📢"
      case "prayer":
        return "🙏"
      case "birthday":
        return "🎂"
      case "finance":
        return "💰"
      default:
        return "📝"
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

  const displayedNotifications = notifications.slice(0, visibleNotifications)
  const hasMoreNotifications = visibleNotifications < notifications.length
  const hasMoreFeedItems = feedPagination.pageNumber < feedPagination.totalPages

  return {
    // Estados
    user,
    isLoading,
    notifications: displayedNotifications,
    hasMoreNotifications,
    feedItems,
    isLoadingFeed,
    feedError,
    apiError,
    isUnauthorized,
    birthdays,
    banners,
    promoBanners,
    currentBannerIndex,
    currentPromoIndex,
    isProfileModalOpen,
    isNewPostModalOpen,
    newPostContent,
    isCreatingPost,
    editingUser,
    userPhoto,
    isEditModalOpen,
    editingPost,
    editPostContent,
    isSavingEdit,
    isDeleteDialogOpen,
    postToDelete,
    isDeletingPost,
    feedPagination,
    hasMoreFeedItems,

    // Setters
    setNewPostContent,
    setEditingUser,
    setEditPostContent,

    // Funções
    nextBanner,
    prevBanner,
    nextPromo,
    prevPromo,
    loadMoreNotifications,
    loadMoreFeed,
    retryLoadFeed,
    refreshPage,
    handleLogout,
    openProfileModal,
    saveProfile,
    handlePhotoUpload,
    handleCreatePost,
    handleEditPost,
    handleSaveEdit,
    handleDeletePost,
    confirmDeletePost,
    canUserEditOrDeletePost,
    getInitials,
    getNotificationIcon,
    getNotificationBadge,
    setIsProfileModalOpen,
    setIsNewPostModalOpen,
    setIsEditModalOpen,
    setIsDeleteDialogOpen,
  }
}
