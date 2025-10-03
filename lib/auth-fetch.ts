import { getToken } from "./auth-utils";

export interface AuthFetchOptions extends RequestInit {
	/** Ignora Authorization */
	skipAuth?: boolean;
	/** Não dispara autoLogout em erro/401 */
	skipAutoLogout?: boolean;
}

// Logout centralizado
function autoLogout() {
	try {
		localStorage.removeItem("authToken");
		localStorage.removeItem("user");
		localStorage.removeItem("userRole");
		localStorage.removeItem("churchData");
	} catch {}
	if (typeof window !== "undefined") {
		window.location.href = "/login";
	}
}

/** fetch com token quando necessário; respeita skipAuth/skipAutoLogout */
export async function authFetch(
	url: string,
	options: AuthFetchOptions = {},
): Promise<Response> {
	const { skipAuth = false, skipAutoLogout = false, ...fetchOptions } = options;

	const headers: Record<string, string> = {
		Accept: "*/*",
		...((fetchOptions.headers as Record<string, string>) || {}),
	};

	// Define Content-Type se houver body e não foi setado
	if (fetchOptions.body && !headers["Content-Type"]) {
		headers["Content-Type"] = "application/json";
	}

	if (!skipAuth) {
		const token = getToken();
		if (!token) {
			console.error("🚨 Token não encontrado no localStorage");
			if (!skipAutoLogout) autoLogout(); // só desloga quando a chamada requer auth
			throw new Error("Token de autenticação não encontrado");
		}
		const clean = token.trim();
		headers.Authorization = clean.toLowerCase().startsWith("bearer ")
			? clean
			: `Bearer ${clean}`;
	}

	try {
		const response = await fetch(url, { ...fetchOptions, headers });

		// auto-logout só em 401 de chamadas autenticadas
		if (response.status === 401 && !skipAutoLogout && !skipAuth) {
			console.error("🚨 401 detectado no authFetch");
			autoLogout();
			return response;
		}

		return response;
	} catch (error) {
		console.error("🚨 [authFetch] Erro na requisição:", error);
		if (!skipAutoLogout && !skipAuth) autoLogout(); // não desloga em públicas
		throw error;
	}
}

export async function authFetchJson(
	url: string,
	options: AuthFetchOptions = {},
): Promise<any> {
	try {
		const response = await authFetch(url, options);

		if (response.status === 401) {
			console.error("🚨 401 confirmado no authFetchJson");
			if (!options.skipAutoLogout && !options.skipAuth) autoLogout();
			return;
		}

		if (!response.ok) {
			let errorText = "";
			try {
				const ct = response.headers.get("content-type") || "";
				if (ct.includes("application/json")) {
					const errData = await response.json();
					errorText = JSON.stringify(errData);
					console.error("❌ Erro JSON:", errData);
				} else {
					errorText = await response.text();
					console.error("❌ Erro texto:", errorText);
				}
			} catch (e) {
				errorText = "Erro desconhecido";
				console.error("❌ Erro ao ler resposta de erro:", e);
			}
			throw new Error(`Erro na API: ${response.status} - ${errorText}`);
		}

		const ct = response.headers.get("content-type") || "";
		if (ct.includes("text/plain")) {
			const text = await response.text();
			try {
				return JSON.parse(text);
			} catch {
				return text;
			}
		}
		if (ct.includes("application/json")) {
			return response.json();
		}
		return response.text();
	} catch (error) {
		console.error("❌ Erro na requisição authFetchJson:", error);
		if (!options.skipAutoLogout && !options.skipAuth) autoLogout();
		throw error;
	}
}

export default authFetch;
