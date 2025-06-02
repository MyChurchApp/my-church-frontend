import type React from "react"
export interface FeedItem {
  id: number
  content: string
  memberId: number
  memberName: string
  createdAt: string
  updatedAt: string
}

export interface FeedResponse {
  items: FeedItem[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface CreatePostRequest {
  content: string
}

export interface UpdatePostRequest {
  postId: number
  content: string
}

export interface Notification {
  id: number
  type: string
  title: string
  message: string
  date: string
  read: boolean
}

export interface Banner {
  id: number
  title: string
  subtitle: string
  image: string
  color: string
}

export interface PromoBanner {
  id: number
  title: string
  subtitle: string
  icon: React.ReactNode
  color: string
  action: string
}

export interface Birthday {
  id: number
  name: string
  birthDate: string
  birthdayThisYear: Date
}
