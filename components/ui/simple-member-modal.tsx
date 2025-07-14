"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Plus } from "lucide-react";

interface SimpleMemberModalProps {
  onMemberCreated?: (member: any) => void;
}

export default function SimpleMemberModal({
  onMemberCreated,
}: SimpleMemberModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
  });

  const getAuthToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("authToken");
  };

  const createMember = async (memberData: any) => {
    const token = getAuthToken();

    if (!token) {
      throw new Error("Token de autenticação não encontrado");
    }

    const response = await fetch("https://demoapp.top1soft.com.br/api/Member", {
      method: "POST",
      headers: {
        accept: "text/plain",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(memberData),
    });

    if (!response.ok) {
      const errorText = await response.text();

      let errorMessage = `Erro ${response.status}`;

      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.detail) {
          errorMessage += `: ${errorJson.detail}`;
        }
        if (errorJson.errors) {
          const errors = Object.entries(errorJson.errors)
            .map(
              ([field, messages]) =>
                `${field}: ${
                  Array.isArray(messages) ? messages.join(", ") : messages
                }`
            )
            .join("; ");
          errorMessage += ` - ${errors}`;
        }
      } catch (e) {
        errorMessage += `: ${errorText}`;
      }

      throw new Error(errorMessage);
    }

    return await response.text();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validações básicas
      if (!formData.name.trim()) throw new Error("Nome é obrigatório");
      if (!formData.email.trim()) throw new Error("Email é obrigatório");
      if (!formData.document.trim()) throw new Error("Documento é obrigatório");
      if (!formData.phone.trim()) throw new Error("Telefone é obrigatório");
      if (!formData.birthDate)
        throw new Error("Data de nascimento é obrigatória");

      // Preparar dados EXATAMENTE como no exemplo do Swagger
      const memberData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        document: formData.document.replace(/\D/g, ""), // Apenas números
        photo: "base64",
        phone: formData.phone.replace(/\D/g, ""), // Apenas números
        birthDate: formData.birthDate + "T00:00:00",
        isBaptized: formData.isBaptized,
        baptizedDate:
          formData.isBaptized && formData.baptizedDate
            ? formData.baptizedDate + "T00:00:00"
            : "2023-10-14T00:00:00",
        isTither: formData.isTither,
        roleMember: 0,
        maritalStatus: formData.maritalStatus || "Solteiro",
        memberSince: formData.memberSince
          ? formData.memberSince + "T00:00:00"
          : "2020-01-01T00:00:00",
        ministry: formData.ministry || "Louvor",
        isActive: formData.isActive,
        notes: formData.notes || "Participa do grupo de jovens",
      };

      const result = await createMember(memberData);

      setSuccess("Membro cadastrado com sucesso!");

      if (onMemberCreated) {
        onMemberCreated(result);
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
      });

      setTimeout(() => {
        setIsOpen(false);
        setSuccess(null);
      }, 2000);
    } catch (error: any) {
      console.error("Erro:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Membro (Simples)
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Fellipe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="fvsouza623@gmail.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="document">Documento *</Label>
              <Input
                id="document"
                value={formData.document}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, document: e.target.value }))
                }
                placeholder="45570179836"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="19987250777"
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
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    birthDate: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maritalStatus">Estado Civil</Label>
              <Input
                id="maritalStatus"
                value={formData.maritalStatus}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    maritalStatus: e.target.value,
                  }))
                }
                placeholder="Solteiro"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="memberSince">Membro desde</Label>
              <Input
                id="memberSince"
                type="date"
                value={formData.memberSince}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    memberSince: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ministry">Ministério</Label>
              <Input
                id="ministry"
                value={formData.ministry}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, ministry: e.target.value }))
                }
                placeholder="Louvor"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isBaptized"
                checked={formData.isBaptized}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isBaptized: checked }))
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
                    setFormData((prev) => ({
                      ...prev,
                      baptizedDate: e.target.value,
                    }))
                  }
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="isTither"
                checked={formData.isTither}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isTither: checked }))
                }
              />
              <Label htmlFor="isTither">Dizimista</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked }))
                }
              />
              <Label htmlFor="isActive">Ativo</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Participa do grupo de jovens"
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
