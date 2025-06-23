export enum BirthdayFilterType {
  Day = 0,
  Week = 1,
  Month = 2,
}

// Interface para membro aniversariante (baseada na API)
export interface ApiBirthdayMember {
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

// Interface para membro aniversariante processado (para uso no frontend)
export interface BirthdayMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo: string | null;
  birthDate: string;
  ageWillTurn: number;
  birthdayThisYear: Date;
  daysUntilBirthday: number;
  isToday: boolean;
  birthdayMessage: string;
}

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
