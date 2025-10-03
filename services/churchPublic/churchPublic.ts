import { authFetchJson } from "@/lib/auth-fetch";

export interface ChurchSearchParams {
	search?: string;
	city?: string;
	state?: string;
	hasServiceToday?: boolean;
	userLatitude?: number;
	userLongitude?: number;
	radiusKm?: number;
	page?: number;
	pageSize?: number;
}

export interface ChurchItem {
	id: number;
	name: string;
	description: string | null;
	logo: string | null;
	city: string | null;
	state: string | null;
	hasServiceToday: boolean;
	nextServiceStartTime: string | null;
	latitude: number | null;
	longitude: number | null;
	distanceKm: number | null;
}

export interface PagedResponse<T> {
	items: T[];
	pageNumber: number;
	pageSize: number;
	totalCount: number;
	totalPages: number;
}

const BASE_URL =
	process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://demoapp.top1soft.com.br";
const PUBLIC_ENDPOINT = `${BASE_URL}/api/Church/public/search`;

// Habilite o proxy no client definindo NEXT_PUBLIC_CHURCH_SEARCH_PROXY=1
const USE_PROXY =
	typeof window !== "undefined" &&
	process.env.NEXT_PUBLIC_CHURCH_SEARCH_PROXY === "1";

function add(qs: URLSearchParams, k: string, v: unknown) {
	if (v === undefined || v === null || v === "") return;
	qs.append(k, String(v));
}

/** Busca pública (com proxy opcional) */
export async function searchChurches(
	params: ChurchSearchParams = {},
	opts?: { signal?: AbortSignal },
): Promise<PagedResponse<ChurchItem>> {
	const qs = new URLSearchParams();
	add(qs, "Search", params.search);
	add(qs, "City", params.city);
	add(qs, "State", params.state);
	add(qs, "HasServiceToday", params.hasServiceToday);
	add(qs, "UserLatitude", params.userLatitude);
	add(qs, "UserLongitude", params.userLongitude);
	add(qs, "RadiusKm", params.radiusKm);
	add(qs, "Page", params.page);
	add(qs, "PageSize", params.pageSize);

	const url = USE_PROXY
		? `/api/church/search?${qs.toString()}`
		: `${PUBLIC_ENDPOINT}?${qs.toString()}`;

	const data = await authFetchJson(url, {
		method: "GET",
		// Backend pode retornar JSON com content-type text/plain
		headers: { Accept: "text/plain" },
		skipAuth: true,
		skipAutoLogout: true,
		signal: opts?.signal,
	});

	return data as PagedResponse<ChurchItem>;
}

/** "Detalhe" público via search (não há endpoint dedicado) */
export async function getChurchPublicById(
	id: number,
	opts?: { signal?: AbortSignal },
): Promise<ChurchItem | null> {
	const res = await searchChurches(
		{ search: String(id), page: 1, pageSize: 8 },
		{ signal: opts?.signal },
	);
	return res.items.find((i) => i.id === id) ?? null;
}
