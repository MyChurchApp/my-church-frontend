// services/reviews/reviewsPublic.ts
import { authFetchJson } from "@/lib/auth-fetch";

export interface ReviewItem {
  id: number;
  score: number;              // 0..5
  comment?: string | null;
  userName?: string | null;
  created?: string | null;    // ISO
  title?: string | null;
}

export interface Paged<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ReviewsResponse {
  averageScore: number;
  totalReviews: number;
  reviews: Paged<ReviewItem>;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://demoapp.top1soft.com.br";

/** GET /api/Reviews?EntityId={id}&EntityType=church&Page=&PageSize= */
export async function getChurchReviews(
  churchId: number,
  page = 1,
  pageSize = 10,
  signal?: AbortSignal
): Promise<ReviewsResponse> {
  const qs = new URLSearchParams({
    EntityId: String(churchId),
    EntityType: "church",
    Page: String(page),
    PageSize: String(pageSize),
  });

  return authFetchJson(`${BASE_URL}/api/Reviews?${qs.toString()}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    skipAuth: true,
    skipAutoLogout: true,
    signal,
  }) as Promise<ReviewsResponse>;
}
