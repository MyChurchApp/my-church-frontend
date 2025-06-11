import { authFetch, authFetchJson } from "@/lib/auth-fetch";

// Funções para interagir com a API real

export interface ApiMember {
  id: number;
  name: string;
  document: Array<{
    type: number;
    number: string;
  }>; // ✅ CORRIGIDO: Estrutura simplificada
  email: string;
  phone: string;
  photo: string | null;
  birthDate: string;
  isBaptized: boolean;
  baptizedDate: string;
  isTither: boolean;
  churchId: number;
  church: {
    id: number;
    name: string;
    logo: string;
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
    members: string[];
    subscription: any;
  };
  role: number;
  created: string;
  updated: string | null;
  maritalStatus: string | null;
  memberSince: string | null;
  ministry: string | null;
  isActive: boolean;
  notes: string | null;
}

// Interface para resposta paginada de membros
export interface ApiMembersResponse {
  items: ApiMember[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ApiFeedItem {
  id: number;
  content: string;
  memberId: number;
  churchId: number;
  created: string;
  updated: string | null;
  member: ApiMember;
  likesCount: number;
}

export interface ApiFeedResponse {
  items: ApiFeedItem[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// Enum para tipos de documento
export enum DocumentType {
  CPF = 1,
  RG = 2,
  TituloEleitor = 3,
  CNH = 4,
  CertidaoNascimento = 5,
  Outros = 99,
}

// Função para obter o token do localStorage
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("authToken");
};

// Função para obter dados do usuário atual
const getCurrentUser = () => {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("authToken");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      id: payload.nameid || "1",
      name: payload.name || payload.email || "Usuário",
      email: payload.email || "",
      churchId: payload.churchId || 0,
    };
  } catch (error) {
    console.error("Erro ao decodificar token:", error);
    return null;
  }
};

// Função para tratar erros da API
const handleApiError = (status: number, errorText: string) => {
  if (status === 500) {
    // Disparar evento customizado para mostrar toast
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("api-error-500", {
          detail: {
            message:
              "Não foi possível completar a operação no momento. Tente novamente mais tarde.",
          },
        })
      );
    }
    throw new Error("Erro interno do servidor");
  } else if (status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    throw new Error("Sessão expirada. Redirecionando para login...");
  } else if (status === 400) {
    throw new Error("Dados inválidos. Verifique os campos obrigatórios.");
  } else if (status === 404) {
    throw new Error("Recurso não encontrado.");
  } else {
    throw new Error(`Erro na API: ${status} - ${errorText}`);
  }
};

// Função para converter estado civil para enum
const getMaritalStatusEnum = (maritalStatus: string): number => {
  const statusMap: { [key: string]: number } = {
    Solteiro: 0,
    Casado: 1,
    Divorciado: 2,
    Viúvo: 3,
    "União Estável": 4,
    None: 0,
    "": 0,
  };
  return statusMap[maritalStatus] ?? 0;
};

// Função para converter ministério para enum
const getMinistryEnum = (ministry: string): number => {
  const ministryMap: { [key: string]: number } = {
    Louvor: 0,
    Ensino: 1,
    Evangelismo: 2,
    Intercessão: 3,
    Diaconia: 4,
    Jovens: 5,
    Crianças: 6,
    Mulheres: 7,
    Homens: 8,
    Outros: 9,
    None: 0,
    "": 0,
  };
  return ministryMap[ministry] ?? 0;
};

