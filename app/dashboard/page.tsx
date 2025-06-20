"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  BookOpen,
  Gift,
} from "lucide-react";
import {
  VerseOfDayService,
  type VerseOfDay,
} from "@/services/verse-of-day.service";
import {
  MembersService,
  type BirthdayMember,
} from "@/services/members.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ChurchDashboardStats,
  getChurchDashboardStats,
} from "@/services/church.service";

const FeedSectionContainer = dynamic(
  () => import("./containers/feed/feed-section.container"),
  {
    ssr: false,
    loading: () => <p>Carregando feed…</p>,
  }
);

export default function DashboardPage() {
  const [stats, setStats] = useState<ChurchDashboardStats>({
    totalActiveMembers: 0,
    totalEvents: 0,
    currentBalance: 0,
    memberGrowthPercent: 0,
    eventGrowthPercent: 0,
    financialGrowthPercent: 0,
    averageDonationTicket: 0,
  });

  const [verseOfDay, setVerseOfDay] = useState<VerseOfDay | null>(null);
  const [loadingVerse, setLoadingVerse] = useState(true);

  const [birthdays, setBirthdays] = useState<BirthdayMember[]>([]);
  const [loadingBirthdays, setLoadingBirthdays] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [statsRes, verseRes, birthdayRes] = await Promise.all([
          getChurchDashboardStats(),
          VerseOfDayService.getVerseOfDay(),
          MembersService.getWeeklyBirthdays(),
        ]);

        setStats(statsRes);
        setVerseOfDay(verseRes);
        setBirthdays(birthdayRes);
      } catch (err) {
        console.error("Erro ao carregar dados do dashboard:", err);
      } finally {
        setLoadingVerse(false);
        setLoadingBirthdays(false);
      }
    };

    loadDashboard();
  }, []);

  const getBirthdayMessage = (member: BirthdayMember) => {
    if (member.isToday) {
      return `🎉 HOJE É ANIVERSÁRIO! Fazendo ${member.ageWillTurn} anos`;
    } else if (member.daysUntilBirthday > 0) {
      const days = member.daysUntilBirthday;
      if (days === 1) {
        return `🎈 Falta 1 dia para o aniversário (${member.ageWillTurn} anos)`;
      } else {
        return `🎁 Faltam ${days} dias para o aniversário (${member.ageWillTurn} anos)`;
      }
    } else {
      const daysPassed = Math.abs(member.daysUntilBirthday);
      return `Foi aniversário há ${daysPassed} dia${
        daysPassed > 1 ? "s" : ""
      } (fez ${member.ageWillTurn} anos)`;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral da sua igreja</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Membros Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActiveMembers}</div>
            <p className="text-xs text-muted-foreground">Ativos na igreja</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Eventos Ativos
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">Eventos cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R${" "}
              {(stats.currentBalance ?? 0).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground">Total em caixa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
      </div>

      {/* Feed + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FeedSectionContainer />
        </div>

        <div className="space-y-6">
          {/* Versículo do Dia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Versículo do Dia
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingVerse ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ) : verseOfDay ? (
                <div className="space-y-4">
                  <blockquote className="text-lg italic text-gray-700 leading-relaxed">
                    "{verseOfDay.verseText}"
                  </blockquote>
                  <cite className="text-sm font-semibold text-blue-600 block text-right">
                    — {verseOfDay.reference}
                  </cite>
                </div>
              ) : (
                <p className="text-gray-500">
                  Não foi possível carregar o versículo do dia.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Aniversários */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Aniversários da Semana
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingBirthdays ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-3 animate-pulse"
                    >
                      <div className="w-10 h-10 bg-gray-200 rounded-full" />
                      <div className="flex-1 space-y-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : birthdays.length > 0 ? (
                <div className="space-y-4">
                  {birthdays.slice(0, 5).map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center space-x-3"
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage
                          src={member.photo || undefined}
                          alt={member.name}
                        />
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {member.name}
                        </p>
                        <p
                          className={`text-xs ${
                            member.isToday
                              ? "text-red-600 font-semibold"
                              : "text-gray-500"
                          }`}
                        >
                          {getBirthdayMessage(member)}
                        </p>
                        {member.isToday && (
                          <Badge
                            variant="secondary"
                            className="mt-1 text-xs bg-red-100 text-red-800"
                          >
                            🎂 Aniversário Hoje!
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {birthdays.length > 5 && (
                    <p className="text-xs text-gray-500 text-center pt-2 border-t">
                      +{birthdays.length - 5} outros aniversários esta semana
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  Nenhum aniversário esta semana.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Placeholder - eventos futuros */}
          <Card>
            <CardHeader>
              <CardTitle>Próximos Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-sm">
                Nenhum evento próximo cadastrado.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
