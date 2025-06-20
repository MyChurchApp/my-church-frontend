"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Heart, CreditCard, QrCode, CheckCircle, AlertCircle, Copy, ArrowLeft, Loader2, Clock } from "lucide-react"
import { donationService } from "@/services/donation/donation.service"
import type { DonationFormData, DonationResponse } from "@/containers/donation/useDonation"
import Link from "next/link"
import Image from "next/image"

interface DonationComponentProps {
  formData: DonationFormData
  updateFormData: (field: string, value: any) => void
  isLoading: boolean
  error: string | null
  success: DonationResponse | null
  submitDonation: () => Promise<boolean>
  resetForm: () => void
  clearError: () => void
  clearSuccess: () => void
}

export function DonationComponent({
  formData,
  updateFormData,
  isLoading,
  error,
  success,
  submitDonation,
  resetForm,
  clearError,
  clearSuccess,
}: DonationComponentProps) {
  const [copiedPix, setCopiedPix] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitDonation()
  }

  const handleCardNumberChange = (value: string) => {
    const formatted = donationService.formatCardNumber(value)
    updateFormData("creditCard.number", formatted)
  }

  const handleCpfCnpjChange = (value: string) => {
    const formatted = donationService.formatCpfCnpj(value)
    updateFormData("creditCardHolderInfo.cpfCnpj", formatted)
  }

  const handleCepChange = (value: string) => {
    const formatted = donationService.formatCep(value)
    updateFormData("creditCardHolderInfo.postalCode", formatted)
  }

  const copyPixCode = async () => {
    if (success?.pixQrCode?.payload) {
      try {
        await navigator.clipboard.writeText(success.pixQrCode.payload)
        setCopiedPix(true)
        setTimeout(() => setCopiedPix(false), 2000)
      } catch (err) {
        console.error("Erro ao copiar código PIX:", err)
      }
    }
  }

  const handleNewDonation = () => {
    clearSuccess()
    resetForm()
  }

  const translateStatus = (status: string) => {
    const statusTranslations: { [key: string]: string } = {
      PENDING: "Pendente",
      CONFIRMED: "Confirmado",
      RECEIVED: "Recebido",
      OVERDUE: "Vencido",
      REFUNDED: "Reembolsado",
      RECEIVED_IN_CASH: "Recebido em Dinheiro",
      REFUND_REQUESTED: "Reembolso Solicitado",
      REFUND_IN_PROGRESS: "Reembolso em Andamento",
      CHARGEBACK_REQUESTED: "Estorno Solicitado",
      CHARGEBACK_DISPUTE: "Disputa de Estorno",
      AWAITING_CHARGEBACK_REVERSAL: "Aguardando Reversão de Estorno",
      DUNNING_REQUESTED: "Cobrança Solicitada",
      DUNNING_RECEIVED: "Cobrança Recebida",
      AWAITING_RISK_ANALYSIS: "Aguardando Análise de Risco",
    }
    return statusTranslations[status] || status
  }

  // Tela de loading durante processamento
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <h3 className="text-xl font-semibold">Processando sua doação...</h3>
            <p className="text-gray-600 text-center">
              Aguarde enquanto processamos sua doação. Isso pode levar alguns segundos.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Se a doação foi bem-sucedida, mostrar tela de sucesso
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="mb-6">
            <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Início
            </Link>
          </div>

          <Card className="text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">Obrigado pela doação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Valor da doação</p>
                <p className="text-2xl font-bold text-gray-900">
                  R${" "}
                  {success.value
                    ? Number(success.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })
                    : Number(formData.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="text-left space-y-2">
                <p>
                  <span className="font-medium">Descrição:</span> {success.description || formData.description}
                </p>

                <p>
                  <span className="font-medium">Status:</span> {translateStatus(success.status)}
                </p>
              </div>

              {/* Exibir QR Code do PIX */}
              {formData.billingType === "PIX" && success.pixQrCode && (
                <div className="space-y-4">
                  <Separator />
                  <div>
                    <h3 className="font-medium mb-3 flex items-center justify-center">
                      <QrCode className="h-5 w-5 mr-2" />
                      Escaneie o QR Code para pagar
                    </h3>

                    {/* QR Code Image */}
                    <div className="flex justify-center mb-4">
                      <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                        <Image
                          src={`data:image/png;base64,${success.pixQrCode.encodedImage}`}
                          alt="QR Code PIX"
                          width={200}
                          height={200}
                          className="mx-auto"
                        />
                      </div>
                    </div>

                    {/* Código PIX para copiar */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Ou copie o código PIX:</p>
                      <p className="text-xs text-gray-800 mb-3 break-all font-mono bg-white p-2 rounded border">
                        {success.pixQrCode.payload}
                      </p>
                      <Button onClick={copyPixCode} variant="outline" size="sm" className="w-full">
                        <Copy className="h-4 w-4 mr-2" />
                        {copiedPix ? "Copiado!" : "Copiar código PIX"}
                      </Button>
                    </div>

                    {/* Data de expiração */}
                    {success.pixQrCode.expirationDate && (
                      <div className="flex items-center justify-center text-sm text-gray-600 mt-3">
                        <Clock className="h-4 w-4 mr-1" />
                        Válido até: {donationService.formatExpirationDate(success.pixQrCode.expirationDate)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Link de pagamento para cartão */}
              {formData.billingType === "CREDIT_CARD" && success.paymentLink && (
                <div className="space-y-4">
                  <Separator />
                  <div>
                    <h3 className="font-medium mb-3 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Finalizar pagamento
                    </h3>
                    <Button asChild className="w-full">
                      <a href={success.paymentLink} target="_blank" rel="noopener noreferrer">
                        Ir para pagamento
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button onClick={handleNewDonation} className="flex-1">
                  <Heart className="h-4 w-4 mr-2" />
                  Nova Doação
                </Button>
                <Link href="/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Voltar ao Início
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Início
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Heart className="h-6 w-6 mr-3 text-red-500" />
              Fazer uma Doação
            </CardTitle>
            <p className="text-gray-600">
              Sua contribuição faz a diferença em nossa comunidade. Obrigado por seu coração generoso!
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Valor e Descrição */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">Valor da Doação (R$) *</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="0,00"
                    value={formData.value}
                    onChange={(e) => updateFormData("value", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Finalidade da Doação *</Label>
                  <Input
                    id="description"
                    placeholder="Ex: Dízimo, Oferta, Missões..."
                    value={formData.description}
                    onChange={(e) => updateFormData("description", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Método de Pagamento */}
              <div className="space-y-4">
                <Label>Método de Pagamento *</Label>
                <RadioGroup
                  value={formData.billingType}
                  onValueChange={(value) => updateFormData("billingType", value)}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50">
                    <RadioGroupItem value="PIX" id="pix" />
                    <Label htmlFor="pix" className="flex items-center cursor-pointer">
                      <QrCode className="h-5 w-5 mr-2 text-green-600" />
                      PIX (Instantâneo)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50">
                    <RadioGroupItem value="CREDIT_CARD" id="credit" />
                    <Label htmlFor="credit" className="flex items-center cursor-pointer">
                      <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                      Cartão de Crédito
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Dados do Cartão de Crédito */}
              {formData.billingType === "CREDIT_CARD" && (
                <div className="space-y-6 border-t pt-6">
                  <h3 className="text-lg font-medium">Dados do Cartão</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="holderName">Nome no Cartão *</Label>
                      <Input
                        id="holderName"
                        placeholder="Nome como está no cartão"
                        value={formData.creditCard.holderName}
                        onChange={(e) => updateFormData("creditCard.holderName", e.target.value)}
                        required
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="cardNumber">Número do Cartão *</Label>
                      <Input
                        id="cardNumber"
                        placeholder="0000 0000 0000 0000"
                        value={formData.creditCard.number}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        maxLength={19}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expiryMonth">Mês de Validade *</Label>
                      <Input
                        id="expiryMonth"
                        placeholder="MM"
                        value={formData.creditCard.expiryMonth}
                        onChange={(e) => updateFormData("creditCard.expiryMonth", e.target.value)}
                        maxLength={2}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expiryYear">Ano de Validade *</Label>
                      <Input
                        id="expiryYear"
                        placeholder="AAAA"
                        value={formData.creditCard.expiryYear}
                        onChange={(e) => updateFormData("creditCard.expiryYear", e.target.value)}
                        maxLength={4}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ccv">CCV *</Label>
                      <Input
                        id="ccv"
                        placeholder="000"
                        value={formData.creditCard.ccv}
                        onChange={(e) => updateFormData("creditCard.ccv", e.target.value)}
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>

                  <Separator />

                  <h3 className="text-lg font-medium">Dados do Portador</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="holderInfoName">Nome Completo *</Label>
                      <Input
                        id="holderInfoName"
                        placeholder="Nome completo"
                        value={formData.creditCardHolderInfo.name}
                        onChange={(e) => updateFormData("creditCardHolderInfo.name", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@exemplo.com"
                        value={formData.creditCardHolderInfo.email}
                        onChange={(e) => updateFormData("creditCardHolderInfo.email", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cpfCnpj">CPF/CNPJ *</Label>
                      <Input
                        id="cpfCnpj"
                        placeholder="000.000.000-00"
                        value={formData.creditCardHolderInfo.cpfCnpj}
                        onChange={(e) => handleCpfCnpjChange(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input
                        id="phone"
                        placeholder="(11) 99999-9999"
                        value={formData.creditCardHolderInfo.phone}
                        onChange={(e) => updateFormData("creditCardHolderInfo.phone", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postalCode">CEP *</Label>
                      <Input
                        id="postalCode"
                        placeholder="00000-000"
                        value={formData.creditCardHolderInfo.postalCode}
                        onChange={(e) => handleCepChange(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="addressNumber">Número do Endereço *</Label>
                      <Input
                        id="addressNumber"
                        placeholder="123"
                        value={formData.creditCardHolderInfo.addressNumber}
                        onChange={(e) => updateFormData("creditCardHolderInfo.addressNumber", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Botões */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                  style={{ backgroundColor: "#89f0e6", color: "#000" }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Heart className="h-4 w-4 mr-2" />
                      Confirmar Doação
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} disabled={isLoading} className="flex-1">
                  Limpar Formulário
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
