"use client"

import { useState, useEffect } from "react"
import { SidebarContent } from "@/app/dashboard/components/sidebar/sidebar-content"
import { getMembersFromAPI, type ApiMember } from "@/lib/api"
import { getUserRole } from "@/lib/auth-utils"

export function SidebarContentContainer() {
  const [members, setMembers] = useState<ApiMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const userRole = getUserRole()
  const isAdmin = userRole === "Admin"

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Buscar apenas os primeiros membros para a sidebar
      const membersData = await getMembersFromAPI(1, 5)
      setMembers(membersData.items)
    } catch (error) {
      console.error("Erro ao carregar membros:", error)
      setError("Erro ao carregar membros")
      setMembers([])
    } finally {
      setIsLoading(false)
    }
  }

  // Converter membros da API para o formato esperado pelo componente
  const convertedMembers = members.map((member) => ({
    id: member.id.toString(),
    name: member.name,
    role: member.role === 1 ? "Admin" : "Membro",
    avatar: member.photo || "/placeholder.svg?height=32&width=32",
    isOnline: Math.random() > 0.5, // Simulação de status online
  }))

  return (
    <SidebarContent
      members={convertedMembers}
      isLoading={isLoading}
      error={error}
      isAdmin={isAdmin}
      onRefresh={loadMembers}
    />
  )
}
