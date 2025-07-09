"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  worshipService,
  WorshipStatus,
  type WorshipService,
  type BibleVersion,
  type BibleBook,
  type BibleChapter,
  type BibleVerse,
} from "@/services/worship/worship";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, PlayCircle, Heart, XCircle, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useSignalRForWorship } from "@/hooks/useSignalRForWorship";
import SchedulePanel from "../SchedulePanel/SchedulePanel";
import BiblePanel from "../BiblePanel/BiblePanel";
import HymnPanel from "../HymnPanel/HymnPanel";
import PrayerPanel from "../PrayerPanel/PrayerPanel";
import NoticePanel from "../NoticePanel/NoticePanel";
import ControlPanelNav from "../ControlPanelNav/ControlPanelNav";

type Panel = "cronograma" | "biblia" | "hinos" | "oracoes" | "avisos";

export default function ControlPanel({ worship }: { worship: WorshipService }) {
  const queryClient = useQueryClient();
  const worshipId = worship.id;

  const [activePanel, setActivePanel] = useState<Panel>("cronograma");
  const [isOffering, setIsOffering] = useState(false);
  const [offeringActivityId, setOfferingActivityId] = useState<number | null>(
    null
  );

  const [selectedVersion, setSelectedVersion] = useState<BibleVersion | null>(
    null
  );
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<BibleChapter | null>(
    null
  );
  const [selectedVerse, setSelectedVerse] = useState<BibleVerse | null>(null);

  useSignalRForWorship(worshipId);

  useEffect(() => {
    // Sincroniza o estado inicial baseado nos dados do culto
    const offeringActivity = worship.activities.find(
      (activity) =>
        activity.name.toLowerCase() === "oferta" && activity.isCurrent
    );
    if (offeringActivity) {
      setIsOffering(true);
      setOfferingActivityId(offeringActivity.id);
    } else {
      setIsOffering(false);
      setOfferingActivityId(null);
    }
  }, [worship]);

  const { mutate: startWorshipMutation, isPending: isStarting } = useMutation({
    mutationFn: () => worshipService.startWorship(worshipId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["worship-service", worshipId],
      });
      queryClient.invalidateQueries({ queryKey: ["worship-services-list"] });
    },
    onError: (err: any) => alert(`Erro ao iniciar culto: ${err.message}`),
  });

  // ✅ CORREÇÃO 1: Guardar o activityId retornado pela API
  const { mutate: presentOfferingMutation, isPending: isPresentingOffering } =
    useMutation({
      mutationFn: () => worshipService.presentOffering(worshipId),
      onSuccess: (data) => {
        // O 'data' aqui é a resposta da API: { activityId: 152 }
        if (data && data.activityId) {
          setOfferingActivityId(data.activityId); // Guardamos o ID
          setIsOffering(true);
          queryClient.invalidateQueries({
            queryKey: ["worship-service", worshipId],
          });
        }
      },
      onError: (err: any) => alert(`Erro ao apresentar oferta: ${err.message}`),
    });

  // ✅ CORREÇÃO 2: Usar o activityId guardado para finalizar a oferta
  const { mutate: finishOfferingMutation, isPending: isFinishingOffering } =
    useMutation({
      mutationFn: () => {
        if (!offeringActivityId) {
          throw new Error(
            "ID da atividade de oferta não encontrado. Não é possível finalizar."
          );
        }
        // A chamada ao serviço agora passa o ID da atividade específica
        return worshipService.finishOffering(worshipId, offeringActivityId);
      },
      onSuccess: () => {
        setIsOffering(false);
        setOfferingActivityId(null);
        queryClient.invalidateQueries({
          queryKey: ["worship-service", worshipId],
        });
      },
      onError: (err: any) => alert(`Erro ao finalizar oferta: ${err.message}`),
    });

  if (worship.status !== WorshipStatus.InProgress) {
    return (
      <div className="container mx-auto max-w-3xl p-4 sm:p-6 lg:p-8 space-y-6">
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/culto">
            <ChevronLeft className="h-4 w-4 mr-2" /> Voltar
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{worship.title}</CardTitle>
            <CardDescription>
              {worship.theme || "Sem tema definido"}
            </CardDescription>
          </CardHeader>
        </Card>
        <SchedulePanel
          worshipId={worship.id}
          isReadOnly={false}
          schedule={worship.schedule}
        />
        <div className="text-center py-4">
          <Button
            size="lg"
            onClick={() => startWorshipMutation()}
            disabled={isStarting}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          >
            {isStarting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            <PlayCircle className="mr-2 h-5 w-5" />
            Iniciar Culto
          </Button>
        </div>
      </div>
    );
  }

  const renderActivePanel = () => {
    switch (activePanel) {
      case "cronograma":
        return (
          <SchedulePanel
            worshipId={worship.id}
            isReadOnly={true}
            schedule={worship.schedule}
          />
        );
      case "biblia":
        return (
          <BiblePanel
            worshipId={worshipId}
            selectedVersion={selectedVersion}
            setSelectedVersion={setSelectedVersion}
            selectedBook={selectedBook}
            setSelectedBook={setSelectedBook}
            selectedChapter={selectedChapter}
            setSelectedChapter={setSelectedChapter}
            selectedVerse={selectedVerse}
            setSelectedVerse={setSelectedVerse}
          />
        );
      case "hinos":
        return <HymnPanel worshipId={worship.id} />;
      case "oracoes":
        return <PrayerPanel worshipId={worship.id} />;
      case "avisos":
        return <NoticePanel worshipId={worship.id} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-black">
      <header className="flex-shrink-0 bg-white dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="icon" className="h-9 w-9">
                <Link href="/dashboard/culto">
                  <ChevronLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {worship.title}
                </h1>
                <p className="text-xs text-green-600 dark:text-green-400 font-semibold">
                  ● Em andamento
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                {!isOffering ? (
                  <Button
                    size="sm"
                    onClick={() => presentOfferingMutation()}
                    disabled={isPresentingOffering}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isPresentingOffering ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Heart className="mr-2 h-4 w-4" />
                    )}
                    Oferta
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => finishOfferingMutation()}
                    disabled={isFinishingOffering}
                  >
                    {isFinishingOffering ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    Encerrar Oferta
                  </Button>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  window.open(
                    `/slide?id=${worshipId}`,
                    "_blank",
                    "width=800,height=600"
                  )
                }
              >
                Apresentar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-grow container mx-auto w-full flex overflow-hidden">
        <aside className="hidden md:block w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 p-4">
          <ControlPanelNav
            activePanel={activePanel}
            setActivePanel={setActivePanel}
          />
        </aside>

        <main className="flex-grow p-4 md:p-6 overflow-y-auto">
          {renderActivePanel()}
        </main>
      </div>

      {/* Navegação Inferior (Visível em telas pequenas) */}
      <footer className="md:hidden flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-2">
        <ControlPanelNav
          activePanel={activePanel}
          setActivePanel={setActivePanel}
        />
      </footer>
    </div>
  );
}
