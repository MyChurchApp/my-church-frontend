import { authFetch } from "@/lib/auth-fetch";

// Interface para dados da igreja
export interface Church {
  id: number;
  name: string;
  logo: string | null;
  address: {
    id: number;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    neighborhood: string;
  };
  phone: string;
  description: string;
  pastor?: string;
  email?: string;
  subscription?: {
    id: number;
    churchId: number;
    planId: number | null;
    isActive: boolean;
    startDate: string;
    endDate: string;
    payments: any[]; // ajuste se quiser tipar os pagamentos
    plan: {
      id: number;
      name: string;
      price: number;
      maxMembers: number;
      maxEvents: number;
      maxStorageGB: number;
    };
  };
}

export interface ChurchDashboardStats {
  totalActiveMembers: number;
  totalEvents: number;
  currentBalance: number;
  memberGrowthPercent: number;
  eventGrowthPercent: number;
  financialGrowthPercent: number;
  averageDonationTicket: number;
}

export interface VerseType {
  verseText: string;
  reference: string;
}
