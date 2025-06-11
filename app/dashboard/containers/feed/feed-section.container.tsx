"use client"

import { useState, useEffect } from "react"
import { FeedSection } from "../../components/feed/feed-section"
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
  getCurrentUserId, // ✅ ADICIONAR: Nova importação
} from "@/lib/api"
import { getNotifications, formatTimeAgo, type Notification } from "@/lib/fake-api"
import { Calendar, Users, DollarSign } from "lucide-react"
import type { User } from "@/lib/fake-api"

interface FeedSectionContainerProps {
  user: User | null
}

export function FeedSectionContainer({ user }: FeedSectionContainerProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [feedResponse, setFeedResponse] = useState<ApiFeedResponse | null>(null)
  const [feedItems, setFeedItems] = useState<ApiFeedItem[]>([])
  const [isLoadingFeed, setIsLoadingFeed] = useState(false)
  const [feedError, setFeedError] = useState<string | null>(null)
  const [visibleNotifications, setVisibleNotifications] = useState(3)
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false)
  const [newPostContent, setNewPostContent] = useState("")
  const [isCreatingPost, setIsCreatingPost] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<ApiFeedItem | null>(null)
  const [editPostContent, setEditPostContent] = useState("")
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<ApiFeedItem | null>(null)
  const [isDeletingPost, setIsDeletingPost] = useState(false)

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

  const loadFeed = async () => {
    if (!isAuthenticated()) {
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
      setNotifications([])
    } catch (error) {
      console.error("❌ Erro ao carregar feed:", error)

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
    } finally {
      setIsLoadingFeed(false)
    }
  }

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return

    setIsCreatingPost(true)
    try {
      console.log("Criando post com conteúdo:", newPostContent)

      const newPost = await createFeedPostWithFallback(newPostContent)
      console.log("Post criado com sucesso:", newPost)

      setFeedItems((prev) => {
        const exists = prev.some((item) => item.id === newPost.id)
        if (exists) {
          return prev
        }
        return [newPost, ...prev]
      })

      if (feedResponse) {
        setFeedResponse((prev) => ({
          ...prev,
          totalCount: prev.totalCount + 1,
          items: [newPost, ...prev.items.filter((item) => item.id !== newPost.id)],
        }))
      }

      setNewPostContent("")
      setIsNewPostModalOpen(false)

      console.log("Post adicionado ao feed local com sucesso")
    } catch (error) {
      console.error("Erro detalhado ao criar post:", error)

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
      console.log("🔄 Editando post:", {
        postId: editingPost.id,
        newContent: editPostContent,
      })

      const updatedPost = await updateFeedPost(editingPost.id, editPostContent)
      console.log("✅ Post editado com sucesso:", updatedPost)

      // ✅ CORRIGIDO: Atualizar com dados completos do post
      setFeedItems((prevItems) =>
        prevItems.map((item) =>
          item.id === editingPost.id ? { ...item, content: editPostContent, updated: new Date().toISOString() } : item,
        ),
      )

      setIsEditModalOpen(false)
      setEditingPost(null)
      setEditPostContent("")

      // Recarregar feed para garantir dados atualizados
      await loadFeed()
    } catch (error) {
      console.error("❌ Erro ao salvar edição:", error)
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
      console.log("🗑️ Deletando post:", postToDelete.id)

      await deleteFeedPost(postToDelete.id)
      console.log("✅ Post deletado com sucesso")

      setFeedItems((prevItems) => prevItems.filter((item) => item.id !== postToDelete.id))

      if (feedResponse) {
        setFeedResponse((prev) => ({
          ...prev,
          totalCount: Math.max(0, prev.totalCount - 1),
          items: prev.items.filter((item) => item.id !== postToDelete.id),
        }))
      }

      setIsDeleteDialogOpen(false)
      setPostToDelete(null)
    } catch (error) {
      console.error("❌ Erro ao deletar post:", error)
      alert("Erro ao deletar post. Por favor, tente novamente.")
    } finally {
      setIsDeletingPost(false)
    }
  }

  const canUserEditOrDeletePost = (item: ApiFeedItem): boolean => {
    // ✅ CORRIGIDO: Usar getCurrentUserId() em vez de user?.id
    const currentUserId = getCurrentUserId()
    if (!currentUserId) {
      console.log("❌ Usuário não autenticado")
      return false
    }

    // ✅ CORRIGIDO: Comparar IDs como string
    const isOwner = currentUserId === item.memberId.toString()
    const canEdit = canEditOrDeletePost(item.created)

    console.log("🔍 Verificando permissões:", {
      currentUserId,
      postMemberId: item.memberId,
      postMemberIdString: item.memberId.toString(),
      isOwner,
      canEdit,
      postCreated: item.created,
      result: isOwner && canEdit,
    })

    return isOwner && canEdit
  }

  const loadMoreNotifications = () => {
    setVisibleNotifications((prev) => prev + 5)
  }

  useEffect(() => {
    loadFeed()
  }, [])

  // Determinar se deve mostrar feed real ou fake
  const showRealFeed = isAuthenticated() && feedItems.length > 0
  const showFakeNotifications = !isAuthenticated() && notifications.length > 0

  return (
    <FeedSection
      isLoadingFeed={isLoadingFeed}
      feedError={feedError}
      feedItems={feedItems}
      feedResponse={feedResponse}
      notifications={notifications}
      visibleNotifications={visibleNotifications}
      showRealFeed={showRealFeed}
      showFakeNotifications={showFakeNotifications}
      isAuthenticated={isAuthenticated()}
      isNewPostModalOpen={isNewPostModalOpen}
      newPostContent={newPostContent}
      isCreatingPost={isCreatingPost}
      isEditModalOpen={isEditModalOpen}
      editPostContent={editPostContent}
      isSavingEdit={isSavingEdit}
      isDeleteDialogOpen={isDeleteDialogOpen}
      isDeletingPost={isDeletingPost}
      userId={user?.id}
      onLoadFeed={loadFeed}
      onLoadMoreNotifications={loadMoreNotifications}
      onOpenNewPostModal={() => setIsNewPostModalOpen(true)}
      onCloseNewPostModal={() => setIsNewPostModalOpen(false)}
      onNewPostContentChange={setNewPostContent}
      onCreatePost={handleCreatePost}
      onEditPost={handleEditPost}
      onCloseEditModal={() => setIsEditModalOpen(false)}
      onEditPostContentChange={setEditPostContent}
      onSaveEdit={handleSaveEdit}
      onDeletePost={handleDeletePost}
      onCloseDeleteDialog={() => setIsDeleteDialogOpen(false)}
      onConfirmDeletePost={confirmDeletePost}
      canUserEditOrDeletePost={canUserEditOrDeletePost}
      formatApiTimeAgo={formatApiTimeAgo}
      formatTimeAgo={formatTimeAgo}
      getInitials={getInitials}
      getNotificationIcon={getNotificationIcon}
      getNotificationBadge={getNotificationBadge}
    />
  )
}
