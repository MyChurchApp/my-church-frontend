import type { FeedItem, FeedResponse, CreateFeedPostRequest, UpdateFeedPostRequest } from "@/lib/types/feed.types"
import { httpClient } from "@/lib/utils/http.utils"

export class FeedService {
  private static readonly BASE_URL = "https://demoapp.top1soft.com.br/api/Feed"

  static async getFeed(pageNumber = 1, pageSize = 10): Promise<FeedResponse> {
    try {
      console.log(`🌐 Buscando feed - Página: ${pageNumber}, Tamanho: ${pageSize}`)

      const url = `${this.BASE_URL}?pageNumber=${pageNumber}&pageSize=${pageSize}`
      const response = await httpClient.get<FeedResponse>(url)

      console.log("✅ Feed carregado com sucesso:", response)
      return response
    } catch (error) {
      console.error("❌ Erro ao buscar feed:", error)
      throw error // Propagar o erro para ser tratado no hook
    }
  }

  static async createPost(request: CreateFeedPostRequest): Promise<number> {
    try {
      console.log("🌐 Criando post:", request)

      // Payload exato conforme Swagger
      const payload = {
        content: request.content,
      }

      const response = await httpClient.post<number>(this.BASE_URL, payload)

      console.log("✅ Post criado com sucesso. ID:", response)
      return response
    } catch (error) {
      console.error("❌ Erro ao criar post:", error)
      throw error
    }
  }

  static async updatePost(postId: number, request: UpdateFeedPostRequest): Promise<FeedItem> {
    try {
      console.log(`🌐 Atualizando post ${postId}:`, request)

      // Payload exato conforme Swagger
      const payload = {
        content: request.content,
      }

      // O PUT retorna o objeto FeedItem completo conforme Swagger
      const response = await httpClient.put<FeedItem>(`${this.BASE_URL}/${postId}`, payload)

      console.log("✅ Post atualizado com sucesso:", response)
      return response
    } catch (error) {
      console.error("❌ Erro ao atualizar post:", error)
      throw error
    }
  }

  static async deletePost(postId: number): Promise<void> {
    try {
      console.log(`🌐 Deletando post ${postId}`)

      // DELETE retorna 204 No Content em caso de sucesso
      await httpClient.delete(`${this.BASE_URL}/${postId}`)

      console.log("✅ Post deletado com sucesso")
    } catch (error) {
      console.error("❌ Erro ao deletar post:", error)
      throw error
    }
  }

  // Método para testar conectividade
  static async testConnection(): Promise<boolean> {
    try {
      await this.getFeed(1, 1)
      return true
    } catch (error) {
      console.error("❌ Teste de conexão falhou:", error)
      return false
    }
  }
}

// Exportações
export default FeedService
