// Arquivo principal da API - agora apenas re-exporta as funcionalidades

// Re-export dos tipos
export type {
  ApiMember,
  CreateMemberRequest,
  Member,
  MemberFormData,
} from "./types/member.types"

export type {
  ApiFeedItem,
  ApiFeedResponse,
  CreateFeedPostRequest,
  UpdateFeedPostRequest,
} from "./types/feed.types"

export type {
  AuthToken,
  CurrentUser,
} from "./types/auth.types"

// Re-export dos utilitários
export {
  getAuthToken,
  getCurrentUser,
  isAuthenticated,
  logout,
} from "./utils/auth.utils"

export {
  convertApiMemberToLocal,
  convertLocalMemberToAPI,
  formatTimeAgo,
  canEditOrDeletePost,
} from "./utils/member.utils"

// Re-export dos repositories (interface principal)
export { MemberRepository } from "./repositories/member.repository"
export { FeedRepository } from "./repositories/feed.repository"

// Funções de compatibilidade com o código existente
export const getMembersFromAPI = () => MemberRepository.getAllMembers()
export const createMemberInAPI = (data: any) => MemberRepository.createMember(data)
export const updateMemberInAPI = (id: number, data: any) => MemberRepository.updateMember(id.toString(), data)
export const deleteMemberFromAPI = (id: number) => MemberRepository.deleteMember(id.toString())

export const getFeedFromAPI = (page?: number, pageSize?: number) => FeedRepository.getFeed(page, pageSize)
export const createFeedPost = (content: string) => FeedRepository.createPost(content)
export const updateFeedPost = (id: number, content: string) => FeedRepository.updatePost(id, content)
export const deleteFeedPost = (id: number) => FeedRepository.deletePost(id)
export const refreshFeed = (page?: number, pageSize?: number) => FeedRepository.refreshFeed(page, pageSize)
export const createFeedPostWithFallback = (content: string) => FeedRepository.createPost(content)
