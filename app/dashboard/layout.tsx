"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { isAuthenticated } from "@/lib/auth-utils"
import type { User, ChurchData } from "@/lib/types"

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
  return {
    id: "1",
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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Verificar se está autenticado
        if (!isAuthenticated()) {
          router.push("/login")
          return
        }

        // Obter dados do usuário
        const userData = await getRealUserData()

        if (!userData) {
          console.error("❌ Não foi possível obter dados do usuário")
          setError("Erro ao carregar dados do usuário")
          return
        }

        setUser(userData)
        setChurchData(getChurchData())
      } catch (error) {
        console.error("❌ Erro ao inicializar dashboard:", error)
        setError("Erro ao inicializar dashboard")
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    )
  }

  if (!user || !churchData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Erro ao carregar dados</p>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Voltar ao Login
          </button>
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
