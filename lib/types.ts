// Tipos básicos do sistema
export interface User {
  id: string
  name: string
  email: string
  role: string
  accessLevel: "admin" | "member"
}

export interface ChurchData {
  id: string
  name: string
  logo: string
}

// Tipos para membros
export interface Member {
  id: string
  name: string
  email: string
  phone: string
  cpf: string
  rg?: string
  birthDate: string
  address: string
  city: string
  state: string
  zipCode: string
  maritalStatus: string
  baptized: boolean
  memberSince: string
  ministry: string
  photo: string
  isActive: boolean
  notes: string
}

// Tipos para eventos
export interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  type: string
  isRecurring: boolean
}

// Tipos para doações
export interface Donation {
  id: string
  amount: number
  date: string
  type: string
  description: string
  memberName?: string
  status: string
}

// Tipos para transações financeiras
export interface Transaction {
  id: string
  description: string
  amount: number
  type: "income" | "expense"
  category: string
  date: string
  status: string
}

// Tipos para estatísticas
export interface Stats {
  totalMembers: number
  activeMembers: number
  totalDonations: number
  monthlyIncome: number
  monthlyExpenses: number
  upcomingEvents: number
}

// Tipos para feed/posts
export interface Post {
  id: string
  content: string
  author: string
  date: string
  likes: number
}

// Tipos para configurações
export interface ChurchSettings {
  name: string
  address: string
  phone: string
  email: string
  logo: string
  description: string
}

// Tipos para relatórios
export interface Report {
  id: string
  title: string
  type: string
  dateRange: {
    start: string
    end: string
  }
  data: any
  generatedAt: string
}

// Tipos para notificações
export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "error" | "success"
  read: boolean
  createdAt: string
}

// Tipos para cultos
export interface Worship {
  id: string
  title: string
  date: string
  time: string
  preacher: string
  theme: string
  attendance: number
  notes: string
}

// Tipos para ministérios
export interface Ministry {
  id: string
  name: string
  description: string
  leader: string
  members: string[]
  activities: string[]
}

// Tipos para grupos
export interface Group {
  id: string
  name: string
  description: string
  leader: string
  members: string[]
  meetingDay: string
  meetingTime: string
  location: string
}

// Tipos para comunicação
export interface Communication {
  id: string
  title: string
  content: string
  type: "announcement" | "newsletter" | "sms" | "email"
  recipients: string[]
  sentAt: string
  status: string
}

// Tipos para agenda
export interface Schedule {
  id: string
  title: string
  description: string
  date: string
  time: string
  duration: number
  location: string
  participants: string[]
  type: string
}
