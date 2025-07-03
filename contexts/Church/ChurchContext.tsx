"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { getChurchData, type Church } from "@/services/church.service";
import { getUser, isAuthenticated } from "@/lib/auth-utils";
import { BankingInfoModal } from "@/components/church/BankingInfoModal";

interface ChurchContextType {
  churchData: Church | null;
  isLoading: boolean;
  refetchChurchData: () => Promise<void>;
}

const ChurchContext = createContext<ChurchContextType | undefined>(undefined);

export function ChurchProvider({ children }: { children: ReactNode }) {
  const [churchData, setChurchData] = useState<Church | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBankingModalOpen, setIsBankingModalOpen] = useState(false);

  const user = getUser();
  const authToken =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  const modalKey = user ? `bankingModalClosed_${user.id}` : null;
  const isAdmin = user?.role === "Admin";

  const BANKING_REQUIRED_FIELDS_1 = [
    "bankName",
    "agency",
    "account",
    "accountDigit",
    "holderDocument",
    "holderName",
  ] as const;
  const BANKING_REQUIRED_FIELDS_2 = ["pixKey", "pixKeyType"] as const;

  function hasMissingFields(obj: any, fields: readonly string[]) {
    if (!obj) return true;
    return fields.some(
      (field) => !obj[field] || obj[field].toString().trim() === ""
    );
  }

  function isBankingInfoIncomplete(churchData: any) {
    const info = churchData?.bankingInfo;
    if (!info) return true;
    const hasPix = !hasMissingFields(info, BANKING_REQUIRED_FIELDS_2);
    const hasBank = !hasMissingFields(info, BANKING_REQUIRED_FIELDS_1);
    return !(hasPix || hasBank);
  }

  function hasClosedModal(authToken: string | null) {
    if (!modalKey || !authToken) return false;
    const raw = localStorage.getItem(modalKey);
    if (!raw) return false;
    try {
      const { closedAt, token } = JSON.parse(raw);
      if (token !== authToken) return false;
      if (Date.now() - closedAt > 4 * 60 * 60 * 1000) return false; // 4h
      return true;
    } catch {
      return false;
    }
  }

  function markModalClosed(authToken: string | null) {
    if (modalKey && authToken) {
      localStorage.setItem(
        modalKey,
        JSON.stringify({
          closedAt: Date.now(),
          token: authToken,
        })
      );
    }
  }

  const fetchAndCheckChurchData = useCallback(async () => {
    if (!isAuthenticated()) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getChurchData();
      setChurchData(data);

      if (
        isAdmin &&
        !hasClosedModal(authToken) &&
        isBankingInfoIncomplete(data)
      ) {
        setIsBankingModalOpen(true);
      }
    } catch (error) {
      console.error("Erro no ChurchContext:", error);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line
  }, [isAdmin, modalKey, authToken]);

  useEffect(() => {
    fetchAndCheckChurchData();
    // eslint-disable-next-line
  }, []);

  const closeModalAndRefetch = async () => {
    setIsBankingModalOpen(false);
    markModalClosed(authToken);
    await fetchAndCheckChurchData();
  };

  const value = {
    churchData,
    isLoading,
    refetchChurchData: fetchAndCheckChurchData,
  };

  return (
    <ChurchContext.Provider value={value}>
      {children}
      <BankingInfoModal
        isOpen={isBankingModalOpen}
        onClose={closeModalAndRefetch}
      />
    </ChurchContext.Provider>
  );
}

export function useChurch() {
  const context = useContext(ChurchContext);
  if (context === undefined) {
    throw new Error("useChurch deve ser usado dentro de um ChurchProvider");
  }
  return context;
}
