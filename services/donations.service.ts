import { authFetch } from "@/lib/auth-fetch";

export interface PaidDonation {
  donationId: number;
  amount: number;
  date: string;
  status: string;
}

export interface PaidDonationsResponse {
  items: PaidDonation[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface DonationsFilters {
  description?: string;
  value?: number;
  date?: string;
  page?: number;
  pageSize?: number;
}

class DonationsService {
  // Remover /api da baseUrl se já estiver incluído
  private baseUrl = (
    process.env.NEXT_PUBLIC_API_URL || "https://demoapp.top1soft.com.br"
  ).replace(/\/api$/, "");

  async getPaidDonations(
    filters: DonationsFilters = {}
  ): Promise<PaidDonationsResponse> {
    const params = new URLSearchParams();

    if (filters.description) params.append("Description", filters.description);
    if (filters.value) params.append("Value", filters.value.toString());
    if (filters.date) params.append("Date", filters.date);
    if (filters.page) params.append("Page", filters.page.toString());
    if (filters.pageSize)
      params.append("PageSize", filters.pageSize.toString());

    const endpoint = "/api/Donation/paid";
    const url = `${this.baseUrl}${endpoint}${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    try {
      const response = await authFetch(url);

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return data;
    } catch (error) {
      console.error("❌ [DonationsService] Erro ao buscar ofertas:", error);
      throw error;
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  }

  getStatusBadgeColor(status: string): string {
    switch (status?.toLowerCase()) {
      case "completed":
      case "received":
        return "bg-green-100 text-green-800";
      case "pending":
      case "pendente":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
      case "cancelado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  getStatusLabel(status: string): string {
    switch (status?.toLowerCase()) {
      case "completed":
      case "received":
        return "Pago";
      case "pending":
        return "Pendente";
      case "cancelled":
        return "Cancelada";
      default:
        return status;
    }
  }

  getPaymentMethodIcon(method: string): string {
    switch (method?.toLowerCase()) {
      case "credit_card":
      case "cartao":
        return "💳";
      case "pix":
        return "📱";
      case "boleto":
        return "📄";
      default:
        return "💰";
    }
  }
}

export const donationsService = new DonationsService();
