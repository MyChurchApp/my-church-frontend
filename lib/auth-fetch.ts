import { getToken } from "./auth-utils";

interface AuthFetchOptions extends RequestInit {
  skipAuth?: boolean;
  skipAutoLogout?: boolean;
}

// Função utilitária para logout centralizado
function autoLogout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  localStorage.removeItem("userRole");
  localStorage.removeItem("churchData");
  window.location.href = "/login";
}

// authFetch valida 401 e já faz logout
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

  if (!skipAuth) {
    const token = getToken();
    if (!token) {
      console.error("🚨 Token não encontrado no localStorage");
      autoLogout();
      throw new Error("Token de autenticação não encontrado");
    }

    let authHeader: string;
    const cleanToken = token.trim();
    if (cleanToken.toLowerCase().startsWith("bearer ")) {
      authHeader = cleanToken;
    } else {
      authHeader = `Bearer ${cleanToken}`;
    }

    headers.Authorization = authHeader;
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // Se 401, força logout
    if (response.status === 401 && !options.skipAutoLogout) {
      console.error("🚨 401 detectado no authFetch");
      autoLogout();
      // Pode lançar erro ou só retornar
      return response;
    }

    return response;
  } catch (error) {
    console.error("🚨 [authFetch] Erro na requisição:", error);
    autoLogout();
    throw error;
  }
}

export async function authFetchJson(
  url: string,
  options: AuthFetchOptions = {}
): Promise<any> {
  try {
    const response = await authFetch(url, options);

    if (response.status === 401 && !options.skipAutoLogout) {
      console.error("🚨 401 confirmado no authFetchJson");
      autoLogout();
      return;
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

    if (response.status === 204) {
      return null;
    }

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

    const text = await response.text();

    return text;
  } catch (error) {
    console.error("❌ Erro na requisição authFetchJson:", error);
    autoLogout();
    throw error;
  }
}

export default authFetch;
