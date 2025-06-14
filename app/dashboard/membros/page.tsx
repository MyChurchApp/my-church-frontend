"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Search, Filter, UserCheck, UserX, ChevronLeft, ChevronRight, Loader2, Edit, Trash2 } from "lucide-react"
import { getMembersFromAPI, type ApiMember } from "@/lib/api"
import { getUserRole, isAuthenticated } from "@/lib/auth-utils"
import ValidatedMemberModal from "@/components/validated-member-modal"

export default function MembrosPage() {
  const router = useRouter()
  const [members, setMembers] = useState<ApiMember[]>([])
  const [filteredMembers, setFilteredMembers] = useState<ApiMember[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingMember, setEditingMember] = useState<ApiMember | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

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
      setError("Erro ao carregar membros. Verifique sua conexão e tente novamente.")
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

  const activeMembers = filteredMembers.filter((member) => member.isActive)
  const inactiveMembers = filteredMembers.filter((member) => !member.isActive)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleEditMember = (member: ApiMember) => {
    setEditingMember(member)
    setShowEditModal(true)
  }

  const handleMemberUpdated = () => {
    setShowEditModal(false)
    setEditingMember(null)
    loadMembers() // Recarregar lista após edição
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
        {isAdmin && <ValidatedMemberModal onMemberCreated={loadMembers} />}
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
      {filteredMembers.length === 0 && !error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "Nenhum membro encontrado" : "Nenhum membro cadastrado"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? "Tente ajustar os termos de busca" : "Comece adicionando o primeiro membro da sua igreja"}
            </p>
            {isAdmin && !searchTerm && <ValidatedMemberModal onMemberCreated={loadMembers} />}
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
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditMember(member)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
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

      {/* Modal de Edição */}
      {showEditModal && editingMember && (
        <EditMemberModal
          member={editingMember}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onMemberUpdated={handleMemberUpdated}
        />
      )}
    </div>
  )
}

// Componente Modal de Edição
function EditMemberModal({
  member,
  isOpen,
  onClose,
  onMemberUpdated,
}: {
  member: ApiMember
  isOpen: boolean
  onClose: () => void
  onMemberUpdated: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: member.name || "",
    email: member.email || "",
    phone: member.phone || "",
    birthDate: member.birthDate ? member.birthDate.split("T")[0] : "",
    maritalStatus: member.maritalStatus || "",
    ministry: member.ministry || "",
    isBaptized: member.isBaptized || false,
    baptizedDate: member.baptizedDate ? member.baptizedDate.split("T")[0] : "",
    isTither: member.isTither || false,
    isActive: member.isActive || true,
    notes: member.notes || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Aqui você implementaria a chamada para a API de atualização
      // const updatedMember = await updateMemberAPI(member.id, formData)

      // Por enquanto, simular sucesso
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onMemberUpdated()
    } catch (error: any) {
      setError(error.message || "Erro ao atualizar membro")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Editar Membro</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data de Nascimento</label>
              <Input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, birthDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Estado Civil</label>
              <Input
                value={formData.maritalStatus}
                onChange={(e) => setFormData((prev) => ({ ...prev, maritalStatus: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ministério</label>
              <Input
                value={formData.ministry}
                onChange={(e) => setFormData((prev) => ({ ...prev, ministry: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isBaptized}
                onChange={(e) => setFormData((prev) => ({ ...prev, isBaptized: e.target.checked }))}
              />
              <span className="text-sm">Batizado</span>
            </label>

            {formData.isBaptized && (
              <div>
                <label className="block text-sm font-medium mb-1">Data de Batismo</label>
                <Input
                  type="date"
                  value={formData.baptizedDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, baptizedDate: e.target.value }))}
                />
              </div>
            )}

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isTither}
                onChange={(e) => setFormData((prev) => ({ ...prev, isTither: e.target.checked }))}
              />
              <span className="text-sm">Dizimista</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
              />
              <span className="text-sm">Membro Ativo</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Observações</label>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