// Função para preparar documentos no formato da API
const prepareDocuments = (memberData: any) => {
  const documents = [];

  // CPF (obrigatório)
  if (memberData.cpf && memberData.cpf.trim()) {
    documents.push({
      type: DocumentType.CPF,
      number: memberData.cpf.trim().replace(/\D/g, ""), // Remove formatação
    });
  }

  // RG (opcional)
  if (memberData.rg && memberData.rg.trim()) {
    documents.push({
      type: DocumentType.RG,
      number: memberData.rg.trim(),
    });
  }

  // Título de Eleitor (opcional)
  if (memberData.tituloEleitor && memberData.tituloEleitor.trim()) {
    documents.push({
      type: DocumentType.TituloEleitor,
      number: memberData.tituloEleitor.trim(),
    });
  }

  // CNH (opcional)
  if (memberData.cnh && memberData.cnh.trim()) {
    documents.push({
      type: DocumentType.CNH,
      number: memberData.cnh.trim(),
    });
  }

  // Certidão de Nascimento (opcional)
  if (memberData.certidaoNascimento && memberData.certidaoNascimento.trim()) {
    documents.push({
      type: DocumentType.CertidaoNascimento,
      number: memberData.certidaoNascimento.trim(),
    });
  }

  // Outros documentos (opcional)
  if (memberData.outrosDocumentos && memberData.outrosDocumentos.trim()) {
    documents.push({
      type: DocumentType.Outros,
      number: memberData.outrosDocumentos.trim(),
    });
  }

  return documents;
};

// Função para buscar o feed com paginação
export const getFeedFromAPI = async (
  page = 1,
  pageSize = 10
): Promise<ApiFeedResponse> => {
  try {
    const url = `https://demoapp.top1soft.com.br/api/Feed?pageNumber=${page}&pageSize=${pageSize}`;
    const response = await authFetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      handleApiError(response.status, errorText);
    }

    const data: ApiFeedResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar feed da API:", error);
    throw error;
  }
};

// Função para buscar membros da API
export const getMembersFromAPI = async (
  page = 1,
  pageSize = 10
): Promise<ApiMembersResponse> => {
  try {
    const url = `https://demoapp.top1soft.com.br/api/Member?pageNumber=${page}&pageSize=${pageSize}`;
    const response = await authFetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      handleApiError(response.status, errorText);
    }

    const data: ApiMembersResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar membros da API:", error);
    throw error;
  }
};

// Função para criar um novo membro
export const createMemberAPI = async (memberData: any): Promise<ApiMember> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error(
        "Token de autenticação não encontrado. Faça login novamente."
      );
    }

    // Validar CPF obrigatório
    if (!memberData.document || !memberData.document.trim()) {
      throw new Error("CPF é obrigatório");
    }

    console.log(
      "Dados enviados para API:",
      JSON.stringify(memberData, null, 2)
    );

    // Preparar documentos no formato correto
    const documents = prepareDocuments({
      cpf: memberData.document, // Campo principal do formulário
      rg: memberData.rg,
      tituloEleitor: memberData.tituloEleitor,
      cnh: memberData.cnh,
      certidaoNascimento: memberData.certidaoNascimento,
      outrosDocumentos: memberData.outrosDocumentos,
    });

    const apiData = {
      ...memberData,
      document: documents, // ✅ CORRIGIDO: Array de objetos
    };

    console.log("Documentos preparados:", JSON.stringify(documents, null, 2));

    const response = await fetch("https://demoapp.top1soft.com.br/api/Member", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "text/plain",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(apiData),
    });

    console.log("Status da resposta:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro da API:", response.status, errorText);
      handleApiError(response.status, errorText);
    }

    const data = await response.json();
    console.log("Resposta da API (sucesso):", data);

    // Verificar se a resposta contém os dados esperados
    if (!data || typeof data !== "object") {
      console.error("Resposta da API inválida:", data);
      throw new Error("Resposta da API inválida");
    }

    return data as ApiMember;
  } catch (error) {
    console.error("Erro detalhado ao criar membro:", error);
    throw error;
  }
};

