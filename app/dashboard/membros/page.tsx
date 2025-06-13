"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Plus, Search, Filter, UserCheck, UserX, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
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

export default function MembrosPage() {
  const router = useRouter()
  const [members, setMembers] = useState<ApiMember[]>([])
  const [filteredMembers, setFilteredMembers] = useState<ApiMember[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<any>(null)

  // Paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 20

  const userRole = getUserRole()
  const isAdmin = userRole === "Admin"

  useEffect(() => {
    // Verificar autenticação
    if (!isAuthenticated()) {
      router.push("/login")
      return
    }

    loadMembers()
  }, [router, currentPage])

  const loadMembers = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await getMembersFromAPI(currentPage, pageSize)

      setMembers(response.items)
      setFilteredMembers(response.items)
      setTotalPages(response.totalPages)
      setTotalCount(response.totalCount)
    } catch (error: any) {
      console.error("Erro ao carregar membros:", error)
      setError("Erro ao carregar membros. Tente novamente.")
      setMembers([])
      setFilteredMembers([])
    } finally {
      setLoading(false)
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

  const handleCreateMember = async (memberData: any) => {
    try {
      setSubmitting(true)
      const apiData = convertLocalMemberToApi(memberData)
      await createMemberAPI(apiData)

      toast({
        title: "Sucesso",
        description: "Membro criado com sucesso!",
      })

      await loadMembers()
      setIsModalOpen(false)
    } catch (error) {
      console.error("Erro ao criar membro:", error)
      toast({
        title: "Erro",
        description: "Erro ao criar membro. Tente novamente.",
        variant: "destructive",
      })
      throw error
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditMember = async (memberData: any) => {
    if (!editingMember) return

    try {
      setSubmitting(true)
      const apiData = convertLocalMemberToApi(memberData)
      await updateMemberAPI(editingMember.id, apiData)

      toast({
        title: "Sucesso",
        description: "Membro atualizado com sucesso!",
      })

      await loadMembers()
      setIsModalOpen(false)
      setEditingMember(null)
    } catch (error) {
      console.error("Erro ao editar membro:", error)
      toast({
        title: "Erro",
        description: "Erro ao editar membro. Tente novamente.",
        variant: "destructive",
      })
      throw error
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteMember = async (memberId: number) => {
    if (!confirm("Tem certeza que deseja excluir este membro?")) return

    try {
      await deleteMemberAPI(memberId)

      toast({
        title: "Sucesso",
        description: "Membro excluído com sucesso!",
      })

      await loadMembers()
    } catch (error) {
      console.error("Erro ao deletar membro:", error)
      toast({
        title: "Erro",
        description: "Erro ao deletar membro. Tente novamente.",
        variant: "destructive",
      })
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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-gray-500">Carregando membros...</p>
        </div>
      </div>
    )
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
                <p className="text-xl font-semibold">{totalCount}</p>
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
            placeholder="Buscar por nome ou email..."
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
      {filteredMembers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error
                ? "Erro ao carregar membros"
                : searchTerm
                  ? "Nenhum membro encontrado"
                  : "Nenhum membro cadastrado"}
            </h3>
            <p className="text-gray-600 mb-4">
              {error
                ? "Verifique sua conexão e tente novamente"
                : searchTerm
                  ? "Tente ajustar os termos de busca"
                  : "Comece adicionando o primeiro membro da sua igreja"}
            </p>
            {isAdmin && !searchTerm && !error && (
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Membro
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
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
      )}

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
