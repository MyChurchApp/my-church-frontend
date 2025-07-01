// src/contexts/ChurchContext.tsx

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

      // A LÓGICA PRINCIPAL ESTÁ AQUI!
      // Se bankingInfo for nulo, indefinido ou um objeto vazio, abre o modal.
      if (!data.bankingInfo || Object.keys(data.bankingInfo).length === 0) {
        console.log("Dados bancários não encontrados, abrindo modal.");
        setIsBankingModalOpen(true);
      }
    } catch (error) {
      console.error("Erro no ChurchContext:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Busca os dados na primeira vez que o provedor é montado
  useEffect(() => {
    fetchAndCheckChurchData();
  }, [fetchAndCheckChurchData]);

  const closeModalAndRefetch = async () => {
    setIsBankingModalOpen(false);
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
      {/* O Modal vive aqui, mas é controlado pelo estado do provedor */}
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
