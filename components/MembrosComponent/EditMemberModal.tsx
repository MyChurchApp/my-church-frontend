"use client";
import { useState, useEffect, useRef, useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MembersEditService } from "@/services/members-edit.service";
import { Loader2, ChevronDown } from "lucide-react"; // Adicionado ChevronDown
import type { ApiMember } from "@/lib/api";

// [+] INÍCIO DO NOVO COMPONENTE CUSTOMSELECT
// ===============================================

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

  // Fecha o select se clicar fora dele
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
        <span className={selectedOption ? "text-black" : "text-gray-500"}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 opacity-50 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <ul
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
          role="listbox"
          aria-labelledby={selectId}
        >
          {options.map((option) => (
            <li
              key={option.value}
              className="relative cursor-pointer select-none py-2 pl-10 pr-4 text-gray-900 hover:bg-gray-100"
              onClick={() => handleOptionClick(option.value)}
              role="option"
              aria-selected={option.value === value}
            >
              <span
                className={`block truncate ${
                  option.value === value ? "font-medium" : "font-normal"
                }`}
              >
                {option.label}
              </span>
              {option.value === value && (
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
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

// [+] FIM DO NOVO COMPONENTE CUSTOMSELECT
// =============================================

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
    };
  });

  const modalRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!isOpen) return;
    const modalNode = modalRef.current;
    if (!modalNode) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
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

    const firstFocusableElement = modalNode.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusableElement?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalBodyOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-member-title"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="edit-member-title" className="text-xl font-bold">
            Editar Membro
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            ✕
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Pessoais */}
          <div>
            <h3 className="text-lg font-medium mb-4 border-b pb-2">
              Informações Pessoais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-1"
                >
                  Nome *
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
                  className="block text-sm font-medium mb-1"
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
                  className="block text-sm font-medium mb-1"
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
                  className="block text-sm font-medium mb-1"
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
            </div>
          </div>

          {/* Documentos */}
          <div>
            <h3 className="text-lg font-medium mb-4 border-b pb-2">
              Documentos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cpf" className="block text-sm font-medium mb-1">
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
                <label htmlFor="rg" className="block text-sm font-medium mb-1">
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
          </div>

          {/* Informações da Igreja */}
          <div>
            <h3 className="text-lg font-medium mb-4 border-b pb-2">
              Informações da Igreja
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="maritalStatus"
                  className="block text-sm font-medium mb-1"
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
                  className="block text-sm font-medium mb-1"
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
              <div>
                <label
                  htmlFor="memberSince"
                  className="block text-sm font-medium mb-1"
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
          </div>

          {/* Status e Configurações */}
          <div>
            <h3 className="text-lg font-medium mb-4 border-b pb-2">Status</h3>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
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
                    className="rounded"
                  />
                  <span className="text-sm">Batizado</span>
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
                    className="rounded"
                  />
                  <span className="text-sm">Dizimista</span>
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
                    className="rounded"
                  />
                  <span className="text-sm">Membro Ativo</span>
                </label>
              </div>

              {formData.isBaptized && (
                <div className="max-w-xs pt-2">
                  <label
                    htmlFor="baptizedDate"
                    className="block text-sm font-medium mb-1"
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
            </div>
          </div>

          {/* Observações */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium mb-1">
              Observações
            </label>
            <textarea
              id="notes"
              className="w-full p-3 border rounded-md resize-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Adicione observações sobre o membro..."
            />
          </div>

          {/* Botões */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
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
              className="flex-1 bg-[#1d5991] text-white hover:bg-[#1d5991]/90 w-full sm:w-auto"
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
        </form>
      </div>
    </div>
  );
}
