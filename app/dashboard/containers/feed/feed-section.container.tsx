"use client"

import { useState, useEffect } from "react"
import { FeedSection } from "@/app/dashboard/components/feed/feed-section"
import {
  getFeedFromAPI,
  createFeedPostWithFallback,
  updateFeedPost,
  deleteFeedPost,
  type ApiFeedItem,
  getCurrentUserId,
  canEditOrDeletePost,
} from "@/lib/api"

export function FeedSectionContainer() {
  const [posts, setPosts] = useState<ApiFeedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const currentUserId = getCurrentUserId()

  // Carregar feed inicial
  useEffect(() => {
    loadFeed()
  }, [currentPage])

  const loadFeed = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const feedData = await getFeedFromAPI(currentPage, 10)
      setPosts(feedData.items)
      setTotalPages(feedData.totalPages)
    } catch (error) {
      console.error("Erro ao carregar feed:", error)
      setError("Erro ao carregar publicações. Tente novamente.")
      setPosts([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePost = async (content: string) => {
    if (!content.trim()) return

    try {
      setIsCreating(true)
      setError(null)

      const newPost = await createFeedPostWithFallback(content)

      // Adicionar o novo post no início da lista
      setPosts((prevPosts) => [newPost, ...prevPosts])

      // Se estivermos na primeira página, não precisamos recarregar
      // Se não, voltar para a primeira página
      if (currentPage !== 1) {
        setCurrentPage(1)
      }
    } catch (error) {
      console.error("Erro ao criar post:", error)
      setError("Erro ao criar publicação. Tente novamente.")
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditPost = async (postId: number, newContent: string) => {
    try {
      setError(null)

      const updatedPost = await updateFeedPost(postId, newContent)

      // Atualizar o post na lista
      setPosts((prevPosts) => prevPosts.map((post) => (post.id === postId ? updatedPost : post)))
    } catch (error) {
      console.error("Erro ao editar post:", error)
      setError("Erro ao editar publicação. Tente novamente.")
    }
  }

  const handleDeletePost = async (postId: number) => {
    try {
      setError(null)

      await deleteFeedPost(postId)

      // Remover o post da lista
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId))
    } catch (error) {
      console.error("Erro ao deletar post:", error)
      setError("Erro ao deletar publicação. Tente novamente.")
    }
  }

  const handleRefresh = () => {
    loadFeed()
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Converter posts da API para o formato esperado pelo componente
  const convertedPosts = posts.map((post) => ({
    id: post.id.toString(),
    author: post.member?.name || "Usuário",
    content: post.content,
    timestamp: post.created,
    avatar: post.member?.photo || "/placeholder.svg?height=40&width=40",
    canEdit: currentUserId === post.memberId.toString() && canEditOrDeletePost(post.created),
    canDelete: currentUserId === post.memberId.toString() && canEditOrDeletePost(post.created),
  }))

  return (
    <FeedSection
      posts={convertedPosts}
      isLoading={isLoading}
      isCreating={isCreating}
      error={error}
      currentPage={currentPage}
      totalPages={totalPages}
      onCreatePost={handleCreatePost}
      onEditPost={(postId, content) => handleEditPost(Number.parseInt(postId), content)}
      onDeletePost={(postId) => handleDeletePost(Number.parseInt(postId))}
      onRefresh={handleRefresh}
      onPageChange={handlePageChange}
    />
  )
}
