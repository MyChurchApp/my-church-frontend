// Tipos para feed/comunicação baseados na API real
export interface Address {
  id: number
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  neighborhood: string
}

export interface Plan {
  id: number
  name: string
  price: number
  maxMembers: number
  maxEvents: number
  maxStorageGB: number
}

export interface Payment {
  id: number
  subscriptionId: number
  subscription: string
  amount: number
  date: string
  paymentStatus: string
  transactionId: string
}

export interface Subscription {
  id: number
  churchId: number
  church: string
  planId: number
  plan: Plan
  startDate: string
  endDate: string
  isActive: boolean
  payments: Payment[]
}

export interface Church {
  id: number
  name: string
  logo: string
  address: Address
  phone: string
  description: string
  members: string[]
  subscription: Subscription
}

export interface Member {
  id: number
  name: string
  document: string
  email: string
  phone: string
  photo: string
  birthDate: string
  isBaptized: boolean
  baptizedDate: string
  isTither: boolean
  churchId: number
  church: Church
  role: number
  created: string
  updated: string
  maritalStatus: string
  memberSince: string
  ministry: string
  isActive: boolean
  notes: string
}

export interface FeedItem {
  id: number
  content: string
  memberId: number
  churchId: number
  created: string
  updated: string
  member: Member
  likesCount: number
}

export interface FeedResponse {
  items: FeedItem[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
}

// Atualização apenas do tipo CreateFeedPostRequest
export interface CreateFeedPostRequest {
  content: string
}

export interface UpdateFeedPostRequest {
  postId: number
  content: string
}
