import { authFetchJson } from "@/lib/auth-fetch";

const API_URL = "https://demoapp.top1soft.com.br";

export type HymnSummary = {
  number: number;
  title: string;
};

export type HymnVerse = {
  number: number;
  text: string;
};

export type Hymn = {
  id: number;
  title: string;
  number: number;
  language: string;
  chorus: string;
  lyricsAuthor: string;
  melodyAuthor: string;
  verses: HymnVerse[];
};

export const hymnService = {
  getSummaries(): Promise<HymnSummary[]> {
    return authFetchJson(`${API_URL}/api/Hymn/summaries`);
  },

  getHymn(hymnNumber: number): Promise<Hymn> {
    return authFetchJson(`${API_URL}/api/Hymn/${hymnNumber}`);
  },
};
