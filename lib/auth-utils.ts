// ========================================================================
//          ARQUIVO COMPLETO: /lib/auth-utils.ts
//          Copie e cole todo este conteúdo no seu arquivo.
// ========================================================================

/**
 * Obtém o token de autenticação do localStorage.
 * @returns O token como string, ou null se não encontrado.
 */
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("authToken");
};

/**
 * VERIFICA SE O USUÁRIO ESTÁ AUTENTICADO.
 * Retorna true se um token existir.
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

/**
 * FUNÇÃO PRINCIPAL PARA OBTER O USUÁRIO.
 * Busca e decodifica os dados do usuário a partir do localStorage.
 * Esta é a única função que deve ser usada para obter o objeto do usuário.
 * @returns O objeto completo do usuário, ou null se não encontrado ou houver erro.
 */
export const getUser = (): any | null => {
  if (typeof window === "undefined") return null;

  try {
    const userString = localStorage.getItem("user");
    if (userString) {
      // Retorna o objeto do usuário completo parseado do localStorage
      return JSON.parse(userString);
    }
    return null;
  } catch (error) {
    console.error(
      "Erro ao decodificar dados do usuário do localStorage:",
      error
    );
    // Em caso de erro (ex: JSON inválido), limpa a sessão para evitar problemas.
    logout();
    return null;
  }
};

/**
 * Obtém as informações da igreja do localStorage.
 * @returns O objeto com dados da igreja ou um objeto padrão.
 */
export const getChurchInfo = (): any => {
  if (typeof window === "undefined") return null;

  const churchDataString = localStorage.getItem("churchData");
  if (churchDataString) {
    try {
      return JSON.parse(churchDataString);
    } catch (error) {
      console.error("Erro ao decodificar dados da igreja:", error);
    }
  }

  // Retorna um objeto padrão caso nada seja encontrado
  return {
    id: "1",
    name: "MyChurch",
    logo: "/mychurch-logo.png",
  };
};

/**
 * Hierarquia de papéis para verificação de permissões.
 * Níveis mais altos têm permissão sobre níveis mais baixos.
 */
const ROLE_HIERARCHY: { [key: string]: number } = {
  Admin: 4,
  Pastor: 3,
  Leader: 2,
  Member: 1,
};

/**
 * Verifica se um usuário tem a permissão necessária.
 * @param userRole O papel/função do usuário atual (ex: 'Admin', 'Leader').
 * @param requiredRole O papel/função mínimo necessário para acessar o recurso.
 * @returns True se o usuário tiver permissão, false caso contrário.
 */
export const hasPermission = (
  userRole: string,
  requiredRole: string
): boolean => {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;

  if (!userLevel || !requiredLevel) {
    // Se algum dos papéis não for reconhecido, nega o acesso por segurança.
    return false;
  }

  return userLevel >= requiredLevel;
};

/**

 * FAZ LOGOUT DO USUÁRIO.
 * Remove todos os dados de sessão do localStorage e redireciona para a página de login.
 */
export const logout = () => {
  if (typeof window !== "undefined") {
    // Limpa todas as chaves relacionadas à sessão do usuário
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");

    // Limpa também outras chaves que possam existir
    localStorage.removeItem("userRole"); // Chave antiga, remover por segurança
    localStorage.removeItem("churchData");

    // Redireciona para a tela de login
    window.location.href = "/login";
  }
};
