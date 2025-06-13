"use client"

import { useState, useEffect } from "react"
import { FeedSection } from "../../components/feed/feed-section"
import {
  getFeed,
  createFeedPost,
  updateFeedPost,
  deleteFeedPost,
  type FeedItem,
  type FeedResponse,
} from "@/services/feed.service"

export function FeedSectionContainer() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const loadFeed = async (page = 1, append = false) => {
    try {
      if (!append) {
        setLoading(true)
      }
      setError(null)

      const feedData: FeedResponse = await getFeed(page, 10)

      if (append) {
        setFeedItems((prev) => [...prev, ...feedData.items])
      } else {
        setFeedItems(feedData.items || [])
      }

      setCurrentPage(feedData.pageNumber)
      setTotalPages(feedData.totalPages)
      setHasMore(feedData.pageNumber < feedData.totalPages)
    } catch (error) {
      console.error("Erro ao carregar feed:", error)
      setError("Erro ao carregar feed. Tente novamente.")
      if (!append) {
        setFeedItems([])
      }
    } finally {
      if (!append) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    loadFeed()
  }, [])

  const handleCreatePost = async (content: string) => {
    try {
      const postId = await createFeedPost(content)

      // Recarregar o feed para mostrar o novo post
      await loadFeed(1, false)

      return postId
    } catch (error) {
      console.error("Erro ao criar post:", error)
      throw error
    }
  }

  const handleUpdatePost = async (postId: number, content: string) => {
    try {
      await updateFeedPost(postId, content)

      // Atualizar o post na lista local
      setFeedItems((prev) =>
        prev.map((item) => (item.id === postId ? { ...item, content, updated: new Date().toISOString() } : item)),
      )
    } catch (error) {
      console.error("Erro ao atualizar post:", error)
      throw error
    }
  }

  const handleDeletePost = async (postId: number) => {
    try {
      await deleteFeedPost(postId)

      // Remover o post da lista local
      setFeedItems((prev) => prev.filter((item) => item.id !== postId))
    } catch (error) {
      console.error("Erro ao deletar post:", error)
      throw error
    }
  }

  const handleLoadMore = async () => {
    if (hasMore && !loading) {
      await loadFeed(currentPage + 1, true)
    }
  }

  const handleRefresh = async () => {
    await loadFeed(1, false)
  }

  return (
    <FeedSection
      feedItems={feedItems}
      loading={loading}
      error={error}
      hasMore={hasMore}
      onCreatePost={handleCreatePost}
      onUpdatePost={handleUpdatePost}
      onDeletePost={handleDeletePost}
      onLoadMore={handleLoadMore}
      onRefresh={handleRefresh}
    />
  )
}
