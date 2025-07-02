import { authFetch, authFetchJson } from "@/lib/auth-fetch";

// URL base da sua API.
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://demoapp.top1soft.com.br/api";

// --- ENUMS E TIPOS AUXILIARES ---
export enum EventType {
  General = 0,
  WorshipService = 1,
  Meeting = 2,
}

// ENUM CORRIGIDO AQUI
export enum RecurrenceType {
  None = 0, // Não recorrente
  Daily = 1, // Diário
  Weekly = 2, // Semanal
  Monthly = 3, // Mensal
  Yearly = 4, // Anual
}

// --- INTERFACES COMPLETAS BASEADAS NO SWAGGER ---
export interface Address {
  id: number;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  neighborhood: string;
}
export interface Plan {
  id: number;
  name: string;
  price: number;
  maxMembers: number;
  maxEvents: number;
  maxStorageGB: number;
}
export interface Payment {
  id: number;
  subscriptionId: number;
  subscription: string;
  amount: number;
  date: string;
  paymentStatus: string;
  transactionId: string;
}
export interface Subscription {
  id: number;
  churchId: number;
  church: string;
  planId: number;
  plan: Plan;
  startDate: string;
  endDate: string;
  isActive: boolean;
  payments: Payment[];
}
export interface BankingInfo {
  id: number;
  bankName: string;
  bankDigit: string;
  agency: string;
  account: string;
  accountType: string;
  holderName: string;
  holderDocument: string;
  pixKey: string;
  pixKeyType: string;
}
export interface Church {
  id: number;
  name: string;
  logo: string;
  address: Address;
  phone: string;
  description: string;
  members: string[];
  subscription: Subscription;
  bankingInfo: BankingInfo;
  onboardingQrCode: string;
}
export interface Document {
  id: number;
  memberId: number;
  type: number;
  number: string;
}
export interface Participant {
  id: number;
  name: string;
  document: Document[];
  email: string;
  phone: string;
  photo: string;
  birthDate: string;
  isBaptized: boolean;
  baptizedDate: string;
  isTither: boolean;
  churchId: number;
  church: Church;
  role: number;
  created: string;
  updated: string;
  maritalStatus: string;
  memberSince: string;
  ministry: string;
  isActive: boolean;
  notes: string;
  address: Address;
}
export interface Recurrence {
  id: number;
  eventId: number;
  recurrenceType: number;
  frequency: number;
  recurrenceEndDate: string;
}
export interface Notification {
  id: number;
  eventId: number;
  sentAt: string;
  message: string;
}
export interface EventCreateRequest {
  title: string;
  description: string;
  date: string;
  finishDate: string;
  location: string;
  requiresParticipantList: boolean;
  recurrenceType?: number;
  frequency?: number;
  eventType: EventType;
  worshipTheme?: string;
}
export interface EventUpdateRequest {
  title: string;
  description: string;
  date: string;
  finishDate: string;
  location: string;
  requiresParticipantList: boolean;
  recurrenceType: number;
  frequency: number;
  eventType: EventType;
  worshipTheme: string;
}
export interface EventResponse {
  id: number;
  title: string;
  description: string;
  date: string;
  finishDate: string;
  location: string;
  churchId: number;
  church: Church;
  requiresParticipantList: boolean;
  participants: Participant[];
  recurrence: Recurrence;
  notifications: Notification[];
}
export interface CalendarEventResponse {
  id: number;
  title: string;
  description: string;
  location: string;
  churchId: number;
  isRecurring: boolean;
  recurrenceType: number;
  frequency: number;
  occurrences: { start: string; end: string }[];
}
export interface WorshipEventFilters {
  Title?: string;
  Theme?: string;
  StartTime?: string;
  EndTime?: string;
  OnlyPast?: boolean;
  Status?: number;
  Page?: number;
  PageSize?: number;
}
export interface WorshipServiceActivityBible {
  id: number;
  bibleVersionId: number;
  bookId: number;
  chapterId: number;
  verseStart: number;
  verseEnd: number;
}
export interface WorshipServiceActivityHymn {
  id: number;
  hymnId: number;
  hymnTitle: string;
  hymnNumber: string;
}
export interface WorshipServiceActivity {
  id: number;
  name: string;
  content: string;
  order: number;
  isCurrent: boolean;
  bibles: WorshipServiceActivityBible[];
  hymns: WorshipServiceActivityHymn[];
}
export interface WorshipServiceSchedule {
  id: number;
  worshipServiceId: number;
  name: string;
  order: number;
}
export interface WorshipServiceListItem {
  id: number;
  churchId: number;
  eventId: number;
  title: string;
  theme: string;
  startTime: string;
  endTime: string;
  description: string;
  status: number;
  activities: WorshipServiceActivity[];
  schedule: WorshipServiceSchedule[];
  presencesCount: number;
}
export interface PaginatedWorshipServiceListResponse {
  items: WorshipServiceListItem[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
export interface WorshipServiceResponse {
  id: number;
  churchId: number;
  eventId: number;
  title: string;
  theme: string;
  startTime: string;
  endTime: string;
  description: string;
  status: number;
  activities: WorshipServiceActivity[];
  schedule: WorshipServiceSchedule[];
  presencesCount: number;
}

// --- CLASSE DE SERVIÇO ---
class EventsService {
  async createEvent(eventData: EventCreateRequest): Promise<any> {
    const response = await authFetchJson(`${API_BASE_URL}/Event`, {
      method: "POST",
      body: JSON.stringify(eventData),
    });
    return response;
  }

  async getEventById(id: number): Promise<EventResponse> {
    const response = await authFetchJson(`${API_BASE_URL}/Event/${id}`);
    return response as EventResponse;
  }

  async updateEvent(
    id: number,
    eventData: EventUpdateRequest
  ): Promise<EventResponse> {
    const response = await authFetchJson(`${API_BASE_URL}/Event/${id}`, {
      method: "PUT",
      body: JSON.stringify(eventData),
    });
    return response as EventResponse;
  }

  async deleteEvent(id: number): Promise<void> {
    await authFetch(`${API_BASE_URL}/Event/${id}`, { method: "DELETE" });
  }

  async getCalendarEvents(
    year: number,
    month: number
  ): Promise<CalendarEventResponse[]> {
    const params = new URLSearchParams({
      Year: year.toString(),
      Month: month.toString(),
    });
    const response = await authFetchJson(
      `${API_BASE_URL}/Event/calendar?${params}`
    );
    return response as CalendarEventResponse[];
  }

  async getWorshipEvents(
    filters: WorshipEventFilters = {}
  ): Promise<PaginatedWorshipServiceListResponse> {
    const definedFilters = Object.fromEntries(
      Object.entries(filters).filter(
        ([, value]) => value !== undefined && value !== null
      )
    );
    const params = new URLSearchParams(
      definedFilters as Record<string, string>
    );
    const response = await authFetchJson(
      `${API_BASE_URL}/Event/worship?${params}`
    );
    return response as PaginatedWorshipServiceListResponse;
  }

  async getWorshipById(id: number): Promise<WorshipServiceResponse> {
    const response = await authFetchJson(`${API_BASE_URL}/Event/worship/${id}`);
    return response as WorshipServiceResponse;
  }
}

export const eventsService = new EventsService();
