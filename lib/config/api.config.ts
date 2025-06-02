// Configurações da API

export const API_CONFIG = {
  BASE_URL: "https://demoapp.top1soft.com.br/api",
  ENDPOINTS: {
    FEED: "/Feed",
    MEMBER: "/Member",
    AUTH: "/Auth",
  },
  HEADERS: {
    CONTENT_TYPE: "application/json",
    ACCEPT: "text/plain",
  },
} as const

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}
