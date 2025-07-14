"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createAsset,
  updateAsset,
  convertFormDataToApi,
  convertApiDataToForm,
  assetTypeOptions,
  assetConditions,
  type Asset,
} from "@/services/ativos/assets.service";
import { motion, AnimatePresence } from "framer-motion";

// Props do componente
interface AssetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAsset: Asset | null;
  onSubmitSuccess: () => void;
}

// Definição dos passos do formulário
const steps = [
  { id: 1, name: "Informações Essenciais" },
  { id: 2, name: "Detalhes do Ativo" },
  { id: 3, name: "Manutenção e Garantia" },
  { id: 4, name: "Imagem e Observações" },
];

export function AssetFormModal({
  isOpen,
  onClose,
  editingAsset,
  onSubmitSuccess,
}: AssetFormModalProps) {
  const [formData, setFormData] = useState<Partial<Asset>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Novo estado para controlar o passo atual
  const [currentStep, setCurrentStep] = useState(1);

  // Popula o formulário ao abrir
  useEffect(() => {
    if (isOpen) {
      if (editingAsset) {
        const initialFormData = convertApiDataToForm(editingAsset);
        setFormData(initialFormData);
        setImagePreview(initialFormData.photo || null);
      } else {
        setFormData({ type: 1, condition: "bom" }); // Valores padrão
        setImagePreview(null);
      }
      setCurrentStep(1); // Sempre começa no primeiro passo
      setFormErrors({});
    }
  }, [editingAsset, isOpen]);

  const handleInputChange = (
    field: keyof Asset,
    value: string | number | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validação por passo
  const validateStep = useCallback(() => {
    const errors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!formData.name?.trim()) errors.name = "O nome é obrigatório";
      if (!formData.type) errors.type = "A categoria é obrigatória";
      if (!formData.identificationCode?.trim())
        errors.identificationCode = "O código é obrigatório";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, currentStep]);

  const nextStep = () => {
    if (validateStep()) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return; // Valida o último passo antes de enviar

    setIsSubmitting(true);
    try {
      const apiData = convertFormDataToApi(formData);
      if (editingAsset) {
        await updateAsset(editingAsset.id, apiData);
      } else {
        await createAsset(apiData);
      }
      onSubmitSuccess();
    } catch (error) {
      console.error("Erro ao salvar ativo:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Funções de upload de imagem (sem alterações)
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione apenas arquivos de imagem.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setFormData({ ...formData, photo: result });
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
  };
  const removeImage = () => {
    setFormData({ ...formData, photo: "" });
    setImagePreview(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {editingAsset ? "Editar Ativo" : "Novo Ativo"}
          </DialogTitle>
          {/* Indicador de Passos */}
          <div className="pt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">
                Passo {currentStep} de {steps.length}:{" "}
                <span className="text-gray-800">
                  {steps[currentStep - 1].name}
                </span>
              </span>
              <div className="flex space-x-1">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`w-6 h-1 rounded-full ${
                      currentStep >= step.id ? "bg-[#89f0e6]" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto space-y-6 p-1 pr-4"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Passo 1: Informações Essenciais */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">
                      Nome do Ativo <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className={formErrors.name ? "border-red-500" : ""}
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="type">
                      Categoria <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.type?.toString() || ""}
                      onValueChange={(v) =>
                        handleInputChange("type", Number(v))
                      }
                    >
                      <SelectTrigger
                        className={formErrors.type ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {assetTypeOptions.map((o) => (
                          <SelectItem key={o.value} value={o.value.toString()}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.type && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.type}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="identificationCode">
                      Código de Identificação{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="identificationCode"
                      value={formData.identificationCode || ""}
                      onChange={(e) =>
                        handleInputChange("identificationCode", e.target.value)
                      }
                      className={
                        formErrors.identificationCode ? "border-red-500" : ""
                      }
                    />
                    {formErrors.identificationCode && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.identificationCode}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="Descreva o ativo, sua função, etc."
                    />
                  </div>
                </div>
              )}

              {/* Passo 2: Detalhes do Ativo */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="value">Valor (R$)</Label>
                      <Input
                        id="value"
                        type="number"
                        step="0.01"
                        value={formData.value || ""}
                        onChange={(e) =>
                          handleInputChange("value", Number(e.target.value))
                        }
                        placeholder="0,00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="purchaseDate">Data de Compra</Label>
                      <Input
                        id="purchaseDate"
                        type="date"
                        value={formData.purchaseDate || ""}
                        onChange={(e) =>
                          handleInputChange("purchaseDate", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="condition">Condição</Label>
                      <Select
                        value={formData.condition || "bom"}
                        onValueChange={(v) => handleInputChange("condition", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {assetConditions.map((c) => (
                            <SelectItem key={c} value={c.toLowerCase()}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="location">Localização</Label>
                      <Input
                        id="location"
                        value={formData.location || ""}
                        onChange={(e) =>
                          handleInputChange("location", e.target.value)
                        }
                        placeholder="Onde está localizado..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Passo 3: Manutenção e Garantia */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="responsible">Responsável</Label>
                      <Input
                        id="responsible"
                        value={formData.responsible || ""}
                        onChange={(e) =>
                          handleInputChange("responsible", e.target.value)
                        }
                        placeholder="Nome do responsável..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="warrantyUntil">Garantia até</Label>
                      <Input
                        id="warrantyUntil"
                        type="date"
                        value={formData.warrantyUntil || ""}
                        onChange={(e) =>
                          handleInputChange("warrantyUntil", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lastMaintenance">Última Manutenção</Label>
                      <Input
                        id="lastMaintenance"
                        type="date"
                        value={formData.lastMaintenance || ""}
                        onChange={(e) =>
                          handleInputChange("lastMaintenance", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="nextMaintenance">
                        Próxima Manutenção
                      </Label>
                      <Input
                        id="nextMaintenance"
                        type="date"
                        value={formData.nextMaintenance || ""}
                        onChange={(e) =>
                          handleInputChange("nextMaintenance", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Passo 4: Imagem e Observações */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <Label>Imagem do Ativo</Label>
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragActive
                          ? "border-blue-400 bg-blue-50"
                          : "border-gray-300"
                      }`}
                    >
                      <input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      {!imagePreview ? (
                        <div>
                          <label
                            htmlFor="image-upload"
                            className="cursor-pointer font-medium text-blue-600"
                          >
                            Clique para selecionar
                          </label>
                          <span> ou arraste uma imagem aqui</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="mx-auto max-w-full h-32 object-cover rounded-md"
                          />
                          <div className="flex gap-2 justify-center">
                            <label
                              htmlFor="image-upload"
                              className="px-3 py-1 text-sm bg-gray-200 rounded cursor-pointer"
                            >
                              Trocar
                            </label>
                            <button
                              type="button"
                              onClick={removeImage}
                              className="px-3 py-1 text-sm bg-red-200 text-red-600 rounded"
                            >
                              Remover
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes || ""}
                      onChange={(e) =>
                        handleInputChange("notes", e.target.value)
                      }
                      placeholder="Informações adicionais..."
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </form>

        <DialogFooter className="pt-4 border-t">
          <div className="flex justify-between w-full">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Anterior
            </Button>

            {currentStep < steps.length && (
              <Button
                type="button"
                style={{ backgroundColor: "#89f0e6" }}
                onClick={nextStep}
                className="text-black"
              >
                Próximo
              </Button>
            )}

            {currentStep === steps.length && (
              <Button
                type="submit"
                style={{ backgroundColor: "#89f0e6" }}
                disabled={isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting
                  ? "Salvando..."
                  : editingAsset
                  ? "Salvar Alterações"
                  : "Cadastrar Ativo"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
