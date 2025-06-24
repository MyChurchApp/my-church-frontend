"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Plus } from "lucide-react";

interface MemberData {
  name: string;
  email: string;
  document: string;
  rg: string; // ✅ NOVO
  tituloEleitor: string; // ✅ NOVO
  cnh: string; // ✅ NOVO
  certidaoNascimento: string; // ✅ NOVO
  outrosDocumentos: string; // ✅ NOVO
  photo: string;
  phone: string;
  birthDate: string;
  isBaptized: boolean;
  baptizedDate: string;
  isTither: boolean;
  roleMember: number;
  maritalStatus: string;
  memberSince: string;
  ministry: string;
  isActive: boolean;
  notes: string;
}

interface MemberRegistrationModalProps {
  onMemberCreated?: (member: any) => void;
}

export default function MemberRegistrationModal({
  onMemberCreated,
}: MemberRegistrationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<MemberData>({
    name: "",
    email: "",
    document: "",
    rg: "", // ✅ NOVO
    tituloEleitor: "", // ✅ NOVO
    cnh: "", // ✅ NOVO
    certidaoNascimento: "", // ✅ NOVO
    outrosDocumentos: "", // ✅ NOVO
    photo: "base64",
    phone: "",
    birthDate: "",
    isBaptized: false,
    baptizedDate: "",
    isTither: false,
    roleMember: 0,
    maritalStatus: "",
    memberSince: "",
    ministry: "",
    isActive: true,
    notes: "",
  });

  const getAuthToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("authToken");
  };

  // Função para validar data
  const isValidDate = (dateString: string): boolean => {
    if (!dateString) return false;

    // Verificar formato YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;

    const year = Number.parseInt(dateString.substring(0, 4));
    const month = Number.parseInt(dateString.substring(5, 7));
    const day = Number.parseInt(dateString.substring(8, 10));

    // Verificar limites razoáveis
    if (year < 1900 || year > 2100) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;

    // Verificar se a data é válida
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  };

  // Função para formatar data para ISO
  const formatDateToISO = (dateString: string): string => {
    if (!dateString) return "";
    return `${dateString}T00:00:00`;
  };

  const createMember = async (memberData: any) => {
    const token = getAuthToken();

    if (!token) {
      throw new Error(
        "Token de autenticação não encontrado. Faça login novamente."
      );
    }

    try {
      const response = await fetch(
        "https://demoapp.top1soft.com.br/api/Member",
        {
          method: "POST",
          headers: {
            accept: "text/plain",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(memberData),
        }
      );

      if (!response.ok) {
        let errorMessage = `Erro na API: ${response.status}`;

        try {
          const errorData = await response.json();
          console.error("Detalhes do erro (JSON):", errorData);

          if (errorData.title) {
            errorMessage = errorData.title;
          }
          if (errorData.detail) {
            errorMessage += `: ${errorData.detail}`;
          }
          if (errorData.errors) {
            const errorDetails = Object.entries(errorData.errors)
              .map(
                ([key, value]) =>
                  `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
              )
              .join("; ");
            errorMessage += ` - Campos com erro: ${errorDetails}`;
          }
        } catch (e) {
          try {
            const errorText = await response.text();
            console.error("Detalhes do erro (texto):", errorText);
            if (errorText) {
              errorMessage += `: ${errorText}`;
            }
          } catch (textError) {
            console.error("Não foi possível ler o corpo da resposta de erro");
          }
        }

        throw new Error(errorMessage);
      }

      return await response.text();
    } catch (error) {
      console.error("Erro na requisição:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validações básicas
    if (!formData.name.trim()) {
      setError("Nome é obrigatório");
      setLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setError("Email é obrigatório");
      setLoading(false);
      return;
    }

    if (!formData.document.trim()) {
      setError("Documento é obrigatório");
      setLoading(false);
      return;
    }

    if (!formData.phone.trim()) {
      setError("Telefone é obrigatório");
      setLoading(false);
      return;
    }

    // Validar data de nascimento
    if (!formData.birthDate || !isValidDate(formData.birthDate)) {
      setError("Data de nascimento inválida");
      setLoading(false);
      return;
    }

    // Validar data de batismo se for batizado
    if (
      formData.isBaptized &&
      formData.baptizedDate &&
      !isValidDate(formData.baptizedDate)
    ) {
      setError("Data de batismo inválida");
      setLoading(false);
      return;
    }

    // Validar data de membro desde
    if (formData.memberSince && !isValidDate(formData.memberSince)) {
      setError("Data de início como membro inválida");
      setLoading(false);
      return;
    }

    // Validações mais rigorosas
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setError("Nome deve ter pelo menos 2 caracteres");
      setLoading(false);
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError("Email deve ter um formato válido");
      setLoading(false);
      return;
    }

    // Validar CPF (formato básico)
    const documentNumbers = formData.document.replace(/\D/g, "");
    if (documentNumbers.length !== 11) {
      setError("Documento deve ter 11 dígitos");
      setLoading(false);
      return;
    }

    // Validar telefone
    const phoneNumbers = formData.phone.replace(/\D/g, "");
    if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
      setError("Telefone deve ter 10 ou 11 dígitos");
      setLoading(false);
      return;
    }

    try {
      // Extrair churchId do token
      const token = getAuthToken();
      let churchId = 0;

      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          churchId = payload.churchId || 0;
        } catch (e) {
          console.error("Erro ao decodificar token:", e);
        }
      }

      // Usar datas padrão válidas
      const today = new Date().toISOString().split("T")[0];
      const defaultDate = "2020-01-01"; // Data padrão para campos de data

      // Preparar dados para envio - garantindo todos os campos obrigatórios
      const memberData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        document: formData.document.replace(/\D/g, ""), // Remove caracteres não numéricos do CPF
        photo: "base64",
        phone: formData.phone.replace(/\D/g, ""), // Remove caracteres não numéricos do telefone
        birthDate: formatDateToISO(formData.birthDate),
        isBaptized: Boolean(formData.isBaptized),
        baptizedDate: formatDateToISO(
          formData.isBaptized && formData.baptizedDate
            ? formData.baptizedDate
            : defaultDate
        ),
        isTither: Boolean(formData.isTither),
        roleMember: 0,
        maritalStatus: formData.maritalStatus || "Solteiro",
        memberSince: formatDateToISO(formData.memberSince || defaultDate),
        ministry: formData.ministry || "Louvor",
        isActive: Boolean(formData.isActive),
        notes: formData.notes || "Membro cadastrado pelo sistema",
      };

      // Só adicionar churchId se for maior que 0
      if (churchId > 0) {
        memberData.churchId = churchId;
      }

      const result = await createMember(memberData);

      setSuccess("Membro cadastrado com sucesso!");

      // Chamar callback se fornecido
      if (onMemberCreated) {
        onMemberCreated(result);
      }

      // Resetar formulário
      setFormData({
        name: "",
        email: "",
        document: "",
        rg: "", // ✅ NOVO
        tituloEleitor: "", // ✅ NOVO
        cnh: "", // ✅ NOVO
        certidaoNascimento: "", // ✅ NOVO
        outrosDocumentos: "", // ✅ NOVO
        photo: "base64",
        phone: "",
        birthDate: "",
        isBaptized: false,
        baptizedDate: "",
        isTither: false,
        roleMember: 0,
        maritalStatus: "",
        memberSince: "",
        ministry: "",
        isActive: true,
        notes: "",
      });

      // Fechar modal após 2 segundos
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(null);
      }, 2000);
    } catch (error: any) {
      console.error("Erro ao cadastrar membro:", error);
      setError(error.message || "Erro ao cadastrar membro");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof MemberData,
    value: string | boolean | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
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
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="document">Documento (CPF) *</Label>
              <Input
                id="document"
                value={formData.document}
                onChange={(e) => handleInputChange("document", e.target.value)}
                placeholder="000.000.000-00"
                required
              />
            </div>
          </div>

          {/* Documentos */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Documentos</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="document">CPF *</Label>
                <Input
                  id="document"
                  value={formData.document}
                  onChange={(e) =>
                    handleInputChange("document", e.target.value)
                  }
                  placeholder="000.000.000-00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rg">RG</Label>
                <Input
                  id="rg"
                  value={formData.rg}
                  onChange={(e) => handleInputChange("rg", e.target.value)}
                  placeholder="00.000.000-0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tituloEleitor">Título de Eleitor</Label>
                <Input
                  id="tituloEleitor"
                  value={formData.tituloEleitor}
                  onChange={(e) =>
                    handleInputChange("tituloEleitor", e.target.value)
                  }
                  placeholder="0000 0000 0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnh">CNH</Label>
                <Input
                  id="cnh"
                  value={formData.cnh}
                  onChange={(e) => handleInputChange("cnh", e.target.value)}
                  placeholder="00000000000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="certidaoNascimento">
                  Certidão de Nascimento
                </Label>
                <Input
                  id="certidaoNascimento"
                  value={formData.certidaoNascimento}
                  onChange={(e) =>
                    handleInputChange("certidaoNascimento", e.target.value)
                  }
                  placeholder="Número da certidão"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="outrosDocumentos">Outros Documentos</Label>
                <Input
                  id="outrosDocumentos"
                  value={formData.outrosDocumentos}
                  onChange={(e) =>
                    handleInputChange("outrosDocumentos", e.target.value)
                  }
                  placeholder="Outros documentos"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="email@exemplo.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="(11) 99999-9999"
                required
              />
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
                max={new Date().toISOString().split("T")[0]} // Não permitir datas futuras
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maritalStatus">Estado Civil</Label>
              <Select
                value={formData.maritalStatus}
                onValueChange={(value) =>
                  handleInputChange("maritalStatus", value)
                }
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

          {/* Informações da Igreja */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="memberSince">Membro desde</Label>
              <Input
                id="memberSince"
                type="date"
                value={formData.memberSince}
                onChange={(e) =>
                  handleInputChange("memberSince", e.target.value)
                }
                max={new Date().toISOString().split("T")[0]} // Não permitir datas futuras
              />
              <p className="text-xs text-gray-500">
                Se não informado, será usado 01/01/2020
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ministry">Ministério</Label>
              <Input
                id="ministry"
                value={formData.ministry}
                onChange={(e) => handleInputChange("ministry", e.target.value)}
                placeholder="Ex: Louvor, Ensino, Evangelismo"
              />
              <p className="text-xs text-gray-500">
                Se não informado, será usado "Louvor"
              </p>
            </div>
          </div>

          {/* Switches */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isBaptized"
                checked={formData.isBaptized}
                onCheckedChange={(checked) =>
                  handleInputChange("isBaptized", checked)
                }
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
                  onChange={(e) =>
                    handleInputChange("baptizedDate", e.target.value)
                  }
                  max={new Date().toISOString().split("T")[0]} // Não permitir datas futuras
                />
                <p className="text-xs text-gray-500">
                  Se não informado, será usado 14/10/2023
                </p>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="isTither"
                checked={formData.isTither}
                onCheckedChange={(checked) =>
                  handleInputChange("isTither", checked)
                }
              />
              <Label htmlFor="isTither">Dizimista</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  handleInputChange("isActive", checked)
                }
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
  );
}
