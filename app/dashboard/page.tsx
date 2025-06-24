"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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
  () => import("./containers/feed/feed-section.container"),
  {
    ssr: false,
    loading: () => <p className="text-muted-foreground">Carregando feed…</p>,
  }
);

export default function DashboardPage() {
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

  const getBirthdayMessage = (member: BirthdayMember) => {
    if (!member.birthDate) return "Informação de aniversário indisponível";

    const today = new Date();
    const birthDate = new Date(member.birthDate);

    // Próximo aniversário
    let nextBirthday = new Date(
      today.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate()
    );
    if (
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() > birthDate.getDate())
    ) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }

    // Dias até o próximo aniversário
    const msInDay = 1000 * 60 * 60 * 24;
    const daysUntilBirthday = Math.ceil(
      (nextBirthday.getTime() - today.setHours(0, 0, 0, 0)) / msInDay
    );

    // Idade que vai fazer
    const ageWillTurn = nextBirthday.getFullYear() - birthDate.getFullYear();

    if (daysUntilBirthday === 0)
      return `🎉 HOJE É ANIVERSÁRIO! Fazendo ${ageWillTurn} anos`;
    if (daysUntilBirthday > 0)
      return `🎁 Faltam ${daysUntilBirthday} dias para o aniversário (${ageWillTurn} anos)`;
    const daysPassed = Math.abs(daysUntilBirthday);
    return `Foi aniversário há ${daysPassed} dia(s) (fez ${ageWillTurn} anos)`;
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
                  R$
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" /> Aniversários da Semana
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {birthdays.map((member) => (
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
                          {getBirthdayMessage(member)}
                        </p>
                      </div>
                      {member.isToday && <Badge>🎉</Badge>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
