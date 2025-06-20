// Função utilitária para fazer requisições autenticadas padronizadas
// ✅ GARANTIA TOTAL de "Bearer " (com espaço) em TODAS as requisições

import { getToken } from "./auth-utils";

interface AuthFetchOptions extends RequestInit {
  skipAuth?: boolean;
  skipAutoLogout?: boolean;
}

/**
 * Função para fazer requisições autenticadas
 * GARANTINDO formato correto: "Bearer TOKEN"
 */
export async function authFetch(
  url: string,
  options: AuthFetchOptions = {}
): Promise<Response> {
  const { skipAuth = false, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "*/*",
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };

  // Adicionar token de autenticação se não for skipAuth
  if (!skipAuth) {
    const token = getToken();
    if (!token) {
      console.error("🚨 Token não encontrado no localStorage");
      throw new Error("Token de autenticação não encontrado");
    }

    // ✅ GARANTIR formato correto: "Bearer TOKEN" (com espaço obrigatório)
    let authHeader: string;

    // Limpar o token de espaços extras
    const cleanToken = token.trim();

    // Verificar se já tem "Bearer " no início (case insensitive)
    if (cleanToken.toLowerCase().startsWith("bearer ")) {
      // Se já tem "Bearer ", usar como está
      authHeader = cleanToken;
    } else {
      // Se não tem "Bearer ", adicionar "Bearer " + espaço + token
      authHeader = `Bearer ${cleanToken}`;
    }

    headers.Authorization = authHeader;
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // O interceptor global já cuida do 401
    return response;
  } catch (error) {
    console.error("🚨 [authFetch] Erro na requisição:", error);
    throw error;
  }
}

/**
 * ✅ Fazer requisição JSON autenticada
 */
export async function authFetchJson(
  url: string,
  options: AuthFetchOptions = {}
): Promise<any> {
  try {
    const response = await authFetch(url, options);

    if (response.status === 401) {
      console.error("🚨 401 confirmado no authFetchJson");
      throw new Error("Sessão expirada. Redirecionando para login...");
    }

    if (!response.ok) {
      let errorText = "";
      try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorText = JSON.stringify(errorData);
          console.error("❌ Erro JSON:", errorData);
        } else {
          errorText = await response.text();
          console.error("❌ Erro texto:", errorText);
        }
      } catch (e) {
        errorText = "Erro desconhecido";
        console.error("❌ Erro ao processar resposta de erro:", e);
      }

      throw new Error(`Erro na API: ${response.status} - ${errorText}`);
    }

    // Se for 204 (No Content), retorna null
    if (response.status === 204) {
      return null;
    }

    // Processar resposta baseada no content-type
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("text/plain")) {
      const text = await response.text();

      try {
        const parsed = JSON.parse(text);

        return parsed;
      } catch {
        return text;
      }
    }

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();

      return data;
    }

    // Fallback para texto
    const text = await response.text();

    return text;
  } catch (error) {
    console.error("❌ Erro na requisição authFetchJson:", error);
    throw error;
  }
}

// Exportação padrão para compatibilidade
export default authFetch;
