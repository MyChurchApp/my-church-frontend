// Tipos para feed/comunicação
export interface FeedPost {
  id: string
  title: string
  content: string
  author: string
  authorId: string
  createdAt: string
  updatedAt: string
  isPublished: boolean
  tags: string[]
  imageUrl?: string
  likes: number
  comments: number
}

export interface CreateFeedPostRequest {
  title: string
  content: string
  isPublished: boolean
  tags: string[]
  imageUrl?: string
}

export interface UpdateFeedPostRequest extends Partial<CreateFeedPostRequest> {
  id: string
}

export interface FeedApiResponse {
  id: string
  title: string
  content: string
  author: string
  authorId: string
  createdAt: string
  updatedAt: string
  isPublished: boolean
  tags: string[]
  imageUrl?: string
  likes: number
  comments: number
}
