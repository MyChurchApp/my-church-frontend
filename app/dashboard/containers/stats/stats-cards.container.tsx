"use client"

import { StatsCards } from "../../components/stats/stats-cards"
import type { ChurchData } from "@/lib/fake-api"

interface StatsCardsContainerProps {
  churchData: ChurchData
}

export function StatsCardsContainer({ churchData }: StatsCardsContainerProps) {
  return <StatsCards churchData={churchData} />
}
