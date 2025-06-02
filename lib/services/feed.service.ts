// Serviço para operações do feed

import type { ApiFeedResponse, ApiFeedItem } from "../types/feed.types"
import { httpClient } from "../utils/http.utils"
import { getApiUrl } from "../config/api.config"
import { getCurrentUser } from "../utils/auth.utils"

export class FeedService {
  private static readonly ENDPOINT = "/Feed"

  static async getFeed(page = 1, pageSize = 10): Promise<ApiFeedResponse> {
    try {
      console.log(`Buscando feed - página ${page}, tamanho ${pageSize}`)
      const url = `${getApiUrl(this.ENDPOINT)}?pageNumber=${page}&pageSize=${pageSize}`
      const response = await httpClient(url)
      const data: ApiFeedResponse = await response.json()
      console.log("Feed carregado:", data)
      return data
    } catch (error) {
      console.error("Erro ao buscar feed:", error)
      throw new Error("Falha ao carregar feed")
    }
  }

  static async createPost(content: string): Promise<ApiFeedItem> {
    try {
      console.log("Criando novo post:", content)
      const response = await httpClient(getApiUrl(this.ENDPOINT), {
        method: "POST",
        body: JSON.stringify({ content }),
      })

      // A API pode retornar apenas o ID ou o objeto completo
      const data = await response.json()
      console.log("Resposta da API ao criar post:", data)

      // Se retornou apenas o ID, buscar o post completo
      if (typeof data === "number") {
        const postId = data
        console.log("Post criado com ID:", postId)

        // Buscar o feed atualizado para encontrar o post
        const feedData = await this.getFeed(1, 20)
        const createdPost = feedData.items.find((item) => item.id === postId)

        if (createdPost) {
          console.log("Post completo encontrado:", createdPost)
          return createdPost
        } else {
          // Criar objeto temporário se não encontrar
          return this.createTemporaryPost(postId, content)
        }
      }

      // Se já retornou o objeto completo
      if (typeof data === "object" && data.id !== undefined) {
        console.log("Post completo retornado:", data)
        return data as ApiFeedItem
      }

      throw new Error("Formato de resposta não reconhecido")
    } catch (error) {
      console.error("Erro ao criar post:", error)
      throw new Error("Falha ao criar post")
    }
  }

  static async updatePost(postId: number, content: string): Promise<ApiFeedItem> {
    try {
      console.log(`Atualizando post ${postId}:`, content)
      const response = await httpClient(getApiUrl(`${this.ENDPOINT}/${postId}`), {
        method: "PUT",
        body: JSON.stringify({
          postId: 0, // Conforme documentação da API
          content,
        }),
      })

      const data = await response.json()
      console.log("Post atualizado:", data)

      // Se retornou o objeto completo
      if (typeof data === "object" && data.id !== undefined) {
        return data as ApiFeedItem
      }

      // Se não retornou o objeto, buscar no feed
      const feedData = await this.getFeed(1, 20)
      const updatedPost = feedData.items.find((item) => item.id === postId)

      if (updatedPost) {
        return updatedPost
      }

      throw new Error("Post atualizado não encontrado")
    } catch (error) {
      console.error(`Erro ao atualizar post ${postId}:`, error)
      throw new Error("Falha ao atualizar post")
    }
  }

  static async deletePost(postId: number): Promise<void> {
    try {
      console.log(`Deletando post ${postId}`)
      await httpClient(getApiUrl(`${this.ENDPOINT}/${postId}`), {
        method: "DELETE",
      })
      console.log("Post deletado com sucesso")
    } catch (error) {
      console.error(`Erro ao deletar post ${postId}:`, error)
      throw new Error("Falha ao deletar post")
    }
  }

  private static createTemporaryPost(postId: number, content: string): ApiFeedItem {
    const currentUser = getCurrentUser()
    return {
      id: postId,
      content: content,
      memberId: Number.parseInt(currentUser?.id || "0"),
      churchId: 0,
      created: new Date().toISOString(),
      updated: null,
      member: {
        id: Number.parseInt(currentUser?.id || "0"),
        name: currentUser?.name || "Usuário",
        document: "",
        email: currentUser?.email || "",
        phone: "",
        photo: null,
        birthDate: "1990-01-01T00:00:00",
        isBaptized: false,
        baptizedDate: "1990-01-01T00:00:00",
        isTither: false,
        churchId: 0,
        church: null,
        role: 0,
        created: new Date().toISOString(),
        updated: null,
        maritalStatus: null,
        memberSince: null,
        ministry: null,
        isActive: true,
        notes: null,
      },
      likesCount: 0,
    }
  }
}
