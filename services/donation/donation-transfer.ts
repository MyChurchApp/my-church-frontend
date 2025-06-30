import { authFetch } from "@/lib/auth-fetch";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://demoapp.top1soft.com.br";

export interface TransferRequest {
  notes: string;
}

export interface TransferResponse {
  success: boolean;
  message?: string;
}

export class DonationTransferService {
  private static cleanBaseUrl(url: string): string {
    return url.replace(/\/api$/, "");
  }

  static async getTransferBalance(): Promise<number> {
    const cleanUrl = this.cleanBaseUrl(BASE_URL);
    const url = `${cleanUrl}/api/Donation/transfer-balance`;

    try {
      const response = await authFetch(url, {
        method: "GET",
        headers: {
          Accept: "*/*",
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      // A API retorna o valor direto (ex: 564.33)
      const balance = await response.json();

      // Garantir que é um número
      const numericBalance =
        typeof balance === "number" ? balance : Number.parseFloat(balance) || 0;

      return numericBalance;
    } catch (error) {
      console.error(
        "[DonationTransferService] Erro ao consultar saldo:",
        error
      );
      throw error;
    }
  }

  /**
   * Efetuar transferência
   */
  static async transfer(request: TransferRequest): Promise<TransferResponse> {
    const cleanUrl = this.cleanBaseUrl(BASE_URL);
    const url = `${cleanUrl}/api/Donation/transfer`;

    try {
      const response = await authFetch(url, {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return { success: true, ...data };
    } catch (error) {
      console.error(
        "[DonationTransferService] Erro ao efetuar transferência:",
        error
      );
      throw error;
    }
  }
}
