"use client"

import { useState, useEffect, useCallback } from "react"

import { FeedSection } from "@/app/dashboard/components/feed/feed-section.component"
import {
  getFeed,
  createFeedPost,
  updateFeedPost,
  deleteFeedPost,
  likeFeedPost,
  unlikeFeedPost,
  type FeedItem,
  type FeedResponse,
  type PostLikeState,
} from "@/services/feed.service"

const PAGE_SIZE = 10

export const FeedSectionContainer = () => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [likeStates, setLikeStates] = useState<PostLikeState>({})

  const loadFeed = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response: FeedResponse = await getFeed(page, PAGE_SIZE)
      setFeedItems((prevItems) => [...prevItems, ...response.items])
      setHasMore(response.items.length === PAGE_SIZE)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feed")
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    loadFeed().then(() => {
      if (feedItems.length > 0) {
        initializeLikeStates(feedItems)
      }
    })
  }, [])

  const handleCreatePost = async (text: string) => {
    try {
      setLoading(true)
      const newPost = await createFeedPost(text)
      setFeedItems((prevItems) => [newPost, ...prevItems])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePost = async (id: number, text: string) => {
    try {
      setLoading(true)
      await updateFeedPost(id, text)
      setFeedItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, text } : item)))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update post")
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (id: number) => {
    try {
      setLoading(true)
      await deleteFeedPost(id)
      setFeedItems((prevItems) => prevItems.filter((item) => item.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete post")
    } finally {
      setLoading(false)
    }
  }

  const handleLikePost = async (postId: number) => {
    const currentState = likeStates[postId]
    const isCurrentlyLiked = currentState?.isLiked || false

    // Atualizar estado otimisticamente
    setLikeStates((prev) => ({
      ...prev,
      [postId]: {
        isLiked: !isCurrentlyLiked,
        likesCount: (currentState?.likesCount || 0) + (isCurrentlyLiked ? -1 : 1),
        loading: true,
      },
    }))

    try {
      if (isCurrentlyLiked) {
        await unlikeFeedPost(postId)
      } else {
        await likeFeedPost(postId)
      }

      // Atualizar o estado final
      setLikeStates((prev) => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          loading: false,
        },
      }))

      // Atualizar o feed para obter contagem real
      await loadFeed()
    } catch (error) {
      // Reverter estado em caso de erro
      setLikeStates((prev) => ({
        ...prev,
        [postId]: {
          isLiked: isCurrentlyLiked,
          likesCount: currentState?.likesCount || 0,
          loading: false,
        },
      }))

      console.error("Erro ao curtir/descurtir post:", error)
      setError(error instanceof Error ? error.message : "Erro ao processar like")
    }
  }

  const handleLoadMore = () => {
    if (hasMore) {
      setPage((prevPage) => prevPage + 1)
    }
  }

  const handleRefresh = () => {
    setPage(1)
    setFeedItems([])
    loadFeed()
  }

  const initializeLikeStates = (items: FeedItem[]) => {
    const newLikeStates: PostLikeState = {}
    items.forEach((item) => {
      newLikeStates[item.id] = {
        isLiked: false, // A API não retorna se o usuário atual curtiu, então assumimos false
        likesCount: item.likesCount,
        loading: false,
      }
    })
    setLikeStates((prev) => ({ ...prev, ...newLikeStates }))
  }

  return (
    <FeedSection
      feedItems={feedItems}
      loading={loading}
      error={error}
      hasMore={hasMore}
      likeStates={likeStates}
      onCreatePost={handleCreatePost}
      onUpdatePost={handleUpdatePost}
      onDeletePost={handleDeletePost}
      onLikePost={handleLikePost}
      onLoadMore={handleLoadMore}
      onRefresh={handleRefresh}
    />
  )
}
