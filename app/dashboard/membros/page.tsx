"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
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
} from "lucide-react"
import { getUser, getMembers, type User, type Member } from "@/lib/fake-api"

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
    const userData = getUser()
    if (!userData) {
      router.push("/login")
      return
    }

    setUser(userData)
    const membersData = getMembers()
    setMembers(membersData)
    setFilteredMembers(membersData)
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

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!memberForm.name || !memberForm.email || !memberForm.phone) return

    const newMember: Member = {
      id: Date.now().toString(),
      ...memberForm,
      photo: "/placeholder.svg?height=100&width=100&query=church+member",
    }

    setMembers([...members, newMember])
    resetForm()
    setIsCreateDialogOpen(false)
  }

  const handleEditMember = async (e: React.FormEvent) => {
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
    // Simular envio de email de recuperação
    alert(`Email de recuperação de senha enviado para ${member.email}`)
  }

  const handleGenerateNewPassword = (member: Member) => {
    // Simular geração de nova senha
    const newPassword = Math.random().toString(36).slice(-8)
    alert(`Nova senha gerada para ${member.name}: ${newPassword}`)
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
            {user.accessLevel === "admin" && (
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
                        <Label htmlFor="member-cpf">CPF</Label>
                        <Input
                          id="member-cpf"
                          value={memberForm.cpf}
                          onChange={(e) => setMemberForm({ ...memberForm, cpf: e.target.value })}
                          placeholder="000.000.000-00"
                        />
                      </div>
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
                        <Label htmlFor="member-birth">Data de Nascimento</Label>
                        <Input
                          id="member-birth"
                          type="date"
                          value={memberForm.birthDate}
                          onChange={(e) => setMemberForm({ ...memberForm, birthDate: e.target.value })}
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
                            <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                            <SelectItem value="casado">Casado(a)</SelectItem>
                            <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                            <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="member-address">Endereço</Label>
                      <Input
                        id="member-address"
                        value={memberForm.address}
                        onChange={(e) => setMemberForm({ ...memberForm, address: e.target.value })}
                        placeholder="Rua, número, complemento"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="member-city">Cidade</Label>
                        <Input
                          id="member-city"
                          value={memberForm.city}
                          onChange={(e) => setMemberForm({ ...memberForm, city: e.target.value })}
                          placeholder="Cidade"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="member-state">Estado</Label>
                        <Input
                          id="member-state"
                          value={memberForm.state}
                          onChange={(e) => setMemberForm({ ...memberForm, state: e.target.value })}
                          placeholder="UF"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="member-zip">CEP</Label>
                        <Input
                          id="member-zip"
                          value={memberForm.zipCode}
                          onChange={(e) => setMemberForm({ ...memberForm, zipCode: e.target.value })}
                          placeholder="00000-000"
                        />
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
                        checked={memberForm.baptized}
                        onCheckedChange={(checked) => setMemberForm({ ...memberForm, baptized: checked })}
                      />
                      <Label htmlFor="member-baptized">Batizado</Label>
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

                    <Button type="submit" className="w-full">
                      Cadastrar Membro
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </header>

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
                  <Label htmlFor="edit-member-cpf">CPF</Label>
                  <Input
                    id="edit-member-cpf"
                    value={memberForm.cpf}
                    onChange={(e) => setMemberForm({ ...memberForm, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                  />
                </div>
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
                  <Label htmlFor="edit-member-birth">Data de Nascimento</Label>
                  <Input
                    id="edit-member-birth"
                    type="date"
                    value={memberForm.birthDate}
                    onChange={(e) => setMemberForm({ ...memberForm, birthDate: e.target.value })}
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
                      <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                      <SelectItem value="casado">Casado(a)</SelectItem>
                      <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                      <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-member-address">Endereço</Label>
                <Input
                  id="edit-member-address"
                  value={memberForm.address}
                  onChange={(e) => setMemberForm({ ...memberForm, address: e.target.value })}
                  placeholder="Rua, número, complemento"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-member-city">Cidade</Label>
                  <Input
                    id="edit-member-city"
                    value={memberForm.city}
                    onChange={(e) => setMemberForm({ ...memberForm, city: e.target.value })}
                    placeholder="Cidade"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-member-state">Estado</Label>
                  <Input
                    id="edit-member-state"
                    value={memberForm.state}
                    onChange={(e) => setMemberForm({ ...memberForm, state: e.target.value })}
                    placeholder="UF"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-member-zip">CEP</Label>
                  <Input
                    id="edit-member-zip"
                    value={memberForm.zipCode}
                    onChange={(e) => setMemberForm({ ...memberForm, zipCode: e.target.value })}
                    placeholder="00000-000"
                  />
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
                  checked={memberForm.baptized}
                  onCheckedChange={(checked) => setMemberForm({ ...memberForm, baptized: checked })}
                />
                <Label htmlFor="edit-member-baptized">Batizado</Label>
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

              <Button type="submit" className="w-full">
                Salvar Alterações
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
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

            {/* Members Grid */}
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
                            {member.address && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span className="truncate">
                                  {member.city}, {member.state}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>Membro desde {new Date(member.memberSince).getFullYear()}</span>
                            </div>
                            {member.ministry && (
                              <div className="flex items-center gap-2">
                                <Heart className="h-4 w-4" />
                                <span className="truncate">{member.ministry}</span>
                              </div>
                            )}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(member)}
                            className="mt-4 w-full flex items-center gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Editar
                          </Button>
                        </>
                      ) : (
                        <div className="mb-3">{getStatusBadge(member.isActive)}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredMembers.length === 0 && (
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
