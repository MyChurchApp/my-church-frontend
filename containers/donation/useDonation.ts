"use client";

import { useState } from "react";
import {
  donationService,
  type DonationRequest,
  type DonationResponse,
} from "@/services/donation/donation.service";

export type DonationFormData = {
  value: string;
  description: string;
  billingType: "CREDIT_CARD" | "PIX";
  creditCard: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    phone: string;
  };
};

export function useDonation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<DonationResponse | null>(null);

  const initialFormData: DonationFormData = {
    value: "",
    description: "",
    billingType: "PIX",
    creditCard: {
      holderName: "",
      number: "",
      expiryMonth: "",
      expiryYear: "",
      ccv: "",
    },
    creditCardHolderInfo: {
      name: "",
      email: "",
      cpfCnpj: "",
      postalCode: "",
      addressNumber: "",
      phone: "",
    },
  };

  const [formData, setFormData] = useState<DonationFormData>(initialFormData);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => {
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        const parentValue = prev[parent as keyof DonationFormData];

        if (parentValue && typeof parentValue === "object") {
          return {
            ...prev,
            [parent]: {
              ...parentValue,
              [child]: value,
            },
          };
        }
        return prev;
      }
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    // Validações básicas
    if (!formData.value || Number.parseFloat(formData.value) <= 0) {
      errors.push("Valor da doação deve ser maior que zero");
    }

    if (!formData.description.trim()) {
      errors.push("Descrição é obrigatória");
    }

    // Validações específicas para cartão de crédito
    if (formData.billingType === "CREDIT_CARD") {
      const cardErrors = donationService.validateCreditCard(
        formData.creditCard
      );
      const holderErrors = donationService.validateCardHolderInfo(
        formData.creditCardHolderInfo
      );

      errors.push(...cardErrors, ...holderErrors);
    }

    return errors;
  };

  const submitDonation = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validar formulário
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        setError(validationErrors.join(", "));
        return false;
      }

      // Preparar dados para envio
      const donationRequest: DonationRequest = {
        value: Number.parseFloat(formData.value),
        description: formData.description,
        billingType: formData.billingType,
        dueDate: new Date().toISOString(),
      };

      // Adicionar dados do cartão se necessário
      if (formData.billingType === "CREDIT_CARD") {
        donationRequest.creditCard = {
          ...formData.creditCard,
          number: formData.creditCard.number.replace(/\s/g, ""), // Remover espaços
        };
        donationRequest.creditCardHolderInfo = formData.creditCardHolderInfo;
      }

      // Enviar doação
      const response = await donationService.createDonation(donationRequest);
      setSuccess(response);

      // Limpar formulário em caso de sucesso
      setFormData(initialFormData);

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao processar doação";
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setError(null);
    setSuccess(null);
  };

  const clearError = () => {
    setError(null);
  };

  const clearSuccess = () => {
    setSuccess(null);
  };

  return {
    formData,
    updateFormData,
    isLoading,
    error,
    success,
    submitDonation,
    resetForm,
    clearError,
    clearSuccess,
    validateForm,
  };
}
