// Serviço de feed
import type { FeedPost, CreateFeedPostRequest, UpdateFeedPostRequest, FeedApiResponse } from "../types/feed.types"
import { apiRequest } from "../utils/http.utils"
import { API_CONFIG } from "../config/api.config"

export class FeedService {
  async getAll(): Promise<FeedPost[]> {
    try {
      const response = await apiRequest<FeedApiResponse[]>(API_CONFIG.ENDPOINTS.FEED.BASE)
      return response.data.map(this.convertApiToFeedPost)
    } catch (error) {
      console.error("Erro ao buscar posts do feed:", error)
      throw error
    }
  }

  async getById(id: string): Promise<FeedPost> {
    try {
      const response = await apiRequest<FeedApiResponse>(API_CONFIG.ENDPOINTS.FEED.BY_ID(id))
      return this.convertApiToFeedPost(response.data)
    } catch (error) {
      console.error(`Erro ao buscar post ${id}:`, error)
      throw error
    }
  }

  async create(postData: CreateFeedPostRequest): Promise<FeedPost> {
    try {
      const response = await apiRequest<FeedApiResponse>(API_CONFIG.ENDPOINTS.FEED.BASE, {
        method: "POST",
        body: JSON.stringify(postData),
      })
      return this.convertApiToFeedPost(response.data)
    } catch (error) {
      console.error("Erro ao criar post:", error)
      throw error
    }
  }

  async update(postData: UpdateFeedPostRequest): Promise<FeedPost> {
    try {
      const { id, ...updateData } = postData
      const response = await apiRequest<FeedApiResponse>(API_CONFIG.ENDPOINTS.FEED.BY_ID(id), {
        method: "PUT",
        body: JSON.stringify(updateData),
      })
      return this.convertApiToFeedPost(response.data)
    } catch (error) {
      console.error(`Erro ao atualizar post ${postData.id}:`, error)
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiRequest(API_CONFIG.ENDPOINTS.FEED.BY_ID(id), {
        method: "DELETE",
      })
    } catch (error) {
      console.error(`Erro ao deletar post ${id}:`, error)
      throw error
    }
  }

  private convertApiToFeedPost(apiPost: FeedApiResponse): FeedPost {
    return {
      id: apiPost.id,
      title: apiPost.title,
      content: apiPost.content,
      author: apiPost.author,
      authorId: apiPost.authorId,
      createdAt: apiPost.createdAt,
      updatedAt: apiPost.updatedAt,
      isPublished: apiPost.isPublished,
      tags: apiPost.tags,
      imageUrl: apiPost.imageUrl,
      likes: apiPost.likes,
      comments: apiPost.comments,
    }
  }
}

export const feedService = new FeedService()
