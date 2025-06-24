"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TransferBalanceCard } from "@/components/financeiro/transfer-balance-card";
import { TransferForm } from "@/components/financeiro/transfer-form";
import { getUser } from "@/lib/auth-utils";

export default function OfertasRealizadasPage() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Verificar se o usuário é admin
    const user = getUser();
    if (!user || user.accessLevel !== "admin") {
      router.push("/dashboard");
      return;
    }
  }, [router]);

  const handleTransferComplete = () => {
    // Forçar atualização do saldo
    setRefreshKey((prev) => prev + 1);
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Saldo Disponível */}
        <div>
          <TransferBalanceCard key={refreshKey} onRefresh={handleRefresh} />
        </div>

        {/* Formulário de Transferência */}
        <div>
          <TransferForm onTransferComplete={handleTransferComplete} />
        </div>
      </div>
    </div>
  );
}
