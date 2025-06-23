"use client";
import { useState, useEffect, useRef, useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ChevronDown, UploadCloud, X } from "lucide-react";
import type { ApiMember } from "@/lib/api";
import { MembersEditService } from "@/services/member/MemberCounts";

interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}

function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  id,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const internalId = useId();
  const selectId = id || internalId;

  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={selectRef}>
      <button
        type="button"
        id={selectId}
        className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={selectedOption ? "text-gray-900" : "text-gray-500"}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <ul
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
          role="listbox"
          aria-labelledby={selectId}
        >
          {options.map((option) => (
            <li
              key={option.value}
              className="relative cursor-pointer select-none py-2 pl-10 pr-4 text-gray-900 transition-colors hover:bg-gray-100"
              onClick={() => handleOptionClick(option.value)}
              role="option"
              aria-selected={option.value === value}
            >
              <span
                className={`block truncate ${
                  option.value === value ? "font-semibold" : "font-normal"
                }`}
              >
                {option.label}
              </span>
              {option.value === value && (
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface EditMemberModalProps {
  member: ApiMember;
  isOpen: boolean;
  onClose: () => void;
  onMemberUpdated: () => void;
}

export default function EditMemberModal({
  member,
  isOpen,
  onClose,
  onMemberUpdated,
}: EditMemberModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState(() => {
    const converted = MembersEditService.convertApiDataToForm(member);
    return {
      ...converted,
      maritalStatus: converted.maritalStatus || "0",
      ministry: converted.ministry || "0",
      address: {
        street: member.address?.street || "",
        city: member.address?.city || "",
        state: member.address?.state || "",
        zipCode: member.address?.zipCode || "",
        country: member.address?.country || "",
        neighborhood: member.address?.neighborhood || "",
        number: member.address?.number || "",
      },
      photo: member.photo || "",
    };
  });

  const modalRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const maritalStatusOptions = MembersEditService.getMaritalStatusOptions();
  const ministryOptions = MembersEditService.getMinistryOptions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const apiData = MembersEditService.convertFormDataToApi(
        formData,
        member.document
      );
      await MembersEditService.updateMember(member.id, apiData);
      onMemberUpdated();
    } catch (error: any) {
      setError(error.message || "Erro ao atualizar membro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...(prev.address || {}), [field]: value },
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      handleInputChange("photo", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!isOpen) return;
    const modalNode = modalRef.current;
    if (!modalNode) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const focusableElements = modalNode.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    const originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    modalNode
      .querySelector<HTMLElement>("input, button, select, textarea")
      ?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalBodyOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-member-title"
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2
            id="edit-member-title"
            className="text-xl font-semibold text-gray-800"
          >
            Editar Membro
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Fechar modal"
            className="rounded-full h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <fieldset>
              <legend className="text-lg font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-2">
                Informações Pessoais
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-1 text-gray-600"
                  >
                    Nome Completo *
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-1 text-gray-600"
                  >
                    Email *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium mb-1 text-gray-600"
                  >
                    Telefone
                  </label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <label
                    htmlFor="birthDate"
                    className="block text-sm font-medium mb-1 text-gray-600"
                  >
                    Data de Nascimento
                  </label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) =>
                      handleInputChange("birthDate", e.target.value)
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Foto
                  </label>
                  <div className="flex items-center gap-4">
                    {formData.photo && (
                      <img
                        src={formData.photo}
                        alt="Prévia"
                        className="h-20 w-20 rounded-full object-cover"
                      />
                    )}
                    <div
                      className="flex-1 flex justify-center items-center px-6 py-4 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-blue-500 transition-colors"
                      onClick={() => photoInputRef.current?.click()}
                    >
                      <div className="text-center">
                        <UploadCloud className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-1 text-sm text-gray-600">
                          <span className="font-semibold text-blue-600">
                            Clique para enviar
                          </span>{" "}
                          ou arraste e solte
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF até 10MB
                        </p>
                      </div>
                      <Input
                        ref={photoInputRef}
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-lg font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-2">
                Documentos
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label
                    htmlFor="cpf"
                    className="block text-sm font-medium mb-1 text-gray-600"
                  >
                    CPF
                  </label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => handleInputChange("cpf", e.target.value)}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <label
                    htmlFor="rg"
                    className="block text-sm font-medium mb-1 text-gray-600"
                  >
                    RG
                  </label>
                  <Input
                    id="rg"
                    value={formData.rg}
                    onChange={(e) => handleInputChange("rg", e.target.value)}
                    placeholder="00.000.000-0"
                  />
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-lg font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-2">
                Endereço
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="md:col-span-2">
                  <label
                    htmlFor="street"
                    className="block text-sm font-medium mb-1 text-gray-600"
                  >
                    Rua
                  </label>
                  <Input
                    id="street"
                    value={formData.address?.street || ""}
                    onChange={(e) =>
                      handleAddressChange("street", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="number"
                    className="block text-sm font-medium mb-1 text-gray-600"
                  >
                    Número
                  </label>
                  <Input
                    id="number"
                    value={formData.address?.number || ""}
                    onChange={(e) =>
                      handleAddressChange("number", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="neighborhood"
                    className="block text-sm font-medium mb-1 text-gray-600"
                  >
                    Bairro
                  </label>
                  <Input
                    id="neighborhood"
                    value={formData.address?.neighborhood || ""}
                    onChange={(e) =>
                      handleAddressChange("neighborhood", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium mb-1 text-gray-600"
                  >
                    Cidade
                  </label>
                  <Input
                    id="city"
                    value={formData.address?.city || ""}
                    onChange={(e) =>
                      handleAddressChange("city", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium mb-1 text-gray-600"
                  >
                    Estado
                  </label>
                  <Input
                    id="state"
                    value={formData.address?.state || ""}
                    onChange={(e) =>
                      handleAddressChange("state", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="zipCode"
                    className="block text-sm font-medium mb-1 text-gray-600"
                  >
                    CEP
                  </label>
                  <Input
                    id="zipCode"
                    value={formData.address?.zipCode || ""}
                    onChange={(e) =>
                      handleAddressChange("zipCode", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium mb-1 text-gray-600"
                  >
                    País
                  </label>
                  <Input
                    id="country"
                    value={formData.address?.country || ""}
                    onChange={(e) =>
                      handleAddressChange("country", e.target.value)
                    }
                  />
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-lg font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-2">
                Informações da Igreja
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label
                    htmlFor="maritalStatus"
                    className="block text-sm font-medium mb-1 text-gray-600"
                  >
                    Estado Civil
                  </label>
                  <CustomSelect
                    id="maritalStatus"
                    options={maritalStatusOptions}
                    value={formData.maritalStatus || "0"}
                    onChange={(value) =>
                      handleInputChange("maritalStatus", value)
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="ministry"
                    className="block text-sm font-medium mb-1 text-gray-600"
                  >
                    Ministério
                  </label>
                  <CustomSelect
                    id="ministry"
                    options={ministryOptions}
                    value={formData.ministry || "0"}
                    onChange={(value) => handleInputChange("ministry", value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label
                    htmlFor="memberSince"
                    className="block text-sm font-medium mb-1 text-gray-600"
                  >
                    Membro desde
                  </label>
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
            </fieldset>

            <fieldset>
              <legend className="text-lg font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-2">
                Status
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label
                  htmlFor="isBaptized"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    id="isBaptized"
                    type="checkbox"
                    checked={formData.isBaptized}
                    onChange={(e) =>
                      handleInputChange("isBaptized", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Batizado</span>
                </label>
                <label
                  htmlFor="isTither"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    id="isTither"
                    type="checkbox"
                    checked={formData.isTither}
                    onChange={(e) =>
                      handleInputChange("isTither", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Dizimista</span>
                </label>
                <label
                  htmlFor="isActive"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      handleInputChange("isActive", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Membro Ativo</span>
                </label>
              </div>
              {formData.isBaptized && (
                <div className="mt-4 pl-6 border-l-2 border-blue-200">
                  <label
                    htmlFor="baptizedDate"
                    className="block text-sm font-medium mb-1 text-gray-600"
                  >
                    Data de Batismo
                  </label>
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
            </fieldset>

            <fieldset>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Observações
              </label>
              <textarea
                id="notes"
                className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                rows={4}
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Adicione observações sobre o membro..."
              />
            </fieldset>
          </form>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            onClick={handleSubmit}
            className="w-full sm:w-auto bg-[#1d5991] text-white hover:bg-[#1d5991]/90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1d5991]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
