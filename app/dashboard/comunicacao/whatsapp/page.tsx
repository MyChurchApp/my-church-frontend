"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MessageSquare, Send, Users, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { getUser, getMembers, type User, type Member } from "@/lib/fake-api"

interface WhatsAppMessage {
  id: string
  content: string
  recipients: string[]
  sentAt: Date
  status: "sending" | "sent" | "failed"
  recipientCount: number
}

export default function WhatsAppPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [message, setMessage] = useState("")
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sentMessages, setSentMessages] = useState<WhatsAppMessage[]>([])
  const [selectedMessage, setSelectedMessage] = useState<WhatsAppMessage | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Roles disponíveis
  const availableRoles = ["Pastor", "Diácono", "Líder de Louvor", "Secretário", "Tesoureiro", "Membro"]

  useEffect(() => {
    const userData = getUser()
    if (!userData) {
      router.push("/login")
      return
    }

    if (userData.accessLevel !== "admin") {
      router.push("/dashboard")
      return
    }

    setUser(userData)
    setMembers(getMembers())

    // Simular mensagens enviadas anteriormente
    setSentMessages([
      {
        id: "1",
        content: "Lembrete: Culto de oração hoje às 19h30",
        recipients: ["João Silva", "Maria Santos", "Pedro Costa"],
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
        status: "sent",
        recipientCount: 3,
      },
      {
        id: "2",
        content: "Reunião de liderança cancelada para hoje",
        recipients: ["Pastor João", "Diácono Pedro"],
        sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
        status: "sent",
        recipientCount: 2,
      },
    ])
  }, [router])

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers((prev) => (prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]))
  }

  const handleRoleToggle = (role: string) => {
    setSelectedRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]))
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedMembers([])
      setSelectedRoles([])
    } else {
      setSelectedMembers(members.map((m) => m.id))
      setSelectedRoles([])
    }
    setSelectAll(!selectAll)
  }

  const getSelectedMembersFromRoles = () => {
    return members.filter((member) => selectedRoles.includes(member.role))
  }

  const getAllSelectedMembers = () => {
    const directlySelected = members.filter((member) => selectedMembers.includes(member.id))
    const roleSelected = getSelectedMembersFromRoles()
    const allSelected = [...directlySelected, ...roleSelected]
    // Remove duplicatas
    return allSelected.filter((member, index, self) => index === self.findIndex((m) => m.id === member.id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    const selectedMembersData = getAllSelectedMembers()
    if (selectedMembersData.length === 0) {
      alert("Selecione pelo menos um destinatário")
      return
    }

    setIsSubmitting(true)

    // Simular envio
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const newMessage: WhatsAppMessage = {
      id: Date.now().toString(),
      content: message,
      recipients: selectedMembersData.map((m) => m.name),
      sentAt: new Date(),
      status: "sent",
      recipientCount: selectedMembersData.length,
    }

    setSentMessages((prev) => [newMessage, ...prev])

    // Reset form
    setMessage("")
    setSelectedMembers([])
    setSelectedRoles([])
    setSelectAll(false)
    setIsSubmitting(false)

    alert(`Mensagem enviada para ${selectedMembersData.length} pessoa(s)!`)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "sending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "sent":
        return "Enviada"
      case "sending":
        return "Enviando"
      case "failed":
        return "Falhou"
      default:
        return ""
    }
  }

  const handleViewDetails = (message: WhatsAppMessage) => {
    setSelectedMessage(message)
    setShowDetailsModal(true)
  }

  const handleModalBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowDetailsModal(false)
    }
  }

  if (!user) {
    return <div>Carregando...</div>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">WhatsApp</h1>
              <p className="text-gray-600">Envie mensagens para os membros da igreja</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Desktop: lado a lado */}
              <div className="hidden md:block text-right">
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-600">{user.role}</p>
              </div>
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=40&width=40&query=pastor+profile" />
                <AvatarFallback>
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {/* Mobile: embaixo da imagem */}
              <div className="md:hidden">
                <p className="font-medium text-gray-900 text-sm">{user.name}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-3">
              {/* Formulário de Envio */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Nova Mensagem WhatsApp
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="message">Mensagem</Label>
                        <Textarea
                          id="message"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Digite sua mensagem..."
                          rows={4}
                          required
                        />
                        <p className="text-sm text-gray-500">{message.length}/1000 caracteres</p>
                      </div>

                      {/* Seleção de Destinatários */}
                      <div className="space-y-4">
                        <Label>Destinatários</Label>

                        {/* Selecionar Todos */}
                        <div className="flex items-center space-x-2">
                          <Checkbox id="select-all" checked={selectAll} onCheckedChange={handleSelectAll} />
                          <Label htmlFor="select-all" className="font-medium">
                            Selecionar Todos os Membros
                          </Label>
                        </div>

                        <Separator />

                        {/* Seleção por Role */}
                        <div>
                          <Label className="text-sm font-medium mb-2 block">Por Função:</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {availableRoles.map((role) => (
                              <div key={role} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`role-${role}`}
                                  checked={selectedRoles.includes(role)}
                                  onCheckedChange={() => handleRoleToggle(role)}
                                />
                                <Label htmlFor={`role-${role}`} className="text-sm">
                                  {role}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        {/* Seleção Individual */}
                        <div>
                          <Label className="text-sm font-medium mb-2 block">Membros Individuais:</Label>
                          <div className="max-h-48 overflow-y-auto space-y-2">
                            {members.map((member) => (
                              <div key={member.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                                <Checkbox
                                  id={`member-${member.id}`}
                                  checked={selectedMembers.includes(member.id)}
                                  onCheckedChange={() => handleMemberToggle(member.id)}
                                />
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src="/placeholder.svg?height=32&width=32&query=church+member" />
                                  <AvatarFallback className="text-xs">
                                    {member.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <Label htmlFor={`member-${member.id}`} className="text-sm font-medium cursor-pointer">
                                    {member.name}
                                  </Label>
                                  <p className="text-xs text-gray-500">{member.role}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Resumo da Seleção */}
                        <div className="bg-blue-50 p-3 rounded-md">
                          <p className="text-sm font-medium text-blue-900">
                            Destinatários selecionados: {getAllSelectedMembers().length}
                          </p>
                          {selectedRoles.length > 0 && (
                            <p className="text-xs text-blue-700 mt-1">
                              Por função: {selectedRoles.join(", ")} ({getSelectedMembersFromRoles().length} pessoas)
                            </p>
                          )}
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting || !message.trim() || getAllSelectedMembers().length === 0}
                        className="w-full"
                      >
                        {isSubmitting ? (
                          <>
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Enviar Mensagem
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Histórico de Mensagens */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Mensagens Enviadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {sentMessages.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">Nenhuma mensagem enviada ainda</p>
                      ) : (
                        sentMessages.map((msg) => (
                          <div key={msg.id} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(msg.status)}
                                <Badge variant="outline" className="text-xs">
                                  {getStatusText(msg.status)}
                                </Badge>
                              </div>
                              <span className="text-xs text-gray-500">
                                {msg.sentAt.toLocaleDateString()} {msg.sentAt.toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 mb-2 line-clamp-2">{msg.content}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">{msg.recipientCount} destinatário(s)</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs"
                                onClick={() => handleViewDetails(msg)}
                              >
                                Ver detalhes
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showDetailsModal && selectedMessage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleModalBackdropClick}
        >
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Detalhes da Mensagem</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Mensagem:</label>
                <p className="text-sm text-gray-900">{selectedMessage.content}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Enviado em:</label>
                <p className="text-sm text-gray-900">
                  {selectedMessage.sentAt.toLocaleDateString()} às {selectedMessage.sentAt.toLocaleTimeString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status:</label>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedMessage.status)}
                  <span className="text-sm">{getStatusText(selectedMessage.status)}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Destinatários ({selectedMessage.recipientCount}):
                </label>
                <div className="max-h-32 overflow-y-auto">
                  {selectedMessage.recipients.map((recipient, index) => (
                    <p key={index} className="text-sm text-gray-900">
                      • {recipient}
                    </p>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
