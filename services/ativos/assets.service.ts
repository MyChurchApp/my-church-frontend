import authFetch, { authFetchJson } from "@/lib/auth-fetch";

// A URL base da sua API.
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://demoapp.top1soft.com.br/api";
const ASSETS_ENDPOINT = `${API_BASE_URL}/Asset`;

// --- Tipos e Interfaces ---

export interface Asset {
  id: number;
  name: string;
  value: number;
  quantity: number;
  totalValue: number;
  description: string;
  photo: string | null;
  type: number;
  identificationCode: string;
  churchId: number;
  createdAt: string;
  condition: string;
  purchaseDate: string | null;
  location: string;
  responsible: string;
  lastMaintenance: string | null;
  nextMaintenance: string | null;
  warrantyUntil: string | null;
  notes: string;
}

interface PaginatedAssetsResponse {
  items: Asset[];
  totalCount: number;
  pageNumber: number;
  totalPages: number;
}

// --- Constantes e Opções ---

export const assetTypeOptions = [
  { value: 1, label: "Prédio/Imóvel" },
  { value: 2, label: "Móveis" },
  { value: 3, label: "Equipamentos" },
  { value: 4, label: "Veículos" },
  { value: 5, label: "Instrumentos Musicais" },
  { value: 6, label: "Decoração" },
  { value: 7, label: "Eletrodomésticos" },
  { value: 8, label: "Livros" },
  { value: 9, label: "Vestimentas" },
  { value: 99, label: "Outros" },
];

export const assetConditions = [
  "Excelente",
  "Bom",
  "Regular",
  "Em Manutenção",
  "Danificado",
  "Fora de Uso",
];

// --- Funções da API ---

// CORREÇÃO APLICADA AQUI
export async function getAssets(params: {
  page?: number;
  pageSize?: number;
  [key: string]: any;
}): Promise<PaginatedAssetsResponse> {
  // Filtra o objeto de parâmetros para remover chaves com valor 'undefined'
  const filteredParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);

  const query = new URLSearchParams(filteredParams).toString();
  return authFetchJson(`${ASSETS_ENDPOINT}?${query}`);
}

export async function createAsset(assetData: Partial<Asset>): Promise<Asset> {
  return authFetchJson(ASSETS_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(assetData),
  });
}

export async function updateAsset(
  id: number,
  assetData: Partial<Asset>
): Promise<Response> {
  return authFetch(`${ASSETS_ENDPOINT}/${id}`, {
    method: "PUT",
    body: JSON.stringify(assetData),
  });
}

export async function deleteAsset(id: number): Promise<Response> {
  return authFetch(`${ASSETS_ENDPOINT}/${id}`, {
    method: "DELETE",
  });
}

// --- Funções Utilitárias ---

export function convertFormDataToApi(formData: Partial<Asset>): Partial<Asset> {
  const { id, totalValue, churchId, createdAt, ...payload } = formData;

  return {
    ...payload,
    photo: payload.photo?.startsWith("data:image") ? payload.photo : null,
    purchaseDate: payload.purchaseDate || null,
    lastMaintenance: payload.lastMaintenance || null,
    nextMaintenance: payload.nextMaintenance || null,
    warrantyUntil: payload.warrantyUntil || null,
  };
}

export function convertApiDataToForm(apiData: Asset): Partial<Asset> {
  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  return {
    ...apiData,
    purchaseDate: formatDateForInput(apiData.purchaseDate),
    lastMaintenance: formatDateForInput(apiData.lastMaintenance),
    nextMaintenance: formatDateForInput(apiData.nextMaintenance),
    warrantyUntil: formatDateForInput(apiData.warrantyUntil),
  };
}

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value || 0
  );
export const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      timeZone: "UTC",
    });
  } catch {
    return "Data inválida";
  }
};
export const getConditionColor = (condition: string) => {
  const cond = condition?.toLowerCase() || "";
  if (cond === "excelente" || cond === "bom")
    return "bg-green-100 text-green-800";
  if (cond === "regular" || cond === "em manutenção")
    return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
};
