"use client";

import { useQuery } from "@tanstack/react-query";
import { worshipService, type WorshipService } from "@/services/worship/worship";
import { Loader2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ControlPanel from "../../components/ControlPanel/ControlPanel";

export default function WorshipDetailClient({ worshipId }: { worshipId: number }) {
  const { data: worship, isLoading, isError, error } = useQuery<WorshipService>({
    queryKey: ["worship-service", worshipId],
    queryFn: () => worshipService.getWorshipById(worshipId),
    enabled: !!worshipId && !isNaN(worshipId),
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-black">
        <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
      </div>
    );
  }

  if (isError || !worship) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-black text-center p-8">
        <h2 className="text-xl font-semibold text-red-600">Falha ao Carregar o Culto</h2>
        <p className="text-gray-500 mt-2">Não foi possível encontrar os dados para este culto.</p>
        <p className="font-mono text-sm bg-red-100 text-red-700 p-2 rounded-md mt-4">
          {error?.message || "ID do culto não encontrado."}
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/dashboard/culto">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar para a Lista
          </Link>
        </Button>
      </div>
    );
  }

  return <ControlPanel worship={worship} />;
}
