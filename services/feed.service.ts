// feed.service.ts

import { authFetch } from "@/lib/auth-fetch";

export interface FeedMember {
  id: number;
  name: string;
  document: Array<{
    id: number;
    memberId: number;
    type: number;
    number: string;
  }>;
  email: string;
  phone: string;
  photo: string | null;
  birthDate: string;
  isBaptized: boolean;
  baptizedDate: string;
  isTither: boolean;
  churchId: number;
  church: string | null;
  role: number;
  created: string;
  updated: string | null;
  maritalStatus: string | null;
  memberSince: string | null;
  ministry: string | null;
  isActive: boolean;
  notes: string | null;
}

export interface FeedItem {
  id: number;
  content: string;
  memberId: number;
  churchId: number;
  created: string;
  updated: string | null;
  member: FeedMember;
  likesCount: number;
  feedPostImages?: {
    id: number;
    feedPostId: number;
    fileName: string;
    created: string;
  }[];
}

export interface FeedResponse {
  items: FeedItem[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface PostLikeState {
  [postId: number]: {
    isLiked: boolean;
    likesCount: number;
    loading: boolean;
  };
}

// Helpers (resumido)
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://demoapp.top1soft.com.br/api";

export const getFeed = async (
  pageNumber = 1,
  pageSize = 10
): Promise<FeedResponse> => {
  const response = await authFetch(
    `${API_BASE_URL}/Feed?pageNumber=${pageNumber}&pageSize=${pageSize}`
  );
  if (!response.ok) throw new Error("Erro ao carregar feed");
  return response.json();
};

export const createFeedPost = async (
  content: string,
  imagesBase64?: string[]
): Promise<number> => {
  const images = imagesBase64 || [];
  const response = await authFetch(`${API_BASE_URL}/Feed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, images }), // <- array simples!
  });
  if (!response.ok) throw new Error("Erro ao criar post");
  return response.json();
};

export const updateFeedPost = async (
  postId: number,
  content: string
): Promise<void> => {
  const response = await authFetch(`${API_BASE_URL}/Feed/${postId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) throw new Error("Erro ao atualizar post");
};

export const deleteFeedPost = async (postId: number): Promise<void> => {
  const response = await authFetch(`${API_BASE_URL}/Feed/${postId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Erro ao deletar post");
};

// Mínimo dos outros helpers para funcionar:
export const isPostLikedByUser = (_postId: number) => false; // ajuste para produção se quiser persistir
export const toggleLikeFeedPost = async (_postId: number) => ({
  isLiked: true,
});

export const canEditOrDeletePost = (
  post: FeedItem,
  currentUserId: string
): boolean => post.memberId.toString() === currentUserId;

export const getTimeLeftForEdit = (_created: string) => ""; // se quiser, adapte

export const isRecentPost = (_created: string) => true;

export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 20) return "Agora mesmo";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 20)} min atrás`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)}h atrás`;
  return date.toLocaleDateString("pt-BR");
};
