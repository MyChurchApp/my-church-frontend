"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Building2, CreditCard, Settings, AlertTriangle, Check, Edit, Save, X } from "lucide-react"
import { getUser, getChurchInfo, getSubscriptionInfo } from "@/lib/fake-api"

export default function ConfiguracoesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [churchInfo, setChurchInfo] = useState<any>(null)
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedChurch, setEditedChurch] = useState<any>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

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
    const church = getChurchInfo()
    setChurchInfo(church)
    setEditedChurch(church)
    setSubscriptionInfo(getSubscriptionInfo())
  }, [router])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    setChurchInfo(editedChurch)
    setIsEditing(false)
    alert("Informações da igreja atualizadas com sucesso!")
  }

  const handleCancel = () => {
    setEditedChurch(churchInfo)
    setIsEditing(false)
  }

  const handleCancelSubscription = () => {
    alert("Assinatura cancelada com sucesso!")
    setShowCancelModal(false)
  }

  const handleUpdatePayment = () => {
    alert("Método de pagamento atualizado com sucesso!")
    setShowPaymentModal(false)
  }

  if (!user || !churchInfo || !subscriptionInfo) {
    return <div>Carregando...</div>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
              <p className="text-gray-600">Gerencie as configurações da igreja e assinatura</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Informações da Igreja */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <CardTitle>Informações da Igreja</CardTitle>
                  </div>
                  {!isEditing ? (
                    <Button onClick={handleEdit} variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={handleSave} size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Salvar
                      </Button>
                      <Button onClick={handleCancel} variant="outline" size="sm">
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="church-name">Nome da Igreja</Label>
                    <Input
                      id="church-name"
                      value={editedChurch?.name || ""}
                      onChange={(e) => setEditedChurch({ ...editedChurch, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pastor-name">Pastor</Label>
                    <Input
                      id="pastor-name"
                      value={editedChurch?.pastor || ""}
                      onChange={(e) => setEditedChurch({ ...editedChurch, pastor: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="church-email">Email</Label>
                    <Input
                      id="church-email"
                      type="email"
                      value={editedChurch?.email || ""}
                      onChange={(e) => setEditedChurch({ ...editedChurch, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="church-phone">Telefone</Label>
                    <Input
                      id="church-phone"
                      value={editedChurch?.phone || ""}
                      onChange={(e) => setEditedChurch({ ...editedChurch, phone: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="church-address">Endereço</Label>
                  <Textarea
                    id="church-address"
                    value={editedChurch?.address || ""}
                    onChange={(e) => setEditedChurch({ ...editedChurch, address: e.target.value })}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Plano Atual */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <CardTitle>Plano Atual</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{subscriptionInfo.plan}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" />
                        {subscriptionInfo.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">R$ {subscriptionInfo.price}</p>
                    <p className="text-sm text-gray-600">por mês</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Próximo vencimento</p>
                    <p className="font-medium">{subscriptionInfo.nextBilling}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Método de pagamento</p>
                    <p className="font-medium">{subscriptionInfo.paymentMethod}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Recursos inclusos:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {subscriptionInfo.includedFeatures.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
                    <DialogTrigger asChild>
                      <Button variant="outline">Alterar Pagamento</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Alterar Método de Pagamento</DialogTitle>
                        <DialogDescription>Atualize suas informações de pagamento</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="card-number">Número do Cartão</Label>
                          <Input id="card-number" placeholder="**** **** **** ****" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="expiry">Validade</Label>
                            <Input id="expiry" placeholder="MM/AA" />
                          </div>
                          <div>
                            <Label htmlFor="cvv">CVV</Label>
                            <Input id="cvv" placeholder="***" />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="cardholder">Nome no Cartão</Label>
                          <Input id="cardholder" placeholder="Nome completo" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleUpdatePayment}>Atualizar</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Gerenciar Assinatura */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-600" />
                  <CardTitle>Gerenciar Assinatura</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <p className="text-sm text-yellow-800">
                        <strong>Atenção:</strong> O cancelamento da assinatura resultará na perda de acesso a todas as
                        funcionalidades premium.
                      </p>
                    </div>
                  </div>

                  <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
                    <DialogTrigger asChild>
                      <Button variant="destructive">Cancelar Assinatura</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cancelar Assinatura</DialogTitle>
                        <DialogDescription>
                          Tem certeza que deseja cancelar sua assinatura? Esta ação não pode ser desfeita.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-800">Ao cancelar, você perderá acesso a:</p>
                          <ul className="list-disc list-inside text-sm text-red-700 mt-2">
                            <li>Gestão avançada de membros</li>
                            <li>Relatórios financeiros</li>
                            <li>Sistema de eventos</li>
                            <li>Suporte prioritário</li>
                          </ul>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCancelModal(false)}>
                          Manter Assinatura
                        </Button>
                        <Button variant="destructive" onClick={handleCancelSubscription}>
                          Confirmar Cancelamento
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
