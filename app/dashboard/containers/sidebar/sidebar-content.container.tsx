"use client";

import { useState, useEffect } from "react";
import { SidebarContent } from "../../components/sidebar/sidebar-content";
import {
  MembersService,
  type BirthdayMember,
} from "@/services/members.service";
import {
  VerseOfDayService,
  type VerseOfDay,
} from "@/services/verse-of-day.service";
import { isAuthenticated } from "@/lib/api";
import { fakeMembers } from "@/lib/fake-api";

export function SidebarContentContainer() {
  const [verseOfDay, setVerseOfDay] = useState<VerseOfDay>({
    verseText: "",
    reference: "",
  });
  const [isLoadingVerse, setIsLoadingVerse] = useState(false);
  const [birthdays, setBirthdays] = useState<BirthdayMember[]>([]);
  const [isLoadingBirthdays, setIsLoadingBirthdays] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

  const getInitials = (name: string | undefined | null): string => {
    if (!name || typeof name !== "string") return "U";
    return (
      name
        .split(" ")
        .filter((n) => n.length > 0)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U"
    );
  };

  const getBirthdaysThisWeek = (): BirthdayMember[] => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return fakeMembers
      .filter((member) => {
        const birthDate = new Date(member.birthDate);
        const thisYearBirthday = new Date(
          today.getFullYear(),
          birthDate.getMonth(),
          birthDate.getDate()
        );
        return thisYearBirthday >= weekStart && thisYearBirthday <= weekEnd;
      })
      .map((member) => {
        const birthDate = new Date(member.birthDate);
        const thisYearBirthday = new Date(
          today.getFullYear(),
          birthDate.getMonth(),
          birthDate.getDate()
        );

        const daysUntilBirthday = Math.ceil(
          (thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        const isToday = daysUntilBirthday === 0;
        const hasPassed = daysUntilBirthday < 0;

        const currentAge = today.getFullYear() - birthDate.getFullYear();
        const hasHadBirthdayThisYear = today >= thisYearBirthday;
        const actualAge = hasHadBirthdayThisYear ? currentAge : currentAge - 1;

        let birthdayMessage = "";
        if (hasPassed) {
          const daysPassed = Math.abs(daysUntilBirthday);
          birthdayMessage = `fez ${actualAge} anos há ${daysPassed} ${
            daysPassed === 1 ? "dia" : "dias"
          }`;
        } else if (isToday) {
          birthdayMessage = `faz ${actualAge + 1} anos hoje! 🎉`;
        } else if (daysUntilBirthday === 1) {
          birthdayMessage = `fará ${actualAge + 1} anos amanhã`;
        } else {
          birthdayMessage = `fará ${
            actualAge + 1
          } anos daqui ${daysUntilBirthday} dias`;
        }

        return {
          id: member.id,
          name: member.name,
          email: member.email || "",
          phone: member.phone || "",
          birthDate: member.birthDate,
          photo: member.photo,
          birthdayThisYear: thisYearBirthday,
          ageWillTurn: actualAge + 1,
          daysUntilBirthday: daysUntilBirthday,
          isToday: isToday,
          birthdayMessage: birthdayMessage,
        };
      })
      .sort(
        (a, b) => a.birthdayThisYear.getTime() - b.birthdayThisYear.getTime()
      );
  };

  const loadBirthdays = async () => {
    setIsLoadingBirthdays(true);
    try {
      if (isAuthenticated()) {
        const isConnected = await MembersService.testConnection();

        if (!isConnected) {
          console.warn(
            "Endpoint de aniversários não disponível. Usando dados fake."
          );
          setBirthdays(getBirthdaysThisWeek());
          return;
        }

        const birthdayMembers = await MembersService.getWeeklyBirthdays();

        if (birthdayMembers.length === 0) {
          setBirthdays(getBirthdaysThisWeek());
        } else {
          setBirthdays(birthdayMembers);
        }
      } else {
        setBirthdays(getBirthdaysThisWeek());
      }
    } catch (error) {
      console.error("Erro ao carregar aniversários:", error);

      if (error instanceof Error) {
        if (error.message.includes("404")) {
          console.warn(
            "Endpoint de aniversários não encontrado. Usando dados de demonstração."
          );
        } else if (error.message.includes("401")) {
          console.warn(
            "Token de autenticação inválido. Usando dados de demonstração."
          );
        } else {
          console.warn(
            "Erro de conexão com a API. Usando dados de demonstração."
          );
        }
      }

      setBirthdays(getBirthdaysThisWeek());
    } finally {
      setIsLoadingBirthdays(false);
    }
  };

  const loadVerseOfDay = async () => {
    setIsLoadingVerse(true);
    try {
      const verse = await VerseOfDayService.getVerseOfDay();

      if (VerseOfDayService.isValidVerse(verse)) {
        setVerseOfDay(verse);
      } else {
        console.warn("Versículo inválido recebido da API.");
        setVerseOfDay({
          verseText: "Erro ao carregar versículo do dia",
          reference: "Tente novamente mais tarde",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar versículo do dia:", error);
      setVerseOfDay({
        verseText: "Erro ao carregar versículo do dia",
        reference: "Verifique sua conexão",
      });
    } finally {
      setIsLoadingVerse(false);
    }
  };

  const nextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % 3);
  };

  const prevBanner = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + 3) % 3);
  };

  const nextPromo = () => {
    setCurrentPromoIndex((prev) => (prev + 1) % 3);
  };

  const prevPromo = () => {
    setCurrentPromoIndex((prev) => (prev - 1 + 3) % 3);
  };

  useEffect(() => {
    loadBirthdays();
    loadVerseOfDay();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % 3);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % 3);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <SidebarContent
      verseOfDay={verseOfDay}
      isLoadingVerse={isLoadingVerse}
      birthdays={birthdays}
      isLoadingBirthdays={isLoadingBirthdays}
      currentBannerIndex={currentBannerIndex}
      currentPromoIndex={currentPromoIndex}
      onNextBanner={nextBanner}
      onPrevBanner={prevBanner}
      onNextPromo={nextPromo}
      onPrevPromo={prevPromo}
      onSetBannerIndex={setCurrentBannerIndex}
      onSetPromoIndex={setCurrentPromoIndex}
      getInitials={getInitials}
      formatBirthdayDate={MembersService.formatBirthdayDate}
    />
  );
}
