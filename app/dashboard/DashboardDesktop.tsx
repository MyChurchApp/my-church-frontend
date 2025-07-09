"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getChurchDashboardStats,
  type ChurchDashboardStats,
} from "@/services/church.service";
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  BookOpen,
  Gift,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";
import { VerseType } from "@/services/church/type";
import { VerseOfDay } from "@/services/church/VerseOfDay";
import {
  BirthdayMember,
  MembersBirthday,
} from "@/services/church/MembersBirthday";

const FeedSectionContainer = dynamic(
  () => import("../../containers/feed/feed-section.container"),
  {
    ssr: false,
    loading: () => <p className="text-muted-foreground">Carregando feed…</p>,
  }
);

export function DashboardDesktop() {
  const [dashboardError, setDashboardError] = useState<number | null>(null);

  const {
    data: stats,
    isLoading: loadingStats,
    error: statsError,
  } = useQuery<ChurchDashboardStats, Error>({
    queryKey: ["dashboard-stats"],
    queryFn: getChurchDashboardStats,
    retry: false,
  });

  useEffect(() => {
    if ((statsError as any)?.status === 403) setDashboardError(403);
  }, [statsError]);

  const {
    data: verseOfDay,
    isLoading: loadingVerse,
    error: verseError,
  } = useQuery<VerseType, Error>({
    queryKey: ["verse-of-day"],
    queryFn: () => VerseOfDay.getVerseOfDay(),
    retry: false,
  });

  const {
    data: birthdays = [],
    isLoading: loadingBirthdays,
    error: birthdaysError,
  } = useQuery<BirthdayMember[], Error>({
    queryKey: ["weekly-birthdays"],
    queryFn: () => MembersBirthday.getWeeklyBirthdays(),
    retry: false,
  });

  // ✅ FUNÇÃO CORRIGIDA E SIMPLIFICADA
  const getBirthdayMessage = (member: BirthdayMember) => {
    if (!member.birthDate) return "Data de aniversário indisponível";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const birthDate = new Date(member.birthDate);

    // Calcula a data do aniversário neste ano
    const birthdayThisYear = new Date(
      today.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate()
    );
    birthdayThisYear.setHours(0, 0, 0, 0);

    // Calcula a diferença de dias em relação a hoje
    const msInDay = 1000 * 60 * 60 * 24;
    const diffDays = Math.round(
      (birthdayThisYear.getTime() - today.getTime()) / msInDay
    );

    const age = today.getFullYear() - birthDate.getFullYear();

    if (diffDays === 0) return `🎉 HOJE É ANIVERSÁRIO! Fazendo ${age} anos`;
    if (diffDays === -1) return `Fez aniversário ontem (${age} anos)`;
    if (diffDays < -1)
      return `Fez aniversário há ${Math.abs(diffDays)} dias (${age} anos)`;
    if (diffDays === 1)
      return `🎁 Falta 1 dia para o aniversário (${age + 1} anos)`;
    if (diffDays > 1)
      return `🎁 Faltam ${diffDays} dias para o aniversário (${age + 1} anos)`;

    return ""; // Caso não se encaixe em nenhuma condição
  };

  return (
    <div className="p-6">
      {!statsError && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {typeof stats.totalActiveMembers === "number" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Membros Ativos
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalActiveMembers}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ativos na igreja
                </p>
              </CardContent>
            </Card>
          )}

          {typeof stats.totalEvents === "number" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Eventos Ativos
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEvents}</div>
                <p className="text-xs text-muted-foreground">
                  Eventos cadastrados
                </p>
              </CardContent>
            </Card>
          )}

          {typeof stats.currentBalance === "number" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Saldo Atual
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R${" "}
                  {stats.currentBalance.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </div>
                <p className="text-xs text-muted-foreground">Total em caixa</p>
              </CardContent>
            </Card>
          )}

          {typeof stats.financialGrowthPercent === "number" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Crescimento Financeiro
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.financialGrowthPercent}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Em relação ao mês anterior
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FeedSectionContainer />
        </div>

        <div className="space-y-6">
          {!verseError && verseOfDay && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" /> Versículo do Dia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <blockquote className="text-lg italic text-gray-700 leading-relaxed">
                    "{verseOfDay.verseText}"
                  </blockquote>
                  <cite className="text-sm font-semibold text-blue-600 block text-right">
                    — {verseOfDay.reference}
                  </cite>
                </div>
              </CardContent>
            </Card>
          )}

          {!birthdaysError && birthdays.length > 0 && (
            <Card className="mt-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" /> Aniversários da Semana
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {birthdays.map((member) => {
                    const message = getBirthdayMessage(member);
                    const isToday = message?.includes("HOJE");

                    return (
                      <div key={member.id} className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage
                            src={member.photo || undefined}
                            alt={member.name}
                          />
                          <AvatarFallback>{member.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {member.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {message}
                          </p>
                        </div>
                        {isToday && (
                          <Badge className="bg-transparent text-2xl p-0">
                            🎉
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
