"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FeedSectionContainer from "./containers/feed/feed-section.container";
import { Badge, BookOpen, Gift } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import {
  BirthdayMember,
  MembersBirthday,
} from "@/services/church/MembersBirthday";
import { VerseOfDay } from "@/services/church/VerseOfDay";
import { VerseType } from "@/services/church/type";

export function DashboardMobile() {
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
    today.setHours(0, 0, 0, 0); // Normaliza hora

    const birthDate = new Date(member.birthDate);
    birthDate.setHours(0, 0, 0, 0); // Normaliza hora

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

    // Data do aniversário deste ano (pode ser passado)
    const birthdayThisYear = new Date(
      today.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate()
    );

    // Calcula diferença de dias
    const msInDay = 1000 * 60 * 60 * 24;
    const diffDays = Math.round(
      (birthdayThisYear.getTime() - today.getTime()) / msInDay
    );

    // Pega o início e fim da semana (segunda a domingo)
    const weekDay = today.getDay() || 7; // 1=segunda, 7=domingo
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - (weekDay - 1));
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    // O aniversário desse ano foi essa semana?
    if (birthdayThisYear >= weekStart && birthdayThisYear <= weekEnd) {
      if (diffDays === 0)
        return `🎉 HOJE É ANIVERSÁRIO! Fazendo ${
          today.getFullYear() - birthDate.getFullYear()
        } anos`;
      if (diffDays === -1)
        return `Fez aniversário ontem (fez ${
          today.getFullYear() - birthDate.getFullYear()
        } anos)`;
      if (diffDays < 0)
        return `Foi aniversário há ${Math.abs(diffDays)} dias (fez ${
          today.getFullYear() - birthDate.getFullYear()
        } anos)`;
      if (diffDays > 0)
        return `🎁 Faltam ${diffDays} dias para o aniversário (${
          today.getFullYear() - birthDate.getFullYear()
        } anos)`;
    }

    // Fora da semana, não mostra nada
    return null;
  };
  return (
    <div className="p-4">
      <div className="space-y-6 mb-8">
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
                      <p className="font-medium text-gray-900">{member.name}</p>
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
      <FeedSectionContainer />
    </div>
  );
}
