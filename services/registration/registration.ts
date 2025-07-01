// services/createChurchWithAdmin.ts
import { authFetchJson } from "@/lib/auth-fetch";

const API_BASE_URL = "https://demoapp.top1soft.com.br/api";

export interface CreateChurchWithAdminPayload {
  name: string;
  description: string;
  phone: string;
  planId: number | null;
  billingType?: string;
  logo?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    neighborhood: string;
    number: string;
  };
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  adminPassword: string;
  adminDocuments: Array<{
    type: number;
    number: string;
  }>;
  adminPhoto?: string;
  document?: string;
  adminBirthDate?: string;
  adminIsBaptized?: boolean;
  adminBaptizedDate?: string;
  adminIsTither?: boolean;
  adminBirthCity?: string;
  adminBirthState?: string;
  ministry?: string;
  memberSince?: string;
  notes?: string;
  adminAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    neighborhood: string;
    number: string;
  };
  maritalStatus?: number;
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo?: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    phone: string;
  };
  creditCardInfoId?: number;
}

export const createChurchWithAdmin = async (
  payload: CreateChurchWithAdminPayload
): Promise<any> => {
  const url = `${API_BASE_URL}/Church/withadmin`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro na criação da igreja.");
    }
    return await response.json();
  } catch (error) {
    console.error("Erro ao criar igreja com admin:", error);
    throw error;
  }
};
