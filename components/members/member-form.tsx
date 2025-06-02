"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Send, Key } from "lucide-react"

interface MemberFormData {
  name: string
  email: string
  phone: string
  cpf: string
  birthDate: string
  address: string
  city: string
  state: string
  zipCode: string
  maritalStatus: string
  baptized: boolean
  memberSince: string
  ministry: string
  isActive: boolean
  notes: string
}

interface Member {
  id: string
  name: string
  email: string
}

interface User {
  role: string
}

interface MemberFormProps {
  memberForm: MemberFormData
  setMemberForm: (form: MemberFormData) => void
  onSubmit: (e: React.FormEvent) => void
  isEdit?: boolean
  selectedMember?: Member | null
  user?: User
  onSendPasswordReset?: (member: Member) => void
  onGenerateNewPassword?: (member: Member) => void
}

export function MemberForm({
  memberForm,
  setMemberForm,
  onSubmit,
  isEdit = false,
  selectedMember,
  user,
  onSendPasswordReset,
  onGenerateNewPassword,
}: MemberFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
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

      {isEdit && (
        <div className="flex items-center space-x-2">
          <Switch
            id="member-active"
            checked={memberForm.isActive}
            onCheckedChange={(checked) => setMemberForm({ ...memberForm, isActive: checked })}
          />
          <Label htmlFor="member-active">Membro Ativo</Label>
        </div>
      )}

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

      {isEdit && user?.role === "Admin" && selectedMember && onSendPasswordReset && onGenerateNewPassword && (
        <div className="border-t pt-4 space-y-3">
          <h4 className="font-medium text-gray-900">Gerenciamento de Senha</h4>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onSendPasswordReset(selectedMember)}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Enviar Recuperação
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onGenerateNewPassword(selectedMember)}
              className="flex items-center gap-2"
            >
              <Key className="h-4 w-4" />
              Gerar Nova Senha
            </Button>
          </div>
        </div>
      )}

      <Button type="submit" className="w-full">
        {isEdit ? "Salvar Alterações" : "Cadastrar Membro"}
      </Button>
    </form>
  )
}
