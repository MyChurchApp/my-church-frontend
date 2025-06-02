// Repository para feed (camada de abstração)

import type { ApiFeedResponse, ApiFeedItem } from "../types/feed.types"
import { FeedService } from "../services/feed.service"

export class FeedRepository {
  static async getFeed(page = 1, pageSize = 10): Promise<ApiFeedResponse> {
    try {
      return await FeedService.getFeed(page, pageSize)
    } catch (error) {
      console.error("Repository: Erro ao buscar feed:", error)
      throw error
    }
  }

  static async createPost(content: string): Promise<ApiFeedItem> {
    try {
      return await FeedService.createPost(content)
    } catch (error) {
      console.error("Repository: Erro ao criar post:", error)
      throw error
    }
  }

  static async updatePost(postId: number, content: string): Promise<ApiFeedItem> {
    try {
      return await FeedService.updatePost(postId, content)
    } catch (error) {
      console.error("Repository: Erro ao atualizar post:", error)
      throw error
    }
  }

  static async deletePost(postId: number): Promise<void> {
    try {
      await FeedService.deletePost(postId)
    } catch (error) {
      console.error("Repository: Erro ao deletar post:", error)
      throw error
    }
  }

  static async refreshFeed(page = 1, pageSize = 10): Promise<ApiFeedResponse> {
    try {
      console.log("Repository: Recarregando feed...")
      return await this.getFeed(page, pageSize)
    } catch (error) {
      console.error("Repository: Erro ao recarregar feed:", error)
      throw error
    }
  }
}
