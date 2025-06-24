"use client";
import { useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Plus,
  UploadCloud,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { MembersEditService } from "@/services/member/MemberCounts";

const initialFormData = {
  name: "",
  email: "",
  phone: "",
  birthDate: "",
  isBaptized: false,
  baptizedDate: "",
  isTither: false,
  maritalStatus: "0",
  memberSince: "",
  ministry: "0",
  isActive: true,
  notes: "",
  photo: "",
  cpf: "",
  rg: "",
  address: {
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    neighborhood: "",
    number: "",
  },
};

export default function CreateMemberModal({
  onMemberCreated,
}: {
  onMemberCreated?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const maritalStatusOptions = useMemo(
    () => MembersEditService.getMaritalStatusOptions(),
    []
  );
  const ministryOptions = useMemo(
    () => MembersEditService.getMinistryOptions(),
    []
  );

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field])
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      handleInputChange("photo", reader.result as string);
    reader.readAsDataURL(file);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Nome é obrigatório";
    if (!formData.email.trim()) errors.email = "Email é obrigatório";
    if (!formData.cpf.trim()) errors.cpf = "CPF é obrigatório";
    if (!formData.phone.trim()) errors.phone = "Telefone é obrigatório";
    if (!formData.birthDate)
      errors.birthDate = "Data de nascimento é obrigatória";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) return;
    setLoading(true);

    try {
      // Formato conforme o Swagger
      const payload = {
        name: formData.name,
        email: formData.email,
        photo: formData.photo,
        phone: formData.phone,
        birthDate: formData.birthDate ? `${formData.birthDate}T00:00:00` : null,
        isBaptized: formData.isBaptized,
        baptizedDate:
          formData.isBaptized && formData.baptizedDate
            ? `${formData.baptizedDate}T00:00:00`
            : null,
        isTither: formData.isTither,
        roleMember: 0, // ou ajuste se tiver valor dinâmico
        maritalStatus:
          MembersEditService.getMaritalStatusOptions().find(
            (opt) => opt.value === formData.maritalStatus
          )?.label || "Solteiro",
        memberSince: formData.memberSince
          ? `${formData.memberSince}T00:00:00`
          : null,
        ministry:
          MembersEditService.getMinistryOptions().find(
            (opt) => opt.value === formData.ministry
          )?.label || "Nenhum",
        isActive: formData.isActive,
        notes: formData.notes,
        birthCity: formData.address.city || "", // ajuste se tiver campo separado
        birthState: formData.address.state || "",
        address: {
          street: formData.address.street || "",
          city: formData.address.city || "",
          state: formData.address.state || "",
          zipCode: formData.address.zipCode || "",
          country: formData.address.country || "",
          neighborhood: formData.address.neighborhood || "",
          number: formData.address.number || "",
        },
        documents: [
          ...(formData.cpf
            ? [{ type: 1, number: formData.cpf.replace(/\D/g, "") }]
            : []),
          ...(formData.rg
            ? [{ type: 2, number: formData.rg.replace(/\D/g, "") }]
            : []),
        ],
      };

      await MembersEditService.createMember(payload);
      setSuccess("Membro cadastrado com sucesso!");
      setFormData(initialFormData);
      if (onMemberCreated) onMemberCreated();
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(null);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Erro ao cadastrar membro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-[#1d5991] text-white hover:bg-[#1d5991]/90">
          <Plus className="h-4 w-4" />
          Novo Membro
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Membro</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-1 pr-6">
          {error && (
            <Alert variant="destructive" className="my-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="my-4 border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Informações Pessoais */}
            <fieldset className="space-y-4">
              <legend className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
                Informações Pessoais
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                  <p className="text-xs text-red-500 h-3">{fieldErrors.name}</p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                  <p className="text-xs text-red-500 h-3">
                    {fieldErrors.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                  <p className="text-xs text-red-500 h-3">
                    {fieldErrors.phone}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="birthDate">Data de Nascimento *</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) =>
                      handleInputChange("birthDate", e.target.value)
                    }
                  />
                  <p className="text-xs text-red-500 h-3">
                    {fieldErrors.birthDate}
                  </p>
                </div>
              </div>
            </fieldset>

            {/* Documentos */}
            <fieldset className="space-y-4">
              <legend className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
                Documentos
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => handleInputChange("cpf", e.target.value)}
                    placeholder="000.000.000-00"
                  />
                  <p className="text-xs text-red-500 h-3">{fieldErrors.cpf}</p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="rg">RG</Label>
                  <Input
                    id="rg"
                    value={formData.rg}
                    onChange={(e) => handleInputChange("rg", e.target.value)}
                    placeholder="00.000.000-0"
                  />
                </div>
              </div>
            </fieldset>

            {/* Endereço e Foto */}
            <fieldset className="space-y-4">
              <legend className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
                Endereço e Foto
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <Label htmlFor="street">Rua</Label>
                  <Input
                    id="street"
                    value={formData.address.street}
                    onChange={(e) =>
                      handleAddressChange("street", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    value={formData.address.number}
                    onChange={(e) =>
                      handleAddressChange("number", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={formData.address.neighborhood}
                    onChange={(e) =>
                      handleAddressChange("neighborhood", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.address.city}
                    onChange={(e) =>
                      handleAddressChange("city", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={formData.address.state}
                    onChange={(e) =>
                      handleAddressChange("state", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input
                    id="zipCode"
                    value={formData.address.zipCode}
                    onChange={(e) =>
                      handleAddressChange("zipCode", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="country">País</Label>
                  <Input
                    id="country"
                    value={formData.address.country}
                    onChange={(e) =>
                      handleAddressChange("country", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="space-y-1 pt-4">
                <Label>Foto</Label>
                <div className="flex items-center gap-4">
                  {formData.photo && (
                    <img
                      src={formData.photo}
                      alt="Prévia"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  )}
                  <div
                    className="flex-1 flex justify-center items-center p-6 border-2 border-dashed rounded-md cursor-pointer hover:border-blue-500"
                    onClick={() => photoInputRef.current?.click()}
                  >
                    <div className="text-center">
                      <UploadCloud className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="mt-1 text-sm text-gray-600">
                        Clique para enviar uma foto
                      </p>
                    </div>
                    <Input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </fieldset>

            {/* Igreja e Status */}
            <fieldset className="space-y-4">
              <legend className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
                Informações da Igreja e Status
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="maritalStatus">Estado Civil</Label>
                  <Select
                    value={formData.maritalStatus}
                    onValueChange={(v) => handleInputChange("maritalStatus", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {maritalStatusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="ministry">Ministério</Label>
                  <Select
                    value={formData.ministry}
                    onValueChange={(v) => handleInputChange("ministry", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ministryOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <Label htmlFor="memberSince">Membro desde</Label>
                  <Input
                    id="memberSince"
                    type="date"
                    value={formData.memberSince}
                    onChange={(e) =>
                      handleInputChange("memberSince", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="space-y-3 pt-4">
                <div className="flex items-center space-x-2">
                  <input
                    id="isBaptized"
                    type="checkbox"
                    checked={formData.isBaptized}
                    onChange={(e) =>
                      handleInputChange("isBaptized", e.target.checked)
                    }
                  />
                  <Label htmlFor="isBaptized" className="cursor-pointer">
                    É Batizado?
                  </Label>
                </div>
                {formData.isBaptized && (
                  <div className="pl-6 space-y-1">
                    <Label htmlFor="baptizedDate">Data de Batismo</Label>
                    <Input
                      id="baptizedDate"
                      type="date"
                      value={formData.baptizedDate}
                      onChange={(e) =>
                        handleInputChange("baptizedDate", e.target.value)
                      }
                    />
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <input
                    id="isTither"
                    type="checkbox"
                    checked={formData.isTither}
                    onChange={(e) =>
                      handleInputChange("isTither", e.target.checked)
                    }
                  />
                  <Label htmlFor="isTither" className="cursor-pointer">
                    É Dizimista?
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      handleInputChange("isActive", e.target.checked)
                    }
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    É Membro Ativo?
                  </Label>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={3}
                />
              </div>
            </fieldset>
          </form>
        </div>
        <DialogFooter className="pt-4 mt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="create-member-form"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#1d5991] text-white hover:bg-[#1d5991]/90"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cadastrando...
              </>
            ) : (
              "Cadastrar Membro"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
