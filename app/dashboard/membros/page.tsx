"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Plus, Search, Filter, UserCheck, UserX, ChevronLeft, ChevronRight } from "lucide-react"
import {
  getMembersFromAPI,
  createMemberAPI,
  updateMemberAPI,
  deleteMemberAPI,
  convertApiMemberToLocal,
  convertLocalMemberToApi,
  type ApiMember,
} from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { MemberRegistrationModal } from "@/components/member-registration-modal"
import { getUserRole, isAuthenticated } from "@/lib/auth-utils"
import type { User } from "@/lib/types"

export default function MembrosPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [members, setMembers] = useState<ApiMember[]>([])
  const [filteredMembers, setFilteredMembers] = useState<ApiMember[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<any>(null)

  // Paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 20
  const [totalMembers, setTotalMembers] = useState(0)

  // Listener para erros 500
  const userRole = getUserRole()
  const isAdmin = userRole === "Admin"

  useEffect(() => {
    // Verificar autenticação
    if (!isAuthenticated()) {
      router.push("/login")
      return
    }

    // Definir usuário básico
    setUser({
      id: "1",
      name: "Usuário",
      email: "",
      role: userRole || "Membro",
      accessLevel: userRole === "Admin" ? "admin" : "member",
    })

    loadMembers()
  }, [router, currentPage])

  const loadMembers = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await getMembersFromAPI(currentPage, 10)
      const convertedMembers = response.items.map(convertApiMemberToLocal)

      setMembers(convertedMembers)
      setFilteredMembers(convertedMembers)
      setTotalPages(response.totalPages)
      setTotalCount(response.totalCount)
      setTotalMembers(response.totalCount)
    } catch (error: any) {
      console.error("Erro ao carregar membros:", error)

      let errorMessage = "Erro ao carregar membros"
      if (error.message) {
        if (error.message.includes("401")) {
          errorMessage = "Não autorizado. Faça login novamente."
          setTimeout(() => {
            router.push("/login")
          }, 2000)
        } else if (!error.message.includes("Erro interno do servidor")) {
          errorMessage = error.message
        }
      }

      if (!error.message.includes("Erro interno do servidor")) {
        setError(errorMessage)
      }
      setMembers([])
    } finally {
      setLoading(false)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let filtered = members

    if (searchTerm) {
      filtered = filtered.filter(
        (member) =>
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((member) => (statusFilter === "active" ? member.isActive : !member.isActive))
    }

    setFilteredMembers(filtered)
  }, [members, searchTerm, statusFilter])

  useEffect(() => {
    // Filtrar membros baseado no termo de busca
    if (searchTerm.trim() === "") {
      setFilteredMembers(members)
    } else {
      const filtered = members.filter(
        (member) =>
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (member.document && member.document.some((doc) => doc.number.includes(searchTerm.replace(/\D/g, "")))),
      )
      setFilteredMembers(filtered)
    }
  }, [members, searchTerm])

  const generateMembersPDFReport = () => {
    const activeMembers = members.filter((member) => member.isActive)
    const inactiveMembers = members.filter((member) => !member.isActive)

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Membros</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .summary { margin-bottom: 30px; background: #f5f5f5; padding: 15px; border-radius: 5px; }
          .member-section { margin-bottom: 30px; }
          .member-item { margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
          .member-name { font-weight: bold; font-size: 16px; color: #333; }
          .member-details { margin-top: 5px; color: #666; }
          .status-active { color: #22c55e; font-weight: bold; }
          .status-inactive { color: #ef4444; font-weight: bold; }
          h2 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>RELATÓRIO DE MEMBROS</h1>
          <p>Igreja Batista Central</p>
          <p>Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</p>
        </div>

        <div class="summary">
          <h2>RESUMO GERAL</h2>
          <p><strong>Total de Membros:</strong> ${totalCount}</p>
          <p><strong>Membros Ativos:</strong> ${activeMembers.length}</p>
          <p><strong>Membros Inativos:</strong> ${inactiveMembers.length}</p>
          <p><strong>Taxa de Atividade:</strong> ${
            totalCount > 0 ? ((activeMembers.length / totalCount) * 100).toFixed(1) : 0
          }%</p>
        </div>

        <div class="member-section">
          <h2>MEMBROS ATIVOS (${activeMembers.length})</h2>
          ${activeMembers
            .map(
              (member) => `
            <div class="member-item">
              <div class="member-name">${member.name} <span class="status-active">[ATIVO]</span></div>
              <div class="member-details">
                <p><strong>Email:</strong> ${member.email}</p>
                <p><strong>Telefone:</strong> ${member.phone}</p>
                <p><strong>CPF:</strong> ${member.cpf}</p>
                <p><strong>Data de Nascimento:</strong> ${
                  member.birthDate ? new Date(member.birthDate).toLocaleDateString("pt-BR") : "Não informado"
                }</p>
                <p><strong>Estado Civil:</strong> ${member.maritalStatus || "Não informado"}</p>
                <p><strong>Endereço:</strong> ${
                  member.address || "Não informado"
                }, ${member.city || ""} - ${member.state || ""}, ${member.zipCode || ""}</p>
                <p><strong>Membro desde:</strong> ${
                  member.memberSince ? new Date(member.memberSince).toLocaleDateString("pt-BR") : "Não informado"
                }</p>
                <p><strong>Ministério:</strong> ${member.ministry || "Não informado"}</p>
                <p><strong>Batizado:</strong> ${member.baptized ? "Sim" : "Não"}</p>
                ${member.notes ? `<p><strong>Observações:</strong> ${member.notes}</p>` : ""}
              </div>
            </div>
          `,
            )
            .join("")}
        </div>

        ${
          inactiveMembers.length > 0
            ? `
        <div class="member-section">
          <h2>MEMBROS INATIVOS (${inactiveMembers.length})</h2>
          ${inactiveMembers
            .map(
              (member) => `
            <div class="member-item">
              <div class="member-name">${member.name} <span class="status-inactive">[INATIVO]</span></div>
              <div class="member-details">
                <p><strong>Email:</strong> ${member.email}</p>
                <p><strong>Telefone:</strong> ${member.phone}</p>
                <p><strong>Membro desde:</strong> ${
                  member.memberSince ? new Date(member.memberSince).toLocaleDateString("pt-BR") : "Não informado"
                }</p>
                ${member.notes ? `<p><strong>Observações:</strong> ${member.notes}</p>` : ""}
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
        `
            : ""
        }
      </body>
      </html>
    `

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `relatorio-membros-${new Date().toISOString().split("T")[0]}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Relatório gerado!",
      description:
        "Para converter para PDF: abra o arquivo HTML baixado e use Ctrl+P (ou Cmd+P no Mac), depois selecione 'Salvar como PDF'",
    })
  }

  const handleCreateMember = async (memberData: any) => {
    try {
      const apiData = convertLocalMemberToApi(memberData)
      const newMember = await createMemberAPI(apiData)

      // Recarregar a lista de membros
      await loadMembers()
      setIsModalOpen(false)
    } catch (error) {
      console.error("Erro ao criar membro:", error)
      throw error
    }
  }

  const handleEditMember = async (memberData: any) => {
    if (!editingMember) return

    try {
      const apiData = convertLocalMemberToApi(memberData)
      await updateMemberAPI(editingMember.id, apiData)

      // Recarregar a lista de membros
      await loadMembers()
      setIsModalOpen(false)
      setEditingMember(null)
    } catch (error) {
      console.error("Erro ao editar membro:", error)
      throw error
    }
  }

  const handleDeleteMember = async (memberId: number) => {
    if (!confirm("Tem certeza que deseja excluir este membro?")) return

    try {
      await deleteMemberAPI(memberId)

      // Recarregar a lista de membros
      await loadMembers()
    } catch (error) {
      console.error("Erro ao deletar membro:", error)
      alert("Erro ao deletar membro. Tente novamente.")
    }
  }

  const openEditModal = (member: ApiMember) => {
    const convertedMember = convertApiMemberToLocal(member)
    setEditingMember({ ...convertedMember, id: member.id })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingMember(null)
  }

  const activeMembers = filteredMembers.filter((member) => member.isActive)
  const inactiveMembers = filteredMembers.filter((member) => !member.isActive)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }

  const formatDocument = (documents: any[]) => {
    if (!documents || documents.length === 0) return "N/A"
    const cpf = documents.find((doc) => doc.type === 1) // CPF
    if (cpf) {
      const number = cpf.number
      return number.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    }
    return documents[0]?.number || "N/A"
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <div>Carregando...</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Membros</h1>
          <p className="text-gray-600">Gerencie os membros da sua igreja</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Membro
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Membros</p>
                <p className="text-xl font-semibold">{totalMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Membros Ativos</p>
                <p className="text-xl font-semibold">{activeMembers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <UserX className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Membros Inativos</p>
                <p className="text-xl font-semibold">{inactiveMembers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nome, email ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">{error}</p>
          <Button variant="outline" size="sm" onClick={loadMembers} className="mt-2">
            Tentar Novamente
          </Button>
        </div>
      )}

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.photo || undefined} />
                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                </div>
                <Badge variant={member.isActive ? "default" : "secondary"}>
                  {member.isActive ? "Ativo" : "Inativo"}
                </Badge>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>CPF:</span>
                  <span>{formatDocument(member.document)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Telefone:</span>
                  <span>{member.phone || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Batizado:</span>
                  <span>{member.isBaptized ? "Sim" : "Não"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dizimista:</span>
                  <span>{member.isTither ? "Sim" : "Não"}</span>
                </div>
              </div>

              {isAdmin && (
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => openEditModal(member)} className="flex-1">
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteMember(member.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Excluir
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <span className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Próxima
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? "Nenhum membro encontrado" : "Nenhum membro cadastrado"}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? "Tente ajustar os termos de busca" : "Comece adicionando o primeiro membro da sua igreja"}
          </p>
          {isAdmin && !searchTerm && (
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Membro
            </Button>
          )}
        </div>
      )}

      {/* Modal */}
      <MemberRegistrationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={editingMember ? handleEditMember : handleCreateMember}
        initialData={editingMember}
        isEditing={!!editingMember}
      />
    </div>
  )
}
