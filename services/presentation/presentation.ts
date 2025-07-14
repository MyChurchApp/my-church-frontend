import { authFetchJson } from "@/lib/auth-fetch";

export interface Slide {
  id: number;
  orderIndex: number;
  contentType: number;
  contentReferenceJson: string;
  cachedDisplayText: string;
  cachedMediaUrl: string;
}

export interface Presentation {
  id: number;
  churchId: number;
  adminUserId: number;
  name: string;
  description: string;
  currentSlideIndex: number;
  isLive: boolean;
  slides: Slide[];
}

const API_BASE_URL = "https://demoapp.top1soft.com.br/api";

export async function getPresentationById(
  presentationId: number
): Promise<Presentation> {
  if (!presentationId) {
    throw new Error("O ID da Apresentação é necessário.");
  }

  // A URL foi construída a partir da sua documentação
  const url = `${API_BASE_URL}/Presentation/${presentationId}`;

  try {
    // Usando o seu authFetchJson para fazer a requisição autenticada
    const presentationData = await authFetchJson(url, {
      method: "GET",
      headers: {
        Accept: "text/plain, application/json",
      },
    });

    return presentationData as Presentation;
  } catch (error) {
    console.error(
      `🚨 Erro ao buscar apresentação com ID ${presentationId}:`,
      error
    );

    throw error;
  }
}
