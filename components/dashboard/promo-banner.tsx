"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PromoBannerProps {
  promoBanners: any[]
  currentPromoIndex: number
  nextPromo: () => void
  prevPromo: () => void
}

export function PromoBanner({ promoBanners, currentPromoIndex, nextPromo, prevPromo }: PromoBannerProps) {
  // Garantir que temos índices válidos para os banners
  const safeCurrentPromoIndex = promoBanners && promoBanners.length > 0 ? currentPromoIndex % promoBanners.length : 0

  // Obter banner seguro
  const currentPromo = promoBanners && promoBanners.length > 0 ? promoBanners[safeCurrentPromoIndex] : null

  if (!currentPromo) {
    return null
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          <div className={`bg-gradient-to-r ${currentPromo.color} p-4 text-white`}>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-full text-lg">{currentPromo.icon}</div>
              <div>
                <h3 className="font-bold">{currentPromo.title}</h3>
                <p className="text-sm">{currentPromo.subtitle}</p>
              </div>
            </div>
            <Button className="mt-3 bg-white text-gray-800 hover:bg-gray-100 w-full">{currentPromo.action}</Button>
          </div>
          {promoBanners.length > 1 && (
            <>
              <div className="absolute top-1/2 left-2 -translate-y-1/2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-white/30 hover:bg-white/50 text-white"
                  onClick={prevPromo}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute top-1/2 right-2 -translate-y-1/2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-white/30 hover:bg-white/50 text-white"
                  onClick={nextPromo}
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
