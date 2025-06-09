"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Key,
  Send,
  UserCheck,
  UserX,
  Download,
  FileText,
  Loader2,
  AlertCircle,
  Trash2,
} from "lucide-react"
import { getUser, type User } from "@/lib/fake-api"
import {
  getMembersFromAPI,
  createMemberAPI,
  updateMemberAPI,
  deleteMemberAPI,
  convertApiMemberToLocal,
  convertLocalMemberToApi,
  convertApiMemberToLocalForEdit, // ✅ Nova importação
} from "@/lib/api"
import { useToastContext } from "@/contexts/toast-context"
import { toast } from "@/hooks/use-toast"

export default function MembrosPage() {
  const router = useRouter()
  const { showToast } = useToastContext()
  const [user, setUser] = useState<User | null>(null)
  const [members, setMembers] = useState<any[]>([])
  const [filteredMembers, setFilteredMembers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 20

  // Form state for new/edit member
  const [memberForm, setMemberForm] = useState({
    name: "",
    email: "",
    phone: "",
    document: "",
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
  useEffect(() => {
    const handleApiError500 = (event: CustomEvent) => {
      toast({
        title: "Erro no servidor",
        description: event.detail.message,
        variant: "destructive",
        duration: 6000,
      })
    }

    window.addEventListener("api-error-500", handleApiError500 as EventListener)

    return () => {
      window.removeEventListener("api-error-500", handleApiError500 as EventListener)
    }
  }, [toast])

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
      setLoading(true)
      setError(null)

      const response = await getMembersFromAPI(currentPage, pageSize)
      const convertedMembers = response.items.map(convertApiMemberToLocal)

      setMembers(convertedMembers)
      setFilteredMembers(convertedMembers)
      setTotalPages(response.totalPages)
      setTotalCount(response.totalCount)
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
          <p><strong>Taxa de Atividade:</strong> ${totalCount > 0 ? ((activeMembers.length / totalCount) * 100).toFixed(1) : 0}%</p>
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
                <p><strong>Data de Nascimento:</strong> ${member.birthDate ? new Date(member.birthDate).toLocaleDateString("pt-BR") : "Não informado"}</p>
                <p><strong>Estado Civil:</strong> ${member.maritalStatus || "Não informado"}</p>
                <p><strong>Endereço:</strong> ${member.address || "Não informado"}, ${member.city || ""} - ${member.state || ""}, ${member.zipCode || ""}</p>
                <p><strong>Membro desde:</strong> ${member.memberSince ? new Date(member.memberSince).toLocaleDateString("pt-BR") : "Não informado"}</p>
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
                <p><strong>Membro desde:</strong> ${member.memberSince ? new Date(member.memberSince).toLocaleDateString("pt-BR") : "Não informado"}</p>
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
      variant: "success",
      duration: 8000,
    })
  }

  const handleCreateMember = async (e: React.FormEvent) => {
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

      console.log("Dados do formulário antes da conversão:", memberForm)

      const apiMemberData = convertLocalMemberToApi(memberForm)
      console.log("Dados convertidos para API:", apiMemberData)

      const newApiMember = await createMemberAPI(apiMemberData)
      console.log("Resposta da API:", newApiMember)

      if (!newApiMember) {
        throw new Error("API retornou dados vazios")
      }

      const newMember = convertApiMemberToLocal(newApiMember)
      console.log("Membro convertido:", newMember)

      setMembers([newMember, ...members])
      resetForm()
      setIsCreateDialogOpen(false)

      toast({
        title: "Membro cadastrado!",
        description: `${newMember.name} foi cadastrado com sucesso.`,
        variant: "success",
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

  const handleEditMember = async (e: React.FormEvent) => {
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

      console.log("Dados do formulário (edit):", memberForm)

      const apiMemberData = convertLocalMemberToApi(memberForm)
      console.log("Dados convertidos para API (edit):", apiMemberData)

      const updatedApiMember = await updateMemberAPI(Number.parseInt(selectedMember.id), apiMemberData)
      console.log("Resposta da API (edit):", updatedApiMember)

      if (!updatedApiMember) {
        throw new Error("API retornou dados vazios")
      }

      const updatedMember = convertApiMemberToLocal(updatedApiMember)
      console.log("Membro atualizado:", updatedMember)

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

  const handleDeleteMember = async (member: any) => {
    if (!confirm(`Tem certeza que deseja excluir o membro ${member.name}?`)) return

    try {
      setSubmitting(true)
      setError(null)

      await deleteMemberAPI(Number.parseInt(member.id))
      setMembers(members.filter((m) => m.id !== member.id))

      toast({
        title: "Membro excluído!",
        description: `${member.name} foi excluído com sucesso.`,
        variant: "success",
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

    // Usar a função específica para edição que trata os valores numéricos
    const convertedMember = convertApiMemberToLocalForEdit(member)

    setMemberForm({
      name: convertedMember.name,
      email: convertedMember.email,
      phone: convertedMember.phone,
      document: convertedMember.cpf,
      photo: convertedMember.photo || "",
      birthDate: convertedMember.birthDate,
      address: convertedMember.address,
      city: convertedMember.city,
      state: convertedMember.state,
      zipCode: convertedMember.zipCode,
      maritalStatus: convertedMember.maritalStatus,
      isBaptized: convertedMember.baptized,
      baptizedDate: convertedMember.baptizedDate || "",
      isTither: convertedMember.isTither || false,
      memberSince: convertedMember.memberSince,
      ministry: convertedMember.ministry,
      roleMember: 0,
      isActive: convertedMember.isActive,
      notes: convertedMember.notes || "",
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setMemberForm({
      name: "",
      email: "",
      phone: "",
      document: "",
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
      variant: "success",
    })
  }

  const handleGenerateNewPassword = (member: any) => {
    const newPassword = Math.random().toString(36).slice(-8)
    toast({
      title: "Nova senha gerada!",
      description: `Nova senha para ${member.name}: ${newPassword}`,
      variant: "success",
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (!user) {
    return <div>Carregando...</div>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Membros</h1>
              <p className="text-gray-600">Gerencie os membros da igreja</p>
            </div>
            <div className="flex gap-2">
              {user.accessLevel === "admin" && (
                <>
                  <Button onClick={generateMembersPDFReport} variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Relatório PDF
                  </Button>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Novo Membro
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Cadastrar Novo Membro</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateMember} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="member-name">Nome Completo *</Label>
                            <Input
                              id="member-name"
                              value={memberForm.name}
                              onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                              placeholder="Nome completo"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="member-document">Documento (CPF) *</Label>
                            <Input
                              id="member-document"
                              value={memberForm.document}
                              onChange={(e) => setMemberForm({ ...memberForm, document: e.target.value })}
                              placeholder="000.000.000-00"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="member-photo">Foto</Label>
                          <Input
                            id="member-photo"
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              if (e.target.files && e.target.files[0]) {
                                try {
                                  const base64 = await convertImageToBase64(e.target.files[0])
                                  setMemberForm({ ...memberForm, photo: base64 })
                                } catch (error) {
                                  console.error("Erro ao converter imagem:", error)
                                  setError("Erro ao processar a imagem. Tente novamente.")
                                }
                              }
                            }}
                          />
                          <p className="text-xs text-muted-foreground">
                            Opcional. Deixe em branco para não enviar foto.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="member-email">Email *</Label>
                            <Input
                              id="member-email"
                              type="email"
                              value={memberForm.email}
                              onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                              placeholder="email@exemplo.com"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="member-phone">Telefone *</Label>
                            <Input
                              id="member-phone"
                              value={memberForm.phone}
                              onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                              placeholder="(11) 99999-9999"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="member-birth">Data de Nascimento *</Label>
                            <Input
                              id="member-birth"
                              type="date"
                              value={memberForm.birthDate}
                              onChange={(e) => setMemberForm({ ...memberForm, birthDate: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="member-marital">Estado Civil</Label>
                            <Select
                              value={memberForm.maritalStatus}
                              onValueChange={(value) => setMemberForm({ ...memberForm, maritalStatus: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Solteiro">Solteiro(a)</SelectItem>
                                <SelectItem value="Casado">Casado(a)</SelectItem>
                                <SelectItem value="Divorciado">Divorciado(a)</SelectItem>
                                <SelectItem value="Viuvo">Viúvo(a)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="member-since">Membro desde</Label>
                            <Input
                              id="member-since"
                              type="date"
                              value={memberForm.memberSince}
                              onChange={(e) => setMemberForm({ ...memberForm, memberSince: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="member-ministry">Ministério</Label>
                            <Input
                              id="member-ministry"
                              value={memberForm.ministry}
                              onChange={(e) => setMemberForm({ ...memberForm, ministry: e.target.value })}
                              placeholder="Ministério que participa"
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="member-baptized"
                            checked={memberForm.isBaptized}
                            onCheckedChange={(checked) => setMemberForm({ ...memberForm, isBaptized: checked })}
                          />
                          <Label htmlFor="member-baptized">Batizado</Label>
                        </div>

                        {memberForm.isBaptized && (
                          <div className="space-y-2">
                            <Label htmlFor="member-baptized-date">Data de Batismo</Label>
                            <Input
                              id="member-baptized-date"
                              type="date"
                              value={memberForm.baptizedDate}
                              onChange={(e) => setMemberForm({ ...memberForm, baptizedDate: e.target.value })}
                            />
                          </div>
                        )}

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="member-tither"
                            checked={memberForm.isTither}
                            onCheckedChange={(checked) => setMemberForm({ ...memberForm, isTither: checked })}
                          />
                          <Label htmlFor="member-tither">Dizimista</Label>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="member-notes">Observações</Label>
                          <Textarea
                            id="member-notes"
                            value={memberForm.notes}
                            onChange={(e) => setMemberForm({ ...memberForm, notes: e.target.value })}
                            placeholder="Observações sobre o membro"
                            rows={3}
                          />
                        </div>

                        <Button type="submit" className="w-full" disabled={submitting}>
                          {submitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Cadastrando...
                            </>
                          ) : (
                            "Cadastrar Membro"
                          )}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Error Alert */}
        {error && (
          <div className="px-6 py-2">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Edit Member Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Membro</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditMember} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-member-name">Nome Completo *</Label>
                  <Input
                    id="edit-member-name"
                    value={memberForm.name}
                    onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                    placeholder="Nome completo"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-member-document">Documento (CPF) *</Label>
                  <Input
                    id="edit-member-document"
                    value={memberForm.document}
                    onChange={(e) => setMemberForm({ ...memberForm, document: e.target.value })}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-member-photo">Foto</Label>
                <Input
                  id="edit-member-photo"
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      try {
                        const base64 = await convertImageToBase64(e.target.files[0])
                        setMemberForm({ ...memberForm, photo: base64 })
                      } catch (error) {
                        console.error("Erro ao converter imagem:", error)
                        setError("Erro ao processar a imagem. Tente novamente.")
                      }
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">Opcional. Deixe em branco para manter a foto atual.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-member-email">Email *</Label>
                  <Input
                    id="edit-member-email"
                    type="email"
                    value={memberForm.email}
                    onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-member-phone">Telefone *</Label>
                  <Input
                    id="edit-member-phone"
                    value={memberForm.phone}
                    onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-member-birth">Data de Nascimento *</Label>
                  <Input
                    id="edit-member-birth"
                    type="date"
                    value={memberForm.birthDate}
                    onChange={(e) => setMemberForm({ ...memberForm, birthDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-member-marital">Estado Civil</Label>
                  <Select
                    value={memberForm.maritalStatus}
                    onValueChange={(value) => setMemberForm({ ...memberForm, maritalStatus: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Solteiro">Solteiro(a)</SelectItem>
                      <SelectItem value="Casado">Casado(a)</SelectItem>
                      <SelectItem value="Divorciado">Divorciado(a)</SelectItem>
                      <SelectItem value="Viuvo">Viúvo(a)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-member-since">Membro desde</Label>
                  <Input
                    id="edit-member-since"
                    type="date"
                    value={memberForm.memberSince}
                    onChange={(e) => setMemberForm({ ...memberForm, memberSince: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-member-ministry">Ministério</Label>
                  <Input
                    id="edit-member-ministry"
                    value={memberForm.ministry}
                    onChange={(e) => setMemberForm({ ...memberForm, ministry: e.target.value })}
                    placeholder="Ministério que participa"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-member-baptized"
                  checked={memberForm.isBaptized}
                  onCheckedChange={(checked) => setMemberForm({ ...memberForm, isBaptized: checked })}
                />
                <Label htmlFor="edit-member-baptized">Batizado</Label>
              </div>

              {memberForm.isBaptized && (
                <div className="space-y-2">
                  <Label htmlFor="edit-member-baptized-date">Data de Batismo</Label>
                  <Input
                    id="edit-member-baptized-date"
                    type="date"
                    value={memberForm.baptizedDate}
                    onChange={(e) => setMemberForm({ ...memberForm, baptizedDate: e.target.value })}
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-member-tither"
                  checked={memberForm.isTither}
                  onCheckedChange={(checked) => setMemberForm({ ...memberForm, isTither: checked })}
                />
                <Label htmlFor="edit-member-tither">Dizimista</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-member-active"
                  checked={memberForm.isActive}
                  onCheckedChange={(checked) => setMemberForm({ ...memberForm, isActive: checked })}
                />
                <Label htmlFor="edit-member-active">Membro Ativo</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-member-notes">Observações</Label>
                <Textarea
                  id="edit-member-notes"
                  value={memberForm.notes}
                  onChange={(e) => setMemberForm({ ...memberForm, notes: e.target.value })}
                  placeholder="Observações sobre o membro"
                  rows={3}
                />
              </div>

              {user.accessLevel === "admin" && selectedMember && (
                <div className="border-t pt-4 space-y-3">
                  <h4 className="font-medium text-gray-900">Gerenciamento de Senha</h4>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSendPasswordReset(selectedMember)}
                      className="flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Enviar Recuperação
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleGenerateNewPassword(selectedMember)}
                      className="flex items-center gap-2"
                    >
                      <Key className="h-4 w-4" />
                      Gerar Nova Senha
                    </Button>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Members Summary */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Resumo de Membros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
                    <p className="text-sm text-gray-600">Total de Membros</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{members.filter((m) => m.isActive).length}</div>
                    <p className="text-sm text-gray-600">Membros Ativos</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{members.filter((m) => !m.isActive).length}</div>
                    <p className="text-sm text-gray-600">Membros Inativos</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{filteredMembers.length}</div>
                    <p className="text-sm text-gray-600">Resultados da Busca</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search and Filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="inactive">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Carregando membros...</span>
              </div>
            )}

            {/* Members Grid */}
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMembers.map((member) => (
                  <Card key={member.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center text-center">
                        <Avatar className="h-20 w-20 mb-3">
                          <AvatarImage src={member.photo || "/placeholder.svg"} alt={member.name} />
                          <AvatarFallback className="text-lg">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>

                        <h3 className="font-semibold text-lg mb-1">{member.name}</h3>

                        {user.accessLevel === "admin" ? (
                          <>
                            <div className="mb-3">{getStatusBadge(member.isActive)}</div>

                            <div className="w-full space-y-2 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <span className="truncate">{member.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span>{member.phone}</span>
                              </div>
                              {member.city && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  <span className="truncate">
                                    {member.city}, {member.state}
                                  </span>
                                </div>
                              )}
                              {member.memberSince && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>Membro desde {new Date(member.memberSince).getFullYear()}</span>
                                </div>
                              )}
                              {member.ministry && (
                                <div className="flex items-center gap-2">
                                  <Heart className="h-4 w-4" />
                                  <span className="truncate">{member.ministry}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2 mt-4 w-full">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(member)}
                                className="flex-1 flex items-center gap-2"
                              >
                                <Edit className="h-4 w-4" />
                                Editar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteMember(member)}
                                className="flex items-center gap-2 text-red-600 hover:text-red-700"
                                disabled={submitting}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="mb-3">{getStatusBadge(member.isActive)}</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>

                <span className="text-sm text-gray-600">
                  Página {currentPage} de {totalPages} ({totalCount} membros)
                </span>

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </Button>
              </div>
            )}

            {!loading && filteredMembers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum membro encontrado</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== "all"
                    ? "Tente ajustar os filtros de busca"
                    : "Comece cadastrando o primeiro membro da igreja"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
