"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  worshipService,
  type WorshipService,
} from "@/services/worship/worship";
import { WorshipCard } from "../WorshipCard/WorshipCard";

export default function WorshipList() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<{ items: WorshipService[] }>({
    queryKey: ["worship-services-list"],
    queryFn: () => worshipService.listWorshipServices({ pageSize: 100 }),
  });

  const { mutate: finishWorshipMutation, isPending: isFinishing } = useMutation(
    {
      mutationFn: (worshipId: number) =>
        worshipService.finishWorship(worshipId),
      onSuccess: (_, worshipId) => {
        queryClient.invalidateQueries({ queryKey: ["worship-services-list"] });
        queryClient.invalidateQueries({
          queryKey: ["worship-service", worshipId],
        });
      },
      onError: (err: any) => alert(`Erro ao finalizar culto: ${err.message}`),
    }
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-4">Carregando cultos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500 bg-red-50 rounded-lg">
        <p>Ocorreu um erro ao carregar os cultos:</p>
        <p className="font-mono text-sm mt-2">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {data?.items?.map((worship) => (
        <WorshipCard
          key={worship.id}
          worship={worship}
          onFinishWorship={finishWorshipMutation}
          isFinishing={isFinishing}
        />
      ))}
      {data?.items?.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p>Nenhum culto encontrado.</p>
        </div>
      )}
    </div>
  );
}
