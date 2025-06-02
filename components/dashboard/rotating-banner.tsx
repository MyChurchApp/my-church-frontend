"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

interface RotatingBannerProps {
  banners: any[]
  currentBannerIndex: number
  nextBanner: () => void
  prevBanner: () => void
}

export function RotatingBanner({ banners, currentBannerIndex, nextBanner, prevBanner }: RotatingBannerProps) {
  // Garantir que temos índices válidos para os banners
  const safeCurrentBannerIndex = banners && banners.length > 0 ? currentBannerIndex % banners.length : 0

  // Obter banner seguro
  const currentBanner = banners && banners.length > 0 ? banners[safeCurrentBannerIndex] : null

  if (!currentBanner) {
    return null
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          <div className="relative h-40 overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-r ${currentBanner.color} opacity-80`}></div>
            <Image
              src={currentBanner.image || "/placeholder.svg"}
              alt={currentBanner.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 flex flex-col justify-center p-6 text-white">
              <h3 className="text-xl font-bold">{currentBanner.title}</h3>
              <p className="text-sm mt-1">{currentBanner.subtitle}</p>
              <Button className="mt-4 bg-white text-gray-800 hover:bg-gray-100 w-full md:w-auto">Saiba Mais</Button>
            </div>
          </div>
          {banners.length > 1 && (
            <>
              <div className="absolute top-1/2 left-2 -translate-y-1/2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-white/80 hover:bg-white"
                  onClick={prevBanner}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute top-1/2 right-2 -translate-y-1/2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-white/80 hover:bg-white"
                  onClick={nextBanner}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
