// Repository para membros (camada de abstração)

import type { Member, MemberFormData } from "../types/member.types"
import { MemberService } from "../services/member.service"
import { convertApiMemberToLocal, convertLocalMemberToAPI } from "../utils/member.utils"

export class MemberRepository {
  static async getAllMembers(): Promise<Member[]> {
    try {
      const apiMembers = await MemberService.getAll()
      return apiMembers.map(convertApiMemberToLocal)
    } catch (error) {
      console.error("Repository: Erro ao buscar membros:", error)
      throw error
    }
  }

  static async getMemberById(id: string): Promise<Member> {
    try {
      const apiMember = await MemberService.getById(Number(id))
      return convertApiMemberToLocal(apiMember)
    } catch (error) {
      console.error(`Repository: Erro ao buscar membro ${id}:`, error)
      throw error
    }
  }

  static async createMember(memberData: MemberFormData): Promise<Member> {
    try {
      const apiMemberData = convertLocalMemberToAPI(memberData)
      const createdMember = await MemberService.create(apiMemberData)
      return convertApiMemberToLocal(createdMember)
    } catch (error) {
      console.error("Repository: Erro ao criar membro:", error)
      throw error
    }
  }

  static async updateMember(id: string, memberData: MemberFormData): Promise<Member> {
    try {
      const apiMemberData = convertLocalMemberToAPI(memberData)
      const updatedMember = await MemberService.update(Number(id), apiMemberData)
      return convertApiMemberToLocal(updatedMember)
    } catch (error) {
      console.error(`Repository: Erro ao atualizar membro ${id}:`, error)
      throw error
    }
  }

  static async deleteMember(id: string): Promise<void> {
    try {
      await MemberService.delete(Number(id))
    } catch (error) {
      console.error(`Repository: Erro ao deletar membro ${id}:`, error)
      throw error
    }
  }
}
