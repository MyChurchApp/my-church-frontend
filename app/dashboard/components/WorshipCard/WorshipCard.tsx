"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Calendar, Clock, Loader2 } from "lucide-react";
import { type WorshipService, WorshipStatus } from "@/services/worship/worship";

interface WorshipCardProps {
  worship: WorshipService;
  onFinishWorship: (id: number) => void;
  isFinishing: boolean;
}

export function WorshipCard({
  worship,
  onFinishWorship,
  isFinishing,
}: WorshipCardProps) {
  const getStatusBadge = () => {
    switch (worship.status) {
      case WorshipStatus.InProgress:
        return (
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            Em Andamento
          </Badge>
        );
      case WorshipStatus.Finished:
        return <Badge variant="secondary">Finalizado</Badge>;
      default:
        return <Badge variant="outline">Agendado</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 shadow-sm transition-shadow hover:shadow-lg rounded-xl overflow-hidden">
      <CardHeader className="p-5">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-grow">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {worship.title}
            </CardTitle>
            <CardDescription className="mt-1">
              {worship.theme || "Sem tema definido"}
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-4 space-y-3 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{new Date(worship.startTime).toLocaleDateString("pt-BR")}</span>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-gray-400" />
          <span>
            {new Date(worship.startTime).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-black/30 px-5 py-4 flex justify-end gap-3">
        {worship.status === WorshipStatus.InProgress && (
          <Button
            variant="destructive"
            size="sm"
            disabled={isFinishing}
            onClick={() => onFinishWorship(worship.id)}
          >
            {isFinishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Encerrar
          </Button>
        )}
        <Button
          asChild
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {/* ✅ CORREÇÃO APLICADA AQUI */}
          <Link href={`/dashboard/cultos/${worship.id}`}>Gerenciar</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
