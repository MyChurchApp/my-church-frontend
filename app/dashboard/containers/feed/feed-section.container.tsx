"use client"

import { useState, useEffect } from "react"
import { FeedSection } from "../../components/feed/feed-section"
import { getFeedFromAPI, createFeedPost, updateFeedPost, deleteFeedPost, type ApiFeedItem } from "@/lib/api"

export function FeedSectionContainer() {
  const [feedItems, setFeedItems] = useState<ApiFeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadFeed = async () => {
    try {
      setLoading(true)
      setError(null)
      const feedData = await getFeedFromAPI(1, 10)
      setFeedItems(feedData.items || [])
    } catch (error) {
      console.error("Erro ao carregar feed:", error)
      setError("Erro ao carregar feed")
      setFeedItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFeed()
  }, [])

  const handleCreatePost = async (content: string) => {
    try {
      const newPost = await createFeedPost(content)
      setFeedItems((prev) => [newPost, ...prev])
      return newPost
    } catch (error) {
      console.error("Erro ao criar post:", error)
      throw error
    }
  }

  const handleUpdatePost = async (postId: number, content: string) => {
    try {
      const updatedPost = await updateFeedPost(postId, content)
      setFeedItems((prev) => prev.map((item) => (item.id === postId ? updatedPost : item)))
      return updatedPost
    } catch (error) {
      console.error("Erro ao atualizar post:", error)
      throw error
    }
  }

  const handleDeletePost = async (postId: number) => {
    try {
      await deleteFeedPost(postId)
      setFeedItems((prev) => prev.filter((item) => item.id !== postId))
    } catch (error) {
      console.error("Erro ao deletar post:", error)
      throw error
    }
  }

  return (
    <FeedSection
      feedItems={feedItems}
      loading={loading}
      error={error}
      onCreatePost={handleCreatePost}
      onUpdatePost={handleUpdatePost}
      onDeletePost={handleDeletePost}
      onRefresh={loadFeed}
    />
  )
}
