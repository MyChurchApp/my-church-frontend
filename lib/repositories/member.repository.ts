// Repositório de membros
import type { Member, CreateMemberRequest, UpdateMemberRequest } from "../types/member.types"
import { memberService } from "../services/member.service"

export interface MemberRepository {
  findAll(): Promise<Member[]>
  findById(id: string): Promise<Member>
  create(member: CreateMemberRequest): Promise<Member>
  update(member: UpdateMemberRequest): Promise<Member>
  delete(id: string): Promise<void>
}

export class ApiMemberRepository implements MemberRepository {
  async findAll(): Promise<Member[]> {
    return memberService.getAll()
  }

  async findById(id: string): Promise<Member> {
    return memberService.getById(id)
  }

  async create(member: CreateMemberRequest): Promise<Member> {
    return memberService.create(member)
  }

  async update(member: UpdateMemberRequest): Promise<Member> {
    return memberService.update(member)
  }

  async delete(id: string): Promise<void> {
    return memberService.delete(id)
  }
}

export const memberRepository = new ApiMemberRepository()
