"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Plus, CheckCircle } from "lucide-react"

interface ValidatedMemberModalProps {
  onMemberCreated?: (member: any) => void
}

export default function ValidatedMemberModal({ onMemberCreated }: ValidatedMemberModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    document: "",
    phone: "",
    birthDate: "",
    isBaptized: false,
    baptizedDate: "",
    isTither: false,
    maritalStatus: "",
    memberSince: "",
    ministry: "",
    isActive: true,
    notes: "",
  })

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const getAuthToken = () => {
    if (typeof window === "undefined") return null
    return localStorage.getItem("authToken")
  }

  // Validação de CPF
  const validateCPF = (cpf: string): boolean => {
    const cleanCPF = cpf.replace(/\D/g, "")

    if (cleanCPF.length !== 11) return false
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false // CPFs com todos os dígitos iguais

    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += Number.parseInt(cleanCPF.charAt(i)) * (10 - i)
    }
    let remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== Number.parseInt(cleanCPF.charAt(9))) return false

    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += Number.parseInt(cleanCPF.charAt(i)) * (11 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    return remainder === Number.parseInt(cleanCPF.charAt(10))
  }

  // Validação de email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validação de telefone
  const validatePhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, "")
    return cleanPhone.length >= 10 && cleanPhone.length <= 11
  }

  // Validação de data
  const validateDate = (dateString: string): boolean => {
    if (!dateString) return false
    const date = new Date(dateString)
    const today = new Date()
    return date <= today && date.getFullYear() >= 1900
  }

  // Máscara para CPF
  const formatCPF = (value: string): string => {
    const cleanValue = value.replace(/\D/g, "")
    return cleanValue
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1")
  }

  // Máscara para telefone
  const formatPhone = (value: string): string => {
    const cleanValue = value.replace(/\D/g, "")
    if (cleanValue.length <= 10) {
      return cleanValue.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
    }
    return cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }

  // Validar todos os campos
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Nome
    if (!formData.name.trim()) {
      errors.name = "Nome é obrigatório"
    } else if (formData.name.trim().length < 2) {
      errors.name = "Nome deve ter pelo menos 2 caracteres"
    }

    // Email
    if (!formData.email.trim()) {
      errors.email = "Email é obrigatório"
    } else if (!validateEmail(formData.email)) {
      errors.email = "Email deve ter um formato válido"
    }

    // CPF
    if (!formData.document.trim()) {
      errors.document = "CPF é obrigatório"
    } else if (!validateCPF(formData.document)) {
      errors.document = "CPF inválido"
    }

    // Telefone
    if (!formData.phone.trim()) {
      errors.phone = "Telefone é obrigatório"
    } else if (!validatePhone(formData.phone)) {
      errors.phone = "Telefone deve ter 10 ou 11 dígitos"
    }

    // Data de nascimento
    if (!formData.birthDate) {
      errors.birthDate = "Data de nascimento é obrigatória"
    } else if (!validateDate(formData.birthDate)) {
      errors.birthDate = "Data de nascimento inválida"
    }

    // Data de batismo (se batizado)
    if (formData.isBaptized && formData.baptizedDate && !validateDate(formData.baptizedDate)) {
      errors.baptizedDate = "Data de batismo inválida"
    }

    // Data de membro desde
    if (formData.memberSince && !validateDate(formData.memberSince)) {
      errors.memberSince = "Data de início como membro inválida"
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const createMember = async (memberData: any) => {
    const token = getAuthToken()

    if (!token) {
      throw new Error("Token de autenticação não encontrado")
    }

    const response = await fetch("https://demoapp.top1soft.com.br/api/Member", {
      method: "POST",
      headers: {
        accept: "text/plain",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(memberData),
    })

    if (!response.ok) {
      if (response.status === 500) {
        throw new Error("Erro no cadastro. Verifique os dados e tente novamente.")
      }
      if (response.status === 401) {
        throw new Error("Sessão expirada. Faça login novamente.")
      }
      if (response.status === 400) {
        throw new Error("Dados inválidos. Verifique os campos obrigatórios.")
      }
      throw new Error("Erro no servidor. Tente novamente mais tarde.")
    }

    return await response.text()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validar formulário
    if (!validateForm()) {
      setError("Corrija os erros nos campos destacados")
      return
    }

    setLoading(true)

    try {
      // Preparar dados para envio
      const memberData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        document: formData.document.replace(/\D/g, ""), // Apenas números
        photo: "base64",
        phone: formData.phone.replace(/\D/g, ""), // Apenas números
        birthDate: formData.birthDate + "T00:00:00",
        isBaptized: formData.isBaptized,
        baptizedDate:
          formData.isBaptized && formData.baptizedDate ? formData.baptizedDate + "T00:00:00" : "2023-10-14T00:00:00",
        isTither: formData.isTither,
        roleMember: 0,
        maritalStatus: formData.maritalStatus || "Solteiro",
        memberSince: formData.memberSince ? formData.memberSince + "T00:00:00" : "2020-01-01T00:00:00",
        ministry: formData.ministry || "Louvor",
        isActive: formData.isActive,
        notes: formData.notes || "Membro cadastrado pelo sistema",
      }

      const result = await createMember(memberData)

      setSuccess("Membro cadastrado com sucesso!")

      if (onMemberCreated) {
        onMemberCreated(result)
      }

      // Reset form
      setFormData({
        name: "",
        email: "",
        document: "",
        phone: "",
        birthDate: "",
        isBaptized: false,
        baptizedDate: "",
        isTither: false,
        maritalStatus: "",
        memberSince: "",
        ministry: "",
        isActive: true,
        notes: "",
      })
      setFieldErrors({})

      // Fechar modal após 2 segundos
      setTimeout(() => {
        setIsOpen(false)
        setSuccess(null)
      }, 2000)
    } catch (error: any) {
      console.error("Erro ao cadastrar membro:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Limpar erro do campo quando o usuário começar a digitar
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informações Básicas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Nome completo"
                className={fieldErrors.name ? "border-red-500" : ""}
                required
              />
              {fieldErrors.name && <p className="text-sm text-red-500">{fieldErrors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="email@exemplo.com"
                className={fieldErrors.email ? "border-red-500" : ""}
                required
              />
              {fieldErrors.email && <p className="text-sm text-red-500">{fieldErrors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="document">CPF *</Label>
              <Input
                id="document"
                value={formatCPF(formData.document)}
                onChange={(e) => handleInputChange("document", e.target.value)}
                placeholder="000.000.000-00"
                className={fieldErrors.document ? "border-red-500" : ""}
                maxLength={14}
                required
              />
              {fieldErrors.document && <p className="text-sm text-red-500">{fieldErrors.document}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                value={formatPhone(formData.phone)}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="(11) 99999-9999"
                className={fieldErrors.phone ? "border-red-500" : ""}
                maxLength={15}
                required
              />
              {fieldErrors.phone && <p className="text-sm text-red-500">{fieldErrors.phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de Nascimento *</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleInputChange("birthDate", e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className={fieldErrors.birthDate ? "border-red-500" : ""}
                required
              />
              {fieldErrors.birthDate && <p className="text-sm text-red-500">{fieldErrors.birthDate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maritalStatus">Estado Civil</Label>
              <Select
                value={formData.maritalStatus}
                onValueChange={(value) => handleInputChange("maritalStatus", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Solteiro">Solteiro(a)</SelectItem>
                  <SelectItem value="Casado">Casado(a)</SelectItem>
                  <SelectItem value="Divorciado">Divorciado(a)</SelectItem>
                  <SelectItem value="Viuvo">Viúvo(a)</SelectItem>
                  <SelectItem value="União Estável">União Estável</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Informações da Igreja */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="memberSince">Membro desde</Label>
              <Input
                id="memberSince"
                type="date"
                value={formData.memberSince}
                onChange={(e) => handleInputChange("memberSince", e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className={fieldErrors.memberSince ? "border-red-500" : ""}
              />
              {fieldErrors.memberSince && <p className="text-sm text-red-500">{fieldErrors.memberSince}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ministry">Ministério</Label>
              <Select value={formData.ministry} onValueChange={(value) => handleInputChange("ministry", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Louvor">Louvor</SelectItem>
                  <SelectItem value="Ensino">Ensino</SelectItem>
                  <SelectItem value="Evangelismo">Evangelismo</SelectItem>
                  <SelectItem value="Intercessão">Intercessão</SelectItem>
                  <SelectItem value="Crianças">Crianças</SelectItem>
                  <SelectItem value="Jovens">Jovens</SelectItem>
                  <SelectItem value="Casais">Casais</SelectItem>
                  <SelectItem value="Diaconia">Diaconia</SelectItem>
                  <SelectItem value="Mídia">Mídia</SelectItem>
                  <SelectItem value="Recepção">Recepção</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Switches */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isBaptized"
                checked={formData.isBaptized}
                onCheckedChange={(checked) => handleInputChange("isBaptized", checked)}
              />
              <Label htmlFor="isBaptized">Batizado</Label>
            </div>

            {formData.isBaptized && (
              <div className="space-y-2">
                <Label htmlFor="baptizedDate">Data de Batismo</Label>
                <Input
                  id="baptizedDate"
                  type="date"
                  value={formData.baptizedDate}
                  onChange={(e) => handleInputChange("baptizedDate", e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className={fieldErrors.baptizedDate ? "border-red-500" : ""}
                />
                {fieldErrors.baptizedDate && <p className="text-sm text-red-500">{fieldErrors.baptizedDate}</p>}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="isTither"
                checked={formData.isTither}
                onCheckedChange={(checked) => handleInputChange("isTither", checked)}
              />
              <Label htmlFor="isTither">Dizimista</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange("isActive", checked)}
              />
              <Label htmlFor="isActive">Membro Ativo</Label>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Observações sobre o membro"
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
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
  )
}
