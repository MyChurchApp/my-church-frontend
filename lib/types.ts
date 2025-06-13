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
