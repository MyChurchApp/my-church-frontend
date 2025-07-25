"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  worshipService,
  type WorshipService,
} from "@/services/worship/worship";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import ControlPanel from "../../components/ControlPanel/ControlPanel";

// 2. Remova a prop 'params' da definição da página
export default function WorshipDetailPage() {
  // 3. Chame o hook para pegar os parâmetros da URL
  const params = useParams();

  // O 'params' pode ser um objeto ou um array, então garantimos que estamos pegando a string
  const worshipId = Number(Array.isArray(params.id) ? params.id[0] : params.id);

  const {
    data: worship,
    isLoading,
    isError,
    error,
  } = useQuery<WorshipService>({
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
        <h2 className="text-xl font-semibold text-red-600">
          Falha ao Carregar o Culto
        </h2>
        <p className="text-gray-500 mt-2">
          Não foi possível encontrar os dados para este culto.
        </p>
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
