"use client";

import React, { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { worshipService, type PrayerRequest } from "@/services/worship/worship";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, HandHeart } from "lucide-react";

export default function PrayerPanel({ worshipId }: { worshipId: number }) {
  const queryClient = useQueryClient();

  const {
    data: requests = [],
    isLoading,
    isError,
    error,
  } = useQuery<PrayerRequest[]>({
    queryKey: ["prayer-requests", worshipId],
    queryFn: () => worshipService.getPrayerRequests(worshipId),
    select: (data) =>
      [...data].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    refetchInterval: 15000, // Atualiza a cada 15 segundos
  });

  // Listener para evento de SignalR (se você implementar)
  useEffect(() => {
    const handleNewRequest = () => {
      queryClient.invalidateQueries({
        queryKey: ["prayer-requests", worshipId],
      });
    };
    window.addEventListener("prayerRequestReceived", handleNewRequest);
    return () =>
      window.removeEventListener("prayerRequestReceived", handleNewRequest);
  }, [worshipId, queryClient]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded-lg">
        Erro ao carregar pedidos: {error.message}
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="px-1 pt-1">
        <CardTitle>Pedidos de Oração</CardTitle>
        <CardDescription>
          Visualize os pedidos enviados em tempo real.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 mt-4">
        <ScrollArea className="h-[calc(100vh-240px)] w-full">
          <div className="space-y-3">
            {requests.length > 0 ? (
              requests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 bg-white dark:bg-gray-900/50 rounded-lg shadow-sm animate-in fade-in-0 slide-in-from-top-4 duration-300"
                >
                  <p className="text-gray-800 dark:text-gray-200">
                    {req.request}
                  </p>
                  <p className="text-xs text-right text-gray-400 dark:text-gray-500 mt-3">
                    {req.memberName} -{" "}
                    {new Date(req.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 py-16">
                <HandHeart className="h-12 w-12 mb-4" />
                <p>Aguardando pedidos de oração...</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