// Função para atualizar um membro
export const updateMemberAPI = async (
  memberId: number,
  memberData: any
): Promise<ApiMember> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error(
        "Token de autenticação não encontrado. Faça login novamente."
      );
    }

    // Validar CPF obrigatório
    if (!memberData.document || !memberData.document.trim()) {
      throw new Error("CPF é obrigatório");
    }

    // Preparar documentos no formato correto
    const documents = prepareDocuments({
      cpf: memberData.document, // Campo principal do formulário
      rg: memberData.rg,
      tituloEleitor: memberData.tituloEleitor,
      cnh: memberData.cnh,
      certidaoNascimento: memberData.certidaoNascimento,
      outrosDocumentos: memberData.outrosDocumentos,
    });

    // Preparar dados com command obrigatório e conversões corretas
    const updateData = {
      command: "UpdateMember", // Campo obrigatório
      name: memberData.name || "",
      email: memberData.email || "",
      document: documents, // ✅ CORRIGIDO: Array de objetos
      phone: memberData.phone || "",
      birthDate: memberData.birthDate || "1990-01-01T00:00:00",
      isBaptized: Boolean(memberData.isBaptized),
      baptizedDate: memberData.baptizedDate || "2023-10-14T00:00:00",
      isTither: Boolean(memberData.isTither),
      maritalStatus: getMaritalStatusEnum(memberData.maritalStatus || ""), // Converter para número
      memberSince: memberData.memberSince || "2020-01-01T00:00:00",
      ministry: getMinistryEnum(memberData.ministry || ""), // Converter para número
      isActive: Boolean(memberData.isActive),
      notes: memberData.notes || "",
      photo: memberData.photo || "",
    };

    console.log(
      "Dados originais recebidos:",
      JSON.stringify(memberData, null, 2)
    );
    console.log("Documentos preparados:", JSON.stringify(documents, null, 2));
    console.log(
      "Dados convertidos para API:",
      JSON.stringify(updateData, null, 2)
    );

    const response = await fetch(
      `https://demoapp.top1soft.com.br/api/Member/${memberId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          accept: "text/plain",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro da API:", response.status, errorText);

      // Tentar parsear erro JSON para mostrar detalhes
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.errors) {
          const errorMessages = Object.values(errorJson.errors)
            .flat()
            .join(", ");
          throw new Error(`Erro de validação: ${errorMessages}`);
        }
      } catch (parseError) {
        // Se não conseguir parsear, usar erro padrão
      }

      handleApiError(response.status, errorText);
    }

    const data: ApiMember = await response.json();
    return data;
  } catch (error) {
    console.error("Erro detalhado ao atualizar membro:", error);
    throw error;
  }
};

// Função para deletar um membro
export const deleteMemberAPI = async (memberId: number): Promise<boolean> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error(
        "Token de autenticação não encontrado. Faça login novamente."
      );
    }

    const response = await fetch(
      `https://demoapp.top1soft.com.br/api/Member/${memberId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          accept: "text/plain",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      handleApiError(response.status, errorText);
    }

    return response.ok;
  } catch (error) {
    console.error("Erro ao deletar membro:", error);
    throw error;
  }
};

// Função para criar um post no feed
export const createFeedPost = async (content: string): Promise<ApiFeedItem> => {
  try {
    const response = await authFetchJson(
      "https://demoapp.top1soft.com.br/api/Feed",
      {
        method: "POST",
        body: JSON.stringify({ content }),
      }
    );

    console.log("Resposta da API ao criar post:", response);

    // A API retorna apenas o ID do post criado
    if (typeof response === "number") {
      const postId = response;
      console.log("Post criado com ID:", postId);

      // Buscar o feed atualizado para encontrar o post completo
      try {
        const feedData = await getFeedFromAPI(1, 20);
        const createdPost = feedData.items.find((item) => item.id === postId);

        if (createdPost) {
          return createdPost;
        } else {
          // Criar objeto temporário se não encontrar
          const currentUser = getCurrentUser();
          return {
            id: postId,
            content: content,
            memberId: Number.parseInt(currentUser?.id || "0"),
            churchId: 0,
            created: new Date().toISOString(),
            updated: null,
            member: {
              id: Number.parseInt(currentUser?.id || "0"),
              name: currentUser?.name || "Usuário",
              document: [],
              email: currentUser?.email || "",
              phone: "",
              photo: null,
              birthDate: "1990-01-01T00:00:00",
              isBaptized: false,
              baptizedDate: "1990-01-01T00:00:00",
              isTither: false,
              churchId: 0,
              church: null,
              role: 0,
              created: new Date().toISOString(),
              updated: null,
              maritalStatus: null,
              memberSince: null,
              ministry: null,
              isActive: true,
              notes: null,
            },
            likesCount: 0,
          };
        }
      } catch (feedError) {
        console.error("Erro ao buscar feed após criar post:", feedError);
        throw feedError;
      }
    }

    // Se a resposta já é um objeto completo
    if (typeof response === "object" && response.id !== undefined) {
      return response as ApiFeedItem;
    }

    throw new Error("Estrutura da resposta não reconhecida");
  } catch (error) {
    console.error("Erro detalhado ao criar post:", error);
    throw error;
  }
};

