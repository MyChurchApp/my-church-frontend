// Configurações da API
export const API_CONFIG = {
  BASE_URL: "https://demoapp.top1soft.com.br/api",
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/Auth/login",
    },
    MEMBERS: {
      BASE: "/Member",
      BY_ID: (id: string) => `/Member/${id}`,
    },
    FEED: {
      BASE: "/Feed",
      BY_ID: (id: string) => `/Feed/${id}`,
    },
  },
  HEADERS: {
    CONTENT_TYPE: "application/json",
    ACCEPT: "*/*",
  },
} as const
