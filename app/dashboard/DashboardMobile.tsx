"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, BookOpen, Gift } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import {
  BirthdayMember,
  MembersBirthday,
} from "@/services/church/MembersBirthday";
import { VerseOfDay } from "@/services/church/VerseOfDay";
import { VerseType } from "@/services/church/type";
import FeedSectionContainer from "@/containers/feed/feed-section.container";

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

  // ✅ FUNCTION CORRECTED AND SIMPLIFIED
  const getBirthdayMessage = (member: BirthdayMember) => {
    if (!member.birthDate) return "Data de aniversário indisponível";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const birthDate = new Date(member.birthDate);

    // Calculate the date of the birthday for the current year
    const birthdayThisYear = new Date(
      today.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate()
    );
    birthdayThisYear.setHours(0, 0, 0, 0);

    // Calculate the difference in days from today
    const msInDay = 1000 * 60 * 60 * 24;
    const diffDays = Math.round(
      (birthdayThisYear.getTime() - today.getTime()) / msInDay
    );

    const age = today.getFullYear() - birthDate.getFullYear();

    if (diffDays === 0) return `🎉 HOJE É ANIVERSÁRIO! Fazendo ${age} anos`;
    if (diffDays === -1) return `Fez aniversário ontem (${age} anos)`;
    if (diffDays < -1)
      return `Foi aniversário há ${Math.abs(diffDays)} dias (${age} anos)`;
    if (diffDays === 1)
      return `🎁 Falta 1 dia para o aniversário (${age + 1} anos)`;
    if (diffDays > 1)
      return `🎁 Faltam ${diffDays} dias para o aniversário (${age + 1} anos)`;

    return ""; // Fallback in case no condition is met
  };

  return (
    <>
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
      <FeedSectionContainer />
    </>
  );
}
