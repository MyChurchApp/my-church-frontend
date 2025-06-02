// Serviço para operações de membros

import type { ApiMember, CreateMemberRequest } from "../types/member.types"
import { httpClient } from "../utils/http.utils"
import { getApiUrl } from "../config/api.config"

export class MemberService {
  private static readonly ENDPOINT = "/Member"

  static async getAll(): Promise<ApiMember[]> {
    try {
      console.log("Buscando todos os membros...")
      const response = await httpClient(getApiUrl(this.ENDPOINT))
      const data: ApiMember[] = await response.json()
      console.log("Membros carregados:", data)
      return data
    } catch (error) {
      console.error("Erro ao buscar membros:", error)
      throw new Error("Falha ao carregar membros")
    }
  }

  static async getById(id: number): Promise<ApiMember> {
    try {
      console.log(`Buscando membro com ID: ${id}`)
      const response = await httpClient(getApiUrl(`${this.ENDPOINT}/${id}`))
      const data: ApiMember = await response.json()
      console.log("Membro encontrado:", data)
      return data
    } catch (error) {
      console.error(`Erro ao buscar membro ${id}:`, error)
      throw new Error("Falha ao carregar membro")
    }
  }

  static async create(memberData: CreateMemberRequest): Promise<ApiMember> {
    try {
      console.log("Criando novo membro:", memberData)
      const response = await httpClient(getApiUrl(this.ENDPOINT), {
        method: "POST",
        body: JSON.stringify(memberData),
      })

      const data: ApiMember = await response.json()
      console.log("Membro criado com sucesso:", data)
      return data
    } catch (error) {
      console.error("Erro ao criar membro:", error)
      throw new Error("Falha ao criar membro")
    }
  }

  static async update(id: number, memberData: CreateMemberRequest): Promise<ApiMember> {
    try {
      console.log(`Atualizando membro ${id}:`, memberData)
      const response = await httpClient(getApiUrl(`${this.ENDPOINT}/${id}`), {
        method: "PUT",
        body: JSON.stringify(memberData),
      })

      const data: ApiMember = await response.json()
      console.log("Membro atualizado com sucesso:", data)
      return data
    } catch (error) {
      console.error(`Erro ao atualizar membro ${id}:`, error)
      throw new Error("Falha ao atualizar membro")
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      console.log(`Deletando membro ${id}`)
      await httpClient(getApiUrl(`${this.ENDPOINT}/${id}`), {
        method: "DELETE",
      })
      console.log("Membro deletado com sucesso")
    } catch (error) {
      console.error(`Erro ao deletar membro ${id}:`, error)
      throw new Error("Falha ao deletar membro")
    }
  }
}
