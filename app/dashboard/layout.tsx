"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { isAuthenticated } from "@/lib/auth-utils"

// Interface para dados do usuário real
interface User {
  id: string
  name: string
  email: string
  role: string
  accessLevel: string
}

// Interface para dados da igreja (simplificada)
interface ChurchData {
  name: string
  logo?: string
}

// Função para obter dados do usuário real da API
const getRealUserData = async (): Promise<User | null> => {
  if (typeof window === "undefined") return null

  const token = localStorage.getItem("authToken")
  const role = localStorage.getItem("userRole")

  if (!token) return null

  try {
    // Tentar obter dados do membro se existir
    const memberData = localStorage.getItem("user")
    if (memberData) {
      const member = JSON.parse(memberData)
      return {
        id: member.id?.toString() || "1",
        name: member.name || "Usuário",
        email: member.email || member.identifier || "",
        role: role || "Membro",
        accessLevel: role === "Admin" ? "admin" : "member",
      }
    }

    // Fallback: decodificar token JWT
    const payload = JSON.parse(atob(token.split(".")[1]))
    return {
      id: payload.nameid || payload.sub || "1",
      name: payload.name || payload.email || "Usuário",
      email: payload.email || "",
      role: role || "Membro",
      accessLevel: role === "Admin" ? "admin" : "member",
    }
  } catch (error) {
    console.error("❌ Erro ao obter dados do usuário:", error)
    return null
  }
}

// Função para obter dados da igreja
const getChurchData = (): ChurchData => {
  // Por enquanto retorna dados padrão, pode ser expandido para buscar da API
  return {
    name: "MyChurch",
    logo: "/mychurch-logo.png",
  }
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [churchData, setChurchData] = useState<ChurchData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeDashboard = async () => {
      // Verificar se está autenticado
      if (!isAuthenticated()) {
        router.push("/login")
        return
      }

      try {
        // Obter dados do usuário
        const userData = await getRealUserData()

        if (!userData) {
          console.error("❌ Não foi possível obter dados do usuário")
          router.push("/login")
          return
        }

        setUser(userData)
        setChurchData(getChurchData())
      } catch (error) {
        console.error("❌ Erro ao inicializar dashboard:", error)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    initializeDashboard()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user || !churchData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Erro ao carregar dados do usuário</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <h2 className="text-lg font-semibold text-gray-900">{churchData.name}</h2>
                <p className="text-sm text-gray-600">Sistema de Gestão Eclesiástica</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-600">{user.role}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
