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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Plus } from "lucide-react";

interface ExactSwaggerModalProps {
  onMemberCreated?: (member: any) => void;
}

export default function ExactSwaggerModal({
  onMemberCreated,
}: ExactSwaggerModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dados EXATOS do exemplo que funciona (200)
  const [formData, setFormData] = useState({
    name: "Fellipe",
    email: "fvsouza623@gmail.com",
    document: "45570179836",
    phone: "19987250777",
    birthDate: "2023-10-14",
    baptizedDate: "2023-10-14",
    maritalStatus: "Solteiro",
    memberSince: "2020-01-01",
    ministry: "Louvor",
    notes: "Participa do grupo de jovens",
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
          errorMessage += ` - Campos: ${errors}`;
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
      // Payload EXATO do exemplo do Swagger que funciona
      const memberData = {
        name: formData.name,
        email: formData.email,
        document: formData.document,
        photo: "base64",
        phone: formData.phone,
        birthDate: formData.birthDate + "T00:00:00",
        isBaptized: true,
        baptizedDate: formData.baptizedDate + "T00:00:00",
        isTither: true,
        roleMember: 0,
        maritalStatus: formData.maritalStatus,
        memberSince: formData.memberSince + "T00:00:00",
        ministry: formData.ministry,
        isActive: true,
        notes: formData.notes,
      };

      const result = await createMember(memberData);

      setSuccess("Membro cadastrado com sucesso!");

      if (onMemberCreated) {
        onMemberCreated(result);
      }

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

  const handleTestWithExactData = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Payload EXATO do Swagger - sem modificações
      const exactSwaggerData = {
        name: "Fellipe",
        email: "fvsouza623@gmail.com",
        document: "45570179836",
        photo: "base64",
        phone: "19987250777",
        birthDate: "2023-10-14T00:00:00",
        isBaptized: true,
        baptizedDate: "2023-10-14T00:00:00",
        isTither: true,
        roleMember: 0,
        maritalStatus: "Solteiro",
        memberSince: "2020-01-01T00:00:00",
        ministry: "Louvor",
        isActive: true,
        notes: "Participa do grupo de jovens",
      };

      const result = await createMember(exactSwaggerData);

      setSuccess("Teste com dados exatos do Swagger funcionou!");

      if (onMemberCreated) {
        onMemberCreated(result);
      }
    } catch (error: any) {
      console.error("Erro com dados exatos:", error);
      setError(`Erro mesmo com dados exatos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Teste Swagger Exato
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Teste com Dados Exatos do Swagger</DialogTitle>
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

        <div className="space-y-4">
          <Button
            onClick={handleTestWithExactData}
            className="w-full"
            disabled={loading}
            variant="secondary"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              "🧪 Testar com Dados EXATOS do Swagger"
            )}
          </Button>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-4">
              Ou modifique os dados (baseados no exemplo que funciona):
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Fellipe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="fvsouza623@gmail.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="document">Documento</Label>
                  <Input
                    id="document"
                    value={formData.document}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        document: e.target.value,
                      }))
                    }
                    placeholder="45570179836"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="19987250777"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
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
                  />
                </div>

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
              </div>

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="ministry">Ministério</Label>
                <Input
                  id="ministry"
                  value={formData.ministry}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      ministry: e.target.value,
                    }))
                  }
                  placeholder="Louvor"
                />
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
                  "Cadastrar com Dados Modificados"
                )}
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Dados que serão enviados:</h4>
          <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
            {JSON.stringify(
              {
                name: formData.name,
                email: formData.email,
                document: formData.document,
                photo: "base64",
                phone: formData.phone,
                birthDate: formData.birthDate + "T00:00:00",
                isBaptized: true,
                baptizedDate: formData.baptizedDate + "T00:00:00",
                isTither: true,
                roleMember: 0,
                maritalStatus: formData.maritalStatus,
                memberSince: formData.memberSince + "T00:00:00",
                ministry: formData.ministry,
                isActive: true,
                notes: formData.notes,
              },
              null,
              2
            )}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}