// Função para editar um post no feed
export const updateFeedPost = async (
  postId: number,
  content: string
): Promise<ApiFeedItem> => {
  try {
    const response = await authFetchJson(
      `https://demoapp.top1soft.com.br/api/Feed/${postId}`,
      {
        method: "PUT",
        body: JSON.stringify({
          content, // ✅ CORRIGIDO: Enviar apenas content conforme Swagger
        }),
      }
    );

    // A API pode retornar o post completo atualizado
    if (typeof response === "object" && response.id !== undefined) {
      return response as ApiFeedItem;
    }

    // Se a API retornar apenas sucesso, buscar o post atualizado
    const feedData = await getFeedFromAPI(1, 20);
    const updatedPost = feedData.items.find((item) => item.id === postId);

    if (updatedPost) {
      return updatedPost;
    } else {
      throw new Error("Post atualizado não encontrado no feed");
    }
  } catch (error) {
    console.error("Erro detalhado ao editar post:", error);
    throw error;
  }
};

// Função para deletar um post no feed
export const deleteFeedPost = async (postId: number): Promise<boolean> => {
  try {
    const response = await authFetch(
      `https://demoapp.top1soft.com.br/api/Feed/${postId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      handleApiError(response.status, errorText);
    }

    return true;
  } catch (error) {
    console.error("Erro detalhado ao deletar post:", error);
    throw error;
  }
};

// Função para recarregar o feed
export const refreshFeed = async (
  page = 1,
  pageSize = 10
): Promise<ApiFeedResponse> => {
  try {
    const data = await getFeedFromAPI(page, pageSize);
    return data;
  } catch (error) {
    console.error("Erro ao recarregar feed:", error);
    throw error;
  }
};

// Função melhorada para criar post com fallback
export const createFeedPostWithFallback = async (
  content: string
): Promise<ApiFeedItem> => {
  try {
    // Tentar criar o post
    const newPost = await createFeedPost(content);
    return newPost;
  } catch (error) {
    console.error("Erro ao criar post, tentando recarregar feed:", error);

    // Se der erro, tentar recarregar o feed para ver se o post foi criado
    try {
      const feedData = await refreshFeed(1, 20);
      if (feedData.items.length > 0) {
        // Procurar por um post com o mesmo conteúdo criado recentemente
        const recentPost = feedData.items.find((item) => {
          const postTime = new Date(item.created).getTime();
          const now = new Date().getTime();
          const timeDiff = now - postTime;
          // Procurar posts criados nos últimos 30 segundos com o mesmo conteúdo
          return timeDiff < 30000 && item.content === content;
        });

        if (recentPost) {
          console.log("Post foi criado com sucesso, encontrado no feed");
          return recentPost;
        }
      }
    } catch (refreshError) {
      console.error("Erro ao recarregar feed:", refreshError);
    }

    // Se ainda assim não conseguir, lançar o erro original
    throw error;
  }
};

// Função helper para converter ApiMember para o formato usado no frontend
export const convertApiMemberToLocal = (apiMember: ApiMember) => {
  if (!apiMember) {
    console.error("apiMember é undefined ou null");
    throw new Error("Dados do membro inválidos");
  }

  // Extrair documentos do array
  const documents = apiMember?.document || [];
  const cpfDocument = documents.find(
    (doc: any) => doc.type === DocumentType.CPF
  );
  const rgDocument = documents.find((doc: any) => doc.type === DocumentType.RG);
  const tituloDocument = documents.find(
    (doc: any) => doc.type === DocumentType.TituloEleitor
  );
  const cnhDocument = documents.find(
    (doc: any) => doc.type === DocumentType.CNH
  );
  const certidaoDocument = documents.find(
    (doc: any) => doc.type === DocumentType.CertidaoNascimento
  );
  const outrosDocument = documents.find(
    (doc: any) => doc.type === DocumentType.Outros
  );

  return {
    id: apiMember?.id?.toString() || Math.random().toString(36).substr(2, 9),
    name: apiMember?.name || "",
    email: apiMember?.email || "",
    phone: apiMember?.phone || "",
    cpf: cpfDocument?.number || "", // ✅ CPF extraído
    rg: rgDocument?.number || "", // ✅ RG extraído
    tituloEleitor: tituloDocument?.number || "", // ✅ Título extraído
    cnh: cnhDocument?.number || "", // ✅ CNH extraído
    certidaoNascimento: certidaoDocument?.number || "", // ✅ Certidão extraído
    outrosDocumentos: outrosDocument?.number || "", // ✅ Outros extraído
    birthDate: apiMember?.birthDate ? apiMember.birthDate.split("T")[0] : "",
    address: apiMember?.church?.address?.street || "",
    city: apiMember?.church?.address?.city || "",
    state: apiMember?.church?.address?.state || "",
    zipCode: apiMember?.church?.address?.zipCode || "",
    maritalStatus: apiMember?.maritalStatus || "",
    baptized: Boolean(apiMember?.isBaptized),
    memberSince: apiMember?.memberSince
      ? apiMember.memberSince.split("T")[0]
      : "",
    ministry: apiMember?.ministry || "",
    photo: apiMember?.photo || "/placeholder.svg?height=100&width=100",
    isActive: Boolean(apiMember?.isActive),
    notes: apiMember?.notes || "",
  };
};

// Função helper para converter dados do formulário para o formato da API
export const convertLocalMemberToApi = (localMember: any) => {
  const apiData: any = {
    name: localMember.name?.trim() || "",
    email: localMember.email?.trim() || "",
    document: localMember.document?.trim() || "",
    photo:
      localMember.photo && localMember.photo !== "base64"
        ? localMember.photo
        : "",
    phone: localMember.phone?.trim() || "",
    birthDate: localMember.birthDate
      ? `${localMember.birthDate}T00:00:00`
      : "1990-01-01T00:00:00",
    isBaptized: Boolean(localMember.isBaptized),
    baptizedDate: localMember.baptizedDate
      ? `${localMember.baptizedDate}T00:00:00`
      : "2023-10-14T00:00:00",
    isTither: Boolean(localMember.isTither),
    roleMember: 0,
    maritalStatus: localMember.maritalStatus || "",
    memberSince: localMember.memberSince
      ? `${localMember.memberSince}T00:00:00`
      : "2020-01-01T00:00:00",
    ministry: localMember.ministry || "",
    isActive:
      localMember.isActive !== undefined ? Boolean(localMember.isActive) : true,
    notes: localMember.notes || "",
  };

  return apiData;
};

// Função para verificar se o usuário está autenticado
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

// Função para fazer logout
export const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
};

// Função helper para formatar data
export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Agora mesmo";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} min atrás`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h atrás`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d atrás`;
  } else {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
};

// Função helper para verificar se o post pode ser editado/deletado
export const canEditOrDeletePost = (createdDate: string): boolean => {
  const postTime = new Date(createdDate).getTime();
  const now = new Date().getTime();
  const timeDiff = now - postTime;
  const twoHoursInMs = 2 * 60 * 60 * 1000;

  return timeDiff < twoHoursInMs;
};

// Função para obter o ID do usuário atual do token
export const getCurrentUserId = (): string | null => {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("authToken");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.nameid || payload.sub || payload.id || null;
  } catch (error) {
    console.error("Erro ao decodificar token para obter ID:", error);
    return null;
  }
};
