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
import { MembersEditService } from "@/services/members-edit.service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  const [formData, setFormData] = useState(() => {
    const converted = MembersEditService.convertApiDataToForm(member)
    // Garantir valores padrão para evitar strings vazias
    return {
      ...converted,
      maritalStatus: converted.maritalStatus || "0",
      ministry: converted.ministry || "0",
    }
  })

  const maritalStatusOptions = MembersEditService.getMaritalStatusOptions()
  const ministryOptions = MembersEditService.getMinistryOptions()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const apiData = MembersEditService.convertFormDataToApi(formData, member.document)
      await MembersEditService.updateMember(member.id, apiData)

      onMemberUpdated()
    } catch (error: any) {
      console.error("Erro ao atualizar membro:", error)
      setError(error.message || "Erro ao atualizar membro. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Pessoais */}
          <div>
            <h3 className="text-lg font-medium mb-3">Informações Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome *</label>
                <Input value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Telefone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data de Nascimento</label>
                <Input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange("birthDate", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Documentos */}
          <div>
            <h3 className="text-lg font-medium mb-3">Documentos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">CPF</label>
                <Input
                  value={formData.cpf}
                  onChange={(e) => handleInputChange("cpf", e.target.value)}
                  placeholder="000.000.000-00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">RG</label>
                <Input
                  value={formData.rg}
                  onChange={(e) => handleInputChange("rg", e.target.value)}
                  placeholder="00.000.000-0"
                />
              </div>
            </div>
          </div>

          {/* Informações da Igreja */}
          <div>
            <h3 className="text-lg font-medium mb-3">Informações da Igreja</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Estado Civil</label>
                <Select
                  value={formData.maritalStatus || "0"}
                  onValueChange={(value) => handleInputChange("maritalStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {maritalStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ministério</label>
                <Select
                  value={formData.ministry || "0"}
                  onValueChange={(value) => handleInputChange("ministry", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ministryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Membro desde</label>
                <Input
                  type="date"
                  value={formData.memberSince}
                  onChange={(e) => handleInputChange("memberSince", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Status e Configurações */}
          <div>
            <h3 className="text-lg font-medium mb-3">Status</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isBaptized}
                    onChange={(e) => handleInputChange("isBaptized", e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Batizado</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isTither}
                    onChange={(e) => handleInputChange("isTither", e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Dizimista</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange("isActive", e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Membro Ativo</span>
                </label>
              </div>

              {formData.isBaptized && (
                <div className="max-w-xs">
                  <label className="block text-sm font-medium mb-1">Data de Batismo</label>
                  <Input
                    type="date"
                    value={formData.baptizedDate}
                    onChange={(e) => handleInputChange("baptizedDate", e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium mb-1">Observações</label>
            <textarea
              className="w-full p-3 border rounded-md resize-none"
              rows={4}
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Adicione observações sobre o membro..."
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4 border-t">
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
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
