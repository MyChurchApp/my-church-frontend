"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Plus, Search, Filter, UserCheck, UserX, ChevronLeft, ChevronRight } from "lucide-react"
import { getUser, type User } from "@/lib/api"
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
import { getUserRole } from "@/lib/auth-utils"

export default function MembrosPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [members, setMembers] = useState<ApiMember[]>([])
  const [filteredMembers, setFilteredMembers] = useState<ApiMember[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<ApiMember | null>(null)
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

  // Form state for new/edit member
  const [memberForm, setMemberForm] = useState({
    name: "",
    email: "",
    phone: "",
    document: "",
    rg: "",
    tituloEleitor: "",
    cnh: "",
    certidaoNascimento: "",
    outrosDocumentos: "",
    photo: "",
    birthDate: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    maritalStatus: "",
    isBaptized: false,
    baptizedDate: "",
    isTither: false,
    memberSince: "",
    ministry: "",
    roleMember: 0,
    isActive: true,
    notes: "",
  })

  // Listener para erros 500
  const userRole = getUserRole()
  const isAdmin = userRole === "Admin"

  // Função para converter imagem para base64
  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const base64String = reader.result as string
        const base64 = base64String.split(",")[1]
        resolve(base64)
      }
      reader.onerror = (error) => reject(error)
    })
  }

  useEffect(() => {
    const userData = getUser()
    if (!userData) {
      router.push("/login")
      return
    }

    setUser(userData)
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

  const handleCreateMemberOld = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validação básica
    if (!memberForm.name.trim()) {
      setError("Nome é obrigatório")
      return
    }

    if (!memberForm.email.trim()) {
      setError("Email é obrigatório")
      return
    }

    if (!memberForm.phone.trim()) {
      setError("Telefone é obrigatório")
      return
    }

    if (!memberForm.document.trim()) {
      setError("Documento (CPF) é obrigatório")
      return
    }

    if (!memberForm.birthDate.trim()) {
      setError("Data de nascimento é obrigatória")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(memberForm.email.trim())) {
      setError("Email deve ter um formato válido")
      return
    }

    const cpfRegex = /^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/
    if (!cpfRegex.test(memberForm.document.trim())) {
      setError("CPF deve ter 11 dígitos ou formato 000.000.000-00")
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const apiMemberData = convertLocalMemberToApi(memberForm)

      const newApiMember = await createMemberAPI(apiMemberData)

      if (!newApiMember) {
        throw new Error("API retornou dados vazios")
      }

      const newMember = convertApiMemberToLocal(newApiMember)

      setMembers([newMember, ...members])
      resetForm()
      setIsCreateDialogOpen(false)

      toast({
        title: "Membro cadastrado!",
        description: `${newMember.name} foi cadastrado com sucesso.`,
      })

      // Recarregar a lista para garantir sincronização
      await loadMembers()
    } catch (error: any) {
      console.error("Erro detalhado ao criar membro:", error)

      if (!error.message.includes("Erro interno do servidor")) {
        let errorMessage = "Erro ao criar membro"
        if (error.message) {
          if (error.message.includes("400")) {
            errorMessage = "Dados inválidos. Verifique os campos obrigatórios."
          } else if (error.message.includes("401")) {
            errorMessage = "Não autorizado. Faça login novamente."
          } else if (error.message.includes("Resposta da API inválida")) {
            errorMessage = "Erro na resposta do servidor. Tente novamente."
          } else {
            errorMessage = error.message
          }
        }
        setError(errorMessage)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditMemberOld = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedMember) {
      setError("Nenhum membro selecionado")
      return
    }

    // Validação básica (mesma do create)
    if (!memberForm.name.trim()) {
      setError("Nome é obrigatório")
      return
    }

    if (!memberForm.email.trim()) {
      setError("Email é obrigatório")
      return
    }

    if (!memberForm.phone.trim()) {
      setError("Telefone é obrigatório")
      return
    }

    if (!memberForm.document.trim()) {
      setError("Documento (CPF) é obrigatório")
      return
    }

    if (!memberForm.birthDate.trim()) {
      setError("Data de nascimento é obrigatória")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(memberForm.email.trim())) {
      setError("Email deve ter um formato válido")
      return
    }

    const cpfRegex = /^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/
    if (!cpfRegex.test(memberForm.document.trim())) {
      setError("CPF deve ter 11 dígitos ou formato 000.000.000-00")
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const apiMemberData = convertLocalMemberToApi(memberForm)

      const updatedApiMember = await updateMemberAPI(Number.parseInt(selectedMember.id), apiMemberData)

      if (!updatedApiMember) {
        throw new Error("API retornou dados vazios")
      }

      const updatedMember = convertApiMemberToLocal(updatedApiMember)

      setMembers(members.map((member) => (member.id === selectedMember.id ? updatedMember : member)))
      resetForm()
      setSelectedMember(null)
      setIsEditDialogOpen(false)

      toast({
        title: "Membro atualizado!",
        description: `${updatedMember.name} foi atualizado com sucesso.`,
      })

      // Recarregar a lista para garantir sincronização
      await loadMembers()
    } catch (error: any) {
      console.error("Erro ao editar membro:", error)

      if (!error.message.includes("Erro interno do servidor")) {
        let errorMessage = "Erro ao editar membro"
        if (error.message) {
          if (error.message.includes("400")) {
            errorMessage = "Dados inválidos. Verifique os campos obrigatórios."
          } else if (error.message.includes("401")) {
            errorMessage = "Não autorizado. Faça login novamente."
          } else if (error.message.includes("404")) {
            errorMessage = "Membro não encontrado."
          } else if (error.message.includes("Resposta da API inválida")) {
            errorMessage = "Erro na resposta do servidor. Tente novamente."
          } else {
            errorMessage = error.message
          }
        }
        setError(errorMessage)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteMemberOld = async (member: any) => {
    if (!confirm(`Tem certeza que deseja excluir o membro ${member.name}?`)) return

    try {
      setSubmitting(true)
      setError(null)

      await deleteMemberAPI(Number.parseInt(member.id))
      setMembers(members.filter((m) => m.id !== member.id))

      toast({
        title: "Membro excluído!",
        description: `${member.name} foi excluído com sucesso.`,
      })

      await loadMembers()
    } catch (error: any) {
      console.error("Erro ao deletar membro:", error)

      if (!error.message.includes("Erro interno do servidor")) {
        setError(error.message || "Erro ao deletar membro")
      }
    } finally {
      setSubmitting(false)
    }
  }

  const openEditDialog = (member: any) => {
    setSelectedMember(member)
    setMemberForm({
      name: member.name,
      email: member.email,
      phone: member.phone,
      document: member.cpf,
      rg: member.rg || "",
      tituloEleitor: member.tituloEleitor || "",
      cnh: member.cnh || "",
      certidaoNascimento: member.certidaoNascimento || "",
      outrosDocumentos: member.outrosDocumentos || "",
      photo: member.photo || "",
      birthDate: member.birthDate,
      address: member.address,
      city: member.city,
      state: member.state,
      zipCode: member.zipCode,
      maritalStatus: member.maritalStatus,
      isBaptized: member.baptized,
      baptizedDate: member.baptizedDate || "",
      isTither: member.isTither || false,
      memberSince: member.memberSince,
      ministry: member.ministry,
      roleMember: 0,
      isActive: member.isActive,
      notes: member.notes || "",
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setMemberForm({
      name: "",
      email: "",
      phone: "",
      document: "",
      rg: "",
      tituloEleitor: "",
      cnh: "",
      certidaoNascimento: "",
      outrosDocumentos: "",
      photo: "",
      birthDate: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      maritalStatus: "",
      isBaptized: false,
      baptizedDate: "",
      isTither: false,
      memberSince: "",
      ministry: "",
      roleMember: 0,
      isActive: true,
      notes: "",
    })
  }

  const handleSendPasswordReset = (member: any) => {
    toast({
      title: "Email enviado!",
      description: `Email de recuperação de senha enviado para ${member.email}`,
    })
  }

  const handleGenerateNewPassword = (member: any) => {
    const newPassword = Math.random().toString(36).slice(-8)
    toast({
      title: "Nova senha gerada!",
      description: `Nova senha para ${member.name}: ${newPassword}`,
      duration: 10000,
    })
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">
        <UserCheck className="h-3 w-3 mr-1" />
        Ativo
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">
        <UserX className="h-3 w-3 mr-1" />
        Inativo
      </Badge>
    )
  }

  const handlePageChangeOld = (page: number) => {
    setCurrentPage(page)
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
