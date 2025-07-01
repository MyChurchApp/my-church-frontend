"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { getChurchData, type Church } from "@/services/church.service";
import { isAuthenticated } from "@/lib/auth-utils";
import { BankingInfoModal } from "@/components/church/BankingInfoModal";

// 1. Definir a "forma" do nosso contexto
interface ChurchContextType {
  churchData: Church | null;
  isLoading: boolean;
  refetchChurchData: () => Promise<void>;
}

const ChurchContext = createContext<ChurchContextType | undefined>(undefined);

// 2. Criar o Provedor (Provider)
export function ChurchProvider({ children }: { children: ReactNode }) {
  const [churchData, setChurchData] = useState<Church | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBankingModalOpen, setIsBankingModalOpen] = useState(false);
  const hasOpenedBankingModal = useRef(false); // controle de exibição do modal

  // Função para buscar os dados e verificar a condição
  const fetchAndCheckChurchData = useCallback(async () => {
    if (!isAuthenticated()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await getChurchData();
      setChurchData(data);

      // Só abre o modal se ainda não abriu nessa sessão
      if (
        !hasOpenedBankingModal.current &&
        (!data.bankingInfo || Object.keys(data.bankingInfo).length === 0)
      ) {
        setIsBankingModalOpen(true);
        hasOpenedBankingModal.current = true;
      }
    } catch (error) {
      console.error("Erro no ChurchContext:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAndCheckChurchData();
  }, [fetchAndCheckChurchData]);

  const closeModalAndRefetch = async () => {
    setIsBankingModalOpen(false);
    // Não reseta hasOpenedBankingModal
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

// 3. Criar o Hook customizado para usar o contexto
export function useChurch() {
  const context = useContext(ChurchContext);
  if (context === undefined) {
    throw new Error("useChurch deve ser usado dentro de um ChurchProvider");
  }
  return context;
}
