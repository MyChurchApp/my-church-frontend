import { BirthdayFilterType, BirthdayMember } from "../members.service";
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://demoapp.top1soft.com.br/api";

export class MembersBirthday {
  private static buildHeaders(token: string) {
    return {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    } as const;
  }

  private static async request(url: string) {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) throw new Error("Token de autenticação não encontrado");

    const res = await fetch(url, {
      headers: MembersBirthday.buildHeaders(token),
    });

    if (res.status === 403) {
      const error = new Error("Forbidden");
      (error as any).status = 403;
      throw error;
    }
    if (res.status === 404) {
      const error = new Error("Not Found");
      (error as any).status = 404;
      throw error;
    }
    if (!res.ok) {
      const error = new Error(`Erro: ${res.status}`);
      (error as any).status = res.status;
      throw error;
    }

    return res.json();
  }

  static async getBirthdays(
    filter: BirthdayFilterType
  ): Promise<BirthdayMember[]> {
    const url = `${BASE_URL}/Member/birthdays?filterType=${filter}`;
    return (await MembersBirthday.request(url)) as BirthdayMember[];
  }

  static async getWeeklyBirthdays(): Promise<BirthdayMember[]> {
    return MembersBirthday.getBirthdays(BirthdayFilterType.Week);
  }
}
