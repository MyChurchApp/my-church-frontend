"use client"

import { useState, useEffect } from "react"
import { SidebarContent } from "../../components/sidebar/sidebar-content"
import { MembersService, type BirthdayMember } from "@/services/members.service"
import { VerseOfDayService, type VerseOfDay } from "@/services/verse-of-day.service"
import { isAuthenticated } from "@/lib/api"

export function SidebarContentContainer() {
  const [verseOfDay, setVerseOfDay] = useState<VerseOfDay>({
    verseText: "",
    reference: "",
  })
  const [isLoadingVerse, setIsLoadingVerse] = useState(false)
  const [birthdays, setBirthdays] = useState<BirthdayMember[]>([])
  const [isLoadingBirthdays, setIsLoadingBirthdays] = useState(false)
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0)

  const getInitials = (name: string | undefined | null): string => {
    if (!name || typeof name !== "string") return "U"
    return (
      name
        .split(" ")
        .filter((n) => n.length > 0)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U"
    )
  }

  const loadBirthdays = async () => {
    setIsLoadingBirthdays(true)
    try {
      if (isAuthenticated()) {
        const isConnected = await MembersService.testConnection()

        if (!isConnected) {
          console.warn("Endpoint de aniversários não disponível. Usando dados fake.")
          setBirthdays([])
          return
        }

        const birthdayMembers = await MembersService.getWeeklyBirthdays()

        setBirthdays(birthdayMembers)
      } else {
        setBirthdays([])
      }
    } catch (error) {
      console.error("Erro ao carregar aniversários:", error)
      setBirthdays([])
    } finally {
      setIsLoadingBirthdays(false)
    }
  }

  const loadVerseOfDay = async () => {
    setIsLoadingVerse(true)
    try {
      const verse = await VerseOfDayService.getVerseOfDay()

      if (VerseOfDayService.isValidVerse(verse)) {
        setVerseOfDay(verse)
      } else {
        console.warn("Versículo inválido recebido da API.")
        setVerseOfDay({
          verseText: "Erro ao carregar versículo do dia",
          reference: "Tente novamente mais tarde",
        })
      }
    } catch (error) {
      console.error("Erro ao carregar versículo do dia:", error)
      setVerseOfDay({
        verseText: "Erro ao carregar versículo do dia",
        reference: "Verifique sua conexão",
      })
    } finally {
      setIsLoadingVerse(false)
    }
  }

  const nextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % 3)
  }

  const prevBanner = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + 3) % 3)
  }

  const nextPromo = () => {
    setCurrentPromoIndex((prev) => (prev + 1) % 3)
  }

  const prevPromo = () => {
    setCurrentPromoIndex((prev) => (prev - 1 + 3) % 3)
  }

  useEffect(() => {
    loadBirthdays()
    loadVerseOfDay()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % 3)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % 3)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

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
  )
}
