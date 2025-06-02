"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Download } from "lucide-react"
import { getUser, getMembers, type User, type Member } from "@/lib/fake-api"
import { MembersSummary } from "@/components/members/members-summary"
import { MembersFilters } from "@/components/members/members-filters"
import { MembersGrid } from "@/components/members/members-grid"
import { MemberForm } from "@/components/members/member-form"

export default function MembrosPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Form state for new/edit member
  const [memberForm, setMemberForm] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    birthDate: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    maritalStatus: "",
    baptized: false,
    memberSince: "",
    ministry: "",
    isActive: true,
    notes: "",
  })

  useEffect(() => {
    const loadData = () => {
      setIsLoading(true)

      const currentUser = getUser()
      if (!currentUser) {
        router.push("/login")
        return
      }

      setUser(currentUser)
      const membersData = getMembers()
      setMembers(membersData)
      setFilteredMembers(membersData)
      setIsLoading(false)
    }

    loadData()
  }, [router])

  useEffect(() => {
    let filtered = members

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (member) =>
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((member) => (statusFilter === "active" ? member.isActive : !member.isActive))
    }

    setFilteredMembers(filtered)
  }, [members, searchTerm, statusFilter])

  const generateMembersPDFReport = () => {
    const activeMembers = members.filter((member) => member.isActive)
    const inactiveMembers = members.filter((member) => !member.isActive)

    // Criar conteúdo HTML para o PDF
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
          <p><strong>Total de Membros:</strong> ${members.length}</p>
          <p><strong>Membros Ativos:</strong> ${activeMembers.length}</p>
          <p><strong>Membros Inativos:</strong> ${inactiveMembers.length}</p>
          <p><strong>Taxa de Atividade:</strong> ${((activeMembers.length / members.length) * 100).toFixed(1)}%</p>
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
                <p><strong>Data de Nascimento:</strong> ${new Date(member.birthDate).toLocaleDateString("pt-BR")}</p>
                <p><strong>Estado Civil:</strong> ${member.maritalStatus}</p>
                <p><strong>Endereço:</strong> ${member.address}, ${member.city} - ${member.state}, ${member.zipCode}</p>
                <p><strong>Membro desde:</strong> ${new Date(member.memberSince).toLocaleDateString("pt-BR")}</p>
                <p><strong>Ministério:</strong> ${member.ministry}</p>
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
                <p><strong>Membro desde:</strong> ${new Date(member.memberSince).toLocaleDateString("pt-BR")}</p>
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

    // Criar e baixar o arquivo HTML que pode ser convertido para PDF
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `relatorio-membros-${new Date().toISOString().split("T")[0]}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    alert(
      "Relatório gerado! Para converter para PDF:\n1. Abra o arquivo HTML baixado\n2. Use Ctrl+P (ou Cmd+P no Mac)\n3. Selecione 'Salvar como PDF' como destino",
    )
  }

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!memberForm.name || !memberForm.email || !memberForm.phone) return

    const newMember: Member = {
      id: Date.now().toString(),
      ...memberForm,
    }

    setMembers([...members, newMember])
    resetForm()
    setIsCreateDialogOpen(false)
  }

  const handleEditMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMember || !memberForm.name || !memberForm.email || !memberForm.phone) return

    const updatedMember: Member = {
      ...selectedMember,
      ...memberForm,
    }

    setMembers(members.map((member) => (member.id === selectedMember.id ? updatedMember : member)))
    resetForm()
    setSelectedMember(null)
    setIsEditDialogOpen(false)
  }

  const openEditDialog = (member: Member) => {
    setSelectedMember(member)
    setMemberForm({
      name: member.name,
      email: member.email,
      phone: member.phone,
      cpf: member.cpf,
      birthDate: member.birthDate,
      address: member.address,
      city: member.city,
      state: member.state,
      zipCode: member.zipCode,
      maritalStatus: member.maritalStatus,
      baptized: member.baptized,
      memberSince: member.memberSince,
      ministry: member.ministry,
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
      cpf: "",
      birthDate: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      maritalStatus: "",
      baptized: false,
      memberSince: "",
      ministry: "",
      isActive: true,
      notes: "",
    })
  }

  const handleSendPasswordReset = (member: Member) => {
    alert(`Email de recuperação de senha enviado para ${member.email}`)
  }

  const handleGenerateNewPassword = (member: Member) => {
    const newPassword = Math.random().toString(36).slice(-8)
    alert(`Nova senha gerada para ${member.name}: ${newPassword}`)
  }

  const handleDeleteMember = (member: Member) => {
    if (!confirm(`Tem certeza que deseja excluir o membro ${member.name}?`)) {
      return
    }
    setMembers(members.filter((m) => m.id !== member.id))
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando membros...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600">Erro ao carregar dados do usuário</p>
            <Button onClick={() => router.push("/login")} className="mt-4">
              Voltar para o login
            </Button>
          </div>
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
                      <MemberForm memberForm={memberForm} setMemberForm={setMemberForm} onSubmit={handleCreateMember} />
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Edit Member Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Membro</DialogTitle>
            </DialogHeader>
            <MemberForm
              memberForm={memberForm}
              setMemberForm={setMemberForm}
              onSubmit={handleEditMember}
              isEdit={true}
              selectedMember={selectedMember}
              user={user}
              onSendPasswordReset={handleSendPasswordReset}
              onGenerateNewPassword={handleGenerateNewPassword}
            />
          </DialogContent>
        </Dialog>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <MembersSummary members={members} filteredMembers={filteredMembers} />
            <MembersFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />
            <MembersGrid
              filteredMembers={filteredMembers}
              user={user}
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              onEditMember={openEditDialog}
              onDeleteMember={handleDeleteMember}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
