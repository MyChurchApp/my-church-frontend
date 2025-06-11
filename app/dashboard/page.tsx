"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeaderContainer } from "./containers/header/dashboard-header.container"
import { StatsCardsContainer } from "./containers/stats/stats-cards.container"
import { FeedSectionContainer } from "./containers/feed/feed-section.container"
import { SidebarContentContainer } from "./containers/sidebar/sidebar-content.container"
import { getUser, getChurchData, type User, type ChurchData } from "@/lib/fake-api"
import type React from "react"

import { getNotifications, fakeMembers, type Notification } from "@/lib/fake-api"
import {
  getFeedFromAPI,
  createFeedPostWithFallback,
  isAuthenticated,
  type ApiFeedItem,
  type ApiFeedResponse,
  updateFeedPost,
  deleteFeedPost,
  canEditOrDeletePost,
} from "@/lib/api"
import { MembersService, type BirthdayMember } from "@/services/members.service"
import { VerseOfDayService, type VerseOfDay } from "@/services/verse-of-day.service"
import { Calendar, Users, DollarSign, Star, Heart, Gift } from "lucide-react"

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
  const memberData = localStorage.getItem("user") // Dados do member do login

  console.log("🔍 Debug getRealUser:")
  console.log("Token:", !!token)
  console.log("Role:", role)
  console.log("MemberData raw:", memberData)

  if (!token) return null

  // Se temos dados do member armazenados, usar eles
  if (memberData) {
    try {
      const member = JSON.parse(memberData)
      console.log("📋 Member parsed:", member)

      const userData = {
        id: member.id?.toString() || "1",
        name: member.name || "Usuário",
        email: member.email || "",
        role: role || "Membro",
        accessLevel: role === "Admin" ? "admin" : "member",
        phone: member.phone || "",
        birthDate: member.birthDate ? member.birthDate.split("T")[0] : "",
        isBaptized: member.isBaptized || false,
        baptizedDate: member.baptizedDate ? member.baptizedDate.split("T")[0] : "",
        isTither: member.isTither || false,
        photo: member.photo || "",
        notes: member.notes || "",
        documents: member.document || [], // Usar 'document' como vem da API
        memberSince: member.memberSince ? member.memberSince.split("T")[0] : "",
        maritalStatus: member.maritalStatus || "",
        ministry: member.ministry || "",
        isActive: member.isActive !== undefined ? member.isActive : true,
      }

      console.log("✅ UserData final:", userData)
      return userData
    } catch (error) {
      console.error("❌ Erro ao parsear dados do member:", error)
    }
  }

  // Fallback para decodificar o JWT
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    console.log("🔄 Fallback para JWT payload:", payload)
    return {
      id: payload.nameid || "1",
      name: payload.name || payload.email || "Usuário",
      email: payload.email || "",
      role: role || "Membro",
      accessLevel: role === "Admin" ? "admin" : "member",
      phone: "",
      documents: [],
    }
  } catch (error) {
    console.error("❌ Erro ao decodificar token:", error)
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
  const [feedError, setFeedError] = useState<string | null>(null)
  const [birthdays, setBirthdays] = useState<BirthdayMember[]>([])
  const [isLoadingBirthdays, setIsLoadingBirthdays] = useState(false)
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
    birthDate: "",
    baptizedDate: "",
    isBaptized: false,
    isTither: false,
    notes: "",
    cpf: "", // Adicionar campo CPF
    memberSince: "",
    maritalStatus: "",
    ministry: "",
    isActive: true,
  })
  const [userPhoto, setUserPhoto] = useState<string>("")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<ApiFeedItem | null>(null)
  const [editPostContent, setEditPostContent] = useState("")
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<ApiFeedItem | null>(null)
  const [isDeletingPost, setIsDeletingPost] = useState(false)
  const [verseOfDay, setVerseOfDay] = useState<VerseOfDay>({
    verseText: "",
    reference: "",
  })
  const [isLoadingVerse, setIsLoadingVerse] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})

  const openProfileModal = () => {
    if (user) {
      console.log("🔍 Debug openProfileModal - user:", user)

      // Buscar dados mais recentes do localStorage se disponível
      let memberData = null
      try {
        const storedData = localStorage.getItem("user")
        if (storedData) {
          // Tentar parsear os dados do localStorage
          const parsedData = JSON.parse(storedData)
          console.log("📋 Dados brutos do localStorage:", parsedData)

          // Verificar se os dados estão na estrutura token.member
          if (parsedData.token && parsedData.token.member) {
            memberData = parsedData.token.member
            console.log("📋 Dados do member encontrados em token.member:", memberData)
          } else {
            // Se não estiver na estrutura token.member, usar o objeto diretamente
            memberData = parsedData
            console.log("📋 Usando dados diretos do localStorage:", memberData)
          }
        }
      } catch (error) {
        console.error("❌ Erro ao parsear dados do localStorage:", error)
      }

      // Usar dados do localStorage se disponível, senão usar dados do user state
      const sourceData = memberData || user

      // Procurar CPF nos documentos (tipo 1 é CPF)
      let cpfValue = ""
      if (sourceData.document && Array.isArray(sourceData.document)) {
        const cpfDoc = sourceData.document.find((doc: any) => doc.type === 1)
        cpfValue = cpfDoc?.number || ""
      } else if (sourceData.documents && Array.isArray(sourceData.documents)) {
        const cpfDoc = sourceData.documents.find((doc: any) => doc.type === 1)
        cpfValue = cpfDoc?.number || ""
      }

      console.log("📄 CPF encontrado:", cpfValue)

      const editingData = {
        name: sourceData.name || "",
        email: sourceData.email || "",
        phone: sourceData.phone || "",
        role: user.role || "",
        birthDate: sourceData.birthDate ? sourceData.birthDate.split("T")[0] : "",
        baptizedDate: sourceData.baptizedDate ? sourceData.baptizedDate.split("T")[0] : "",
        isBaptized: sourceData.isBaptized || false,
        isTither: sourceData.isTither || false,
        notes: sourceData.notes || "",
        cpf: cpfValue,
        memberSince: sourceData.memberSince ? sourceData.memberSince.split("T")[0] : "",
        maritalStatus: sourceData.maritalStatus || "",
        ministry: sourceData.ministry || "",
        isActive: sourceData.isActive !== undefined ? sourceData.isActive : true,
      }

      console.log("📝 Dados mapeados para edição:", editingData)
      setEditingUser(editingData)
      setUserPhoto(sourceData.photo || "")
      setValidationErrors({}) // Limpar erros de validação
      setIsProfileModalOpen(true)
    } else {
      console.log("❌ User não encontrado para abrir modal")
    }
  }

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
      // Se não estiver autenticado, usar dados fake apenas para demonstração
      setNotifications(getNotifications())
      return
    }

    setIsLoadingFeed(true)
    setFeedError(null)
    try {
      console.log("🔄 Carregando feed da API...")
      const response = await getFeedFromAPI(1, 20)
      console.log("✅ Feed carregado com sucesso:", response)

      setFeedResponse(response)
      setFeedItems(response.items)
      // Limpar notificações fake se tiver feed real
      setNotifications([])
    } catch (error) {
      console.error("❌ Erro ao carregar feed:", error)

      // Definir mensagem de erro baseada no tipo
      let errorMessage = "Erro ao carregar feed"
      if (error instanceof Error) {
        if (error.message.includes("401")) {
          errorMessage = "Sessão expirada. Você será redirecionado para o login."
        } else if (error.message.includes("404")) {
          errorMessage = "Feed não encontrado"
        } else if (error.message.includes("500")) {
          errorMessage = "Erro interno do servidor"
        } else {
          errorMessage = error.message
        }
      }

      setFeedError(errorMessage)
      setFeedItems([])
      setFeedResponse(null)
      // NÃO usar dados fake em caso de erro
    } finally {
      setIsLoadingFeed(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const initializeDashboard = async () => {
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

      if (!isMounted) return

      setUser(userData)
      // No useEffect, após setUser(userData), adicionar:
      console.log("👤 User definido no estado:", userData)
      setChurchData(getChurchData())

      // Carregar dados apenas se o componente ainda estiver montado
      if (isMounted) {
        // Carregar feed
        //await loadFeed()
        // Carregar aniversários
        //await loadBirthdays()
        // Carregar versículo do dia
        //await loadVerseOfDay()
      }
    }

    initializeDashboard()

    // Cleanup function
    return () => {
      isMounted = false
    }
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

  const getBirthdaysThisWeek = (): BirthdayMember[] => {
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
      .map((member) => {
        const birthDate = new Date(member.birthDate)
        const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())

        // Calcular diferença em dias (pode ser negativo se já passou)
        const daysUntilBirthday = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        const isToday = daysUntilBirthday === 0
        const hasPassed = daysUntilBirthday < 0

        // Calcular idade atual
        const currentAge = today.getFullYear() - birthDate.getFullYear()
        const hasHadBirthdayThisYear = today >= thisYearBirthday
        const actualAge = hasHadBirthdayThisYear ? currentAge : currentAge - 1

        let birthdayMessage = ""
        if (hasPassed) {
          const daysPassed = Math.abs(daysUntilBirthday)
          birthdayMessage = `fez ${actualAge} anos há ${daysPassed} ${daysPassed === 1 ? "dia" : "dias"}`
        } else if (isToday) {
          birthdayMessage = `faz ${actualAge + 1} anos hoje! 🎉`
        } else if (daysUntilBirthday === 1) {
          birthdayMessage = `fará ${actualAge + 1} anos amanhã`
        } else {
          birthdayMessage = `fará ${actualAge + 1} anos daqui ${daysUntilBirthday} dias`
        }

        return {
          id: member.id,
          name: member.name,
          email: member.email || "",
          phone: member.phone || "",
          birthDate: member.birthDate,
          photo: member.photo,
          birthdayThisYear: thisYearBirthday,
          ageWillTurn: actualAge + 1,
          daysUntilBirthday: daysUntilBirthday,
          isToday: isToday,
          birthdayMessage: birthdayMessage,
        }
      })
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

  // Função para validar campos
  const validateFields = () => {
    const errors: { [key: string]: string } = {}

    if (!editingUser.name.trim()) {
      errors.name = "Nome é obrigatório"
    }

    if (!editingUser.email.trim()) {
      errors.email = "Email é obrigatório"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editingUser.email.trim())) {
      errors.email = "Email deve ter um formato válido"
    }

    if (!editingUser.cpf.trim()) {
      errors.cpf = "CPF é obrigatório"
    } else if (editingUser.cpf.replace(/\D/g, "").length !== 11) {
      errors.cpf = "CPF deve ter 11 dígitos"
    }

    if (!editingUser.phone.trim()) {
      errors.phone = "Telefone é obrigatório"
    } else if (editingUser.phone.replace(/\D/g, "").length < 10) {
      errors.phone = "Telefone deve ter pelo menos 10 dígitos"
    }

    if (!editingUser.birthDate) {
      errors.birthDate = "Data de nascimento é obrigatória"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const saveProfile = async () => {
    if (!user?.id) {
      console.error("ID do usuário não encontrado")
      return
    }

    // Validar campos
    if (!validateFields()) {
      console.log("Validação falhou:", validationErrors)
      return
    }

    setIsSavingProfile(true)

    try {
      console.log("Salvando perfil para o membro ID:", user.id)

      // Preparar dados para a API usando o formato correto do MembersService
      const updateData = {
        command: "UpdateMember", // Campo obrigatório
        name: editingUser.name.trim(),
        email: editingUser.email.trim(),
        phone: editingUser.phone.trim(),
        birthDate: editingUser.birthDate ? `${editingUser.birthDate}T00:00:00` : "1990-01-01T00:00:00",
        isBaptized: Boolean(editingUser.isBaptized),
        baptizedDate: editingUser.baptizedDate ? `${editingUser.baptizedDate}T00:00:00` : "2010-05-20T00:00:00",
        isTither: Boolean(editingUser.isTither),
        maritalStatus: 0, // Converter para enum depois
        memberSince: editingUser.memberSince ? `${editingUser.memberSince}T00:00:00` : "2020-01-01T00:00:00",
        ministry: 0, // Converter para enum depois
        isActive: Boolean(editingUser.isActive),
        notes: editingUser.notes || "",
        photo: userPhoto || "",
        document: [
          {
            type: 1, // Tipo 1 = CPF
            number: editingUser.cpf.replace(/\D/g, ""), // Remove formatação do CPF
          },
        ],
      }

      console.log("Dados enviados para API:", updateData)

      // Usar o MembersService ao invés da API direta
      const updatedMember = await MembersService.updateMember(Number.parseInt(user.id), updateData)

      console.log("Membro atualizado com sucesso:", updatedMember)

      // Atualizar dados locais
      const updatedUser = {
        ...user,
        name: updatedMember.name,
        email: updatedMember.email,
        phone: updatedMember.phone,
        photo: updatedMember.photo,
        birthDate: updatedMember.birthDate ? updatedMember.birthDate.split("T")[0] : "",
        baptizedDate: updatedMember.baptizedDate ? updatedMember.baptizedDate.split("T")[0] : "",
        isBaptized: updatedMember.isBaptized,
        isTither: updatedMember.isTither,
        notes: updatedMember.notes,
        documents: updatedMember.document || [],
        memberSince: updatedMember.memberSince ? updatedMember.memberSince.split("T")[0] : "",
        maritalStatus: updatedMember.maritalStatus || "",
        ministry: updatedMember.ministry || "",
        isActive: updatedMember.isActive,
      }

      setUser(updatedUser)

      // Atualizar localStorage com os dados atualizados
      localStorage.setItem("user", JSON.stringify(updatedMember))

      setIsProfileModalOpen(false)
      console.log("✅ Perfil atualizado com sucesso!")
    } catch (error) {
      console.error("❌ Erro ao salvar perfil:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      console.error(`Erro ao salvar perfil: ${errorMessage}`)
    } finally {
      setIsSavingProfile(false)
    }
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
  const showFakeNotifications = !isAuthenticated() && notifications.length > 0

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

  const loadBirthdays = async () => {
    setIsLoadingBirthdays(true)
    try {
      if (isAuthenticated()) {
        console.log("Tentando carregar aniversários da API...")

        // Primeiro, testar se o endpoint existe
        const isConnected = await MembersService.testConnection()

        if (!isConnected) {
          console.warn("Endpoint de aniversários não disponível. Usando dados fake.")
          setBirthdays(getBirthdaysThisWeek())
          return
        }

        // Usar API real se autenticado e endpoint disponível
        const birthdayMembers = await MembersService.getWeeklyBirthdays()

        if (birthdayMembers.length === 0) {
          console.log("Nenhum aniversariante encontrado na API. Usando dados fake como demonstração.")
          setBirthdays(getBirthdaysThisWeek())
        } else {
          console.log(`${birthdayMembers.length} aniversariantes carregados da API`)
          setBirthdays(birthdayMembers)
        }
      } else {
        console.log("Usuário não autenticado. Usando dados fake.")
        setBirthdays(getBirthdaysThisWeek())
      }
    } catch (error) {
      console.error("Erro ao carregar aniversários:", error)

      // Mostrar mensagem de erro mais amigável
      if (error instanceof Error) {
        if (error.message.includes("404")) {
          console.warn("Endpoint de aniversários não encontrado. Usando dados de demonstração.")
        } else if (error.message.includes("401")) {
          console.warn("Token de autenticação inválido. Usando dados de demonstração.")
        } else {
          console.warn("Erro de conexão com a API. Usando dados de demonstração.")
        }
      }

      // Em caso de erro, sempre usar dados fake como fallback
      setBirthdays(getBirthdaysThisWeek())
    } finally {
      setIsLoadingBirthdays(false)
    }
  }

  const loadVerseOfDay = async () => {
    setIsLoadingVerse(true)
    try {
      console.log("Tentando carregar versículo do dia da API...")

      const verse = await VerseOfDayService.getVerseOfDay()

      if (VerseOfDayService.isValidVerse(verse)) {
        console.log("✅ Versículo do dia carregado da API")
        setVerseOfDay(verse)
      } else {
        console.warn("Versículo inválido recebido da API.")
        setVerseOfDay({
          verseText: "Erro ao carregar versículo do dia",
          reference: "Tente novamente mais tarde",
        })
      }
    } catch (error) {
      console.error("Erro ao carregar versículo do dia:", error)
      setVerseOfDay({
        verseText: "Erro ao carregar versículo do dia",
        reference: "Verifique sua conexão",
      })
    } finally {
      setIsLoadingVerse(false)
    }
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
        <DashboardHeaderContainer user={user} churchData={churchData} onUserUpdate={setUser} />

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6">
            {/* Stats Cards - Apenas para Admin */}
            {user.accessLevel === "admin" && <StatsCardsContainer churchData={churchData} />}

            {/* Conteúdo Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
              {/* Feed de Notificações */}
              <FeedSectionContainer user={user} />

              {/* Sidebar - Aniversários e Banners */}
              <SidebarContentContainer />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
