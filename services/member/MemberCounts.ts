import { authFetchJson } from "@/lib/auth-fetch";

export type MemberCountsResponse = {
  total: number;
  totalActive: number;
  totalInactive: number;
};

export async function getMemberCounts(): Promise<MemberCountsResponse> {
  const data = await authFetchJson(
    "https://demoapp.top1soft.com.br/api/Member/counts",
    {
      headers: {
        Accept: "text/plain",
      },
    }
  );

  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      throw new Error("Resposta inválida da API");
    }
  }
  return data;
}
