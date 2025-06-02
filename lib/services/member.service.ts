// Serviço de membros
import type { Member, CreateMemberRequest, UpdateMemberRequest, MemberApiResponse } from "../types/member.types"
import { apiRequest } from "../utils/http.utils"
import { API_CONFIG } from "../config/api.config"
import { convertApiToMember, convertMemberToApi } from "../utils/member.utils"

export class MemberService {
  async getAll(): Promise<Member[]> {
    try {
      const response = await apiRequest<MemberApiResponse[]>(API_CONFIG.ENDPOINTS.MEMBERS.BASE)
      return response.data.map(convertApiToMember)
    } catch (error) {
      console.error("Erro ao buscar membros:", error)
      throw error
    }
  }

  async getById(id: string): Promise<Member> {
    try {
      const response = await apiRequest<MemberApiResponse>(API_CONFIG.ENDPOINTS.MEMBERS.BY_ID(id))
      return convertApiToMember(response.data)
    } catch (error) {
      console.error(`Erro ao buscar membro ${id}:`, error)
      throw error
    }
  }

  async create(memberData: CreateMemberRequest): Promise<Member> {
    try {
      const apiData = convertMemberToApi(memberData)
      const response = await apiRequest<MemberApiResponse>(API_CONFIG.ENDPOINTS.MEMBERS.BASE, {
        method: "POST",
        body: JSON.stringify(apiData),
      })
      return convertApiToMember(response.data)
    } catch (error) {
      console.error("Erro ao criar membro:", error)
      throw error
    }
  }

  async update(memberData: UpdateMemberRequest): Promise<Member> {
    try {
      const { id, ...updateData } = memberData
      const apiData = convertMemberToApi(updateData as CreateMemberRequest)
      const response = await apiRequest<MemberApiResponse>(API_CONFIG.ENDPOINTS.MEMBERS.BY_ID(id), {
        method: "PUT",
        body: JSON.stringify(apiData),
      })
      return convertApiToMember(response.data)
    } catch (error) {
      console.error(`Erro ao atualizar membro ${memberData.id}:`, error)
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiRequest(API_CONFIG.ENDPOINTS.MEMBERS.BY_ID(id), {
        method: "DELETE",
      })
    } catch (error) {
      console.error(`Erro ao deletar membro ${id}:`, error)
      throw error
    }
  }
}

export const memberService = new MemberService()
