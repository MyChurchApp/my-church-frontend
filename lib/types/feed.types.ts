// Tipos relacionados ao feed

import type { ApiMember } from "./member.types"

export interface ApiFeedItem {
  id: number
  content: string
  memberId: number
  churchId: number
  created: string
  updated: string | null
  member: ApiMember
  likesCount: number
}

export interface ApiFeedResponse {
  items: ApiFeedItem[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface CreateFeedPostRequest {
  content: string
}

export interface UpdateFeedPostRequest {
  postId: number
  content: string
}
