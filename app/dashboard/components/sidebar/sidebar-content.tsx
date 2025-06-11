"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronLeft, ChevronRight, Star, Heart, Gift } from "lucide-react"
import type { BirthdayMember } from "@/services/members.service"
import type { VerseOfDay } from "@/services/verse-of-day.service"

interface SidebarContentProps {
  verseOfDay: VerseOfDay
  isLoadingVerse: boolean
  birthdays: BirthdayMember[]
  isLoadingBirthdays: boolean
  currentBannerIndex: number
  currentPromoIndex: number
  onNextBanner: () => void
  onPrevBanner: () => void
  onNextPromo: () => void
  onPrevPromo: () => void
  onSetBannerIndex: (index: number) => void
  onSetPromoIndex: (index: number) => void
  getInitials: (name: string | undefined | null) => string
  formatBirthdayDate: (date: Date) => string
}

export function SidebarContent({
  verseOfDay,
  isLoadingVerse,
  birthdays,
  isLoadingBirthdays,
  currentBannerIndex,
  currentPromoIndex,
  onNextBanner,
  onPrevBanner,
  onNextPromo,
  onPrevPromo,
  onSetBannerIndex,
  onSetPromoIndex,
  getInitials,
  formatBirthdayDate,
}: SidebarContentProps) {
  const banners = [
    {
      id: 1,
      title: "Retiro de Jovens 2025",
      subtitle: "15-17 de Março",
      color: "from-blue-500 to-purple-600",
    },
    {
      id: 2,
      title: "Campanha de Oração",
      subtitle: "21 dias de jejum",
      color: "from-green-500 to-teal-600",
    },
    {
      id: 3,
      title: "Escola Bíblica",
      subtitle: "Inscrições abertas",
      color: "from-orange-500 to-red-600",
    },
  ]

  const promoBanners = [
    {
      id: 1,
      title: "Livraria Cristã",
      subtitle: "20% OFF em livros",
      icon: <Star className="h-6 w-6" />,
      color: "from-pink-500 to-rose-600",
      action: "Comprar Agora",
    },
    {
      id: 2,
      title: "Café da Igreja",
      subtitle: "Novos sabores disponíveis",
      icon: <Heart className="h-6 w-6" />,
      color: "from-amber-500 to-orange-600",
      action: "Ver Cardápio",
    },
    {
      id: 3,
      title: "Bazar Beneficente",
      subtitle: "Ajude nossa comunidade",
      icon: <Gift className="h-6 w-6" />,
      color: "from-emerald-500 to-green-600",
      action: "Participar",
    },
  ]

  return (
    <div className="lg:col-span-1">
      <div className="lg:sticky lg:top-6 space-y-6">
        {/* Versículo do Dia */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
          <CardContent className="p-4">
            {isLoadingVerse || (!verseOfDay.verseText && !verseOfDay.reference) ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-blue-600 text-sm">Carregando versículo...</p>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <div className="text-sm font-medium text-blue-800 italic leading-relaxed">"{verseOfDay.verseText}"</div>
                <div className="text-xs text-blue-600 font-semibold">{verseOfDay.reference}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Aniversários da Semana */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              <CardTitle className="text-lg">Aniversários da Semana</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingBirthdays ? (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"></div>
                <p className="text-gray-500 text-sm">Carregando aniversários...</p>
              </div>
            ) : birthdays.length > 0 ? (
              <div className="space-y-3">
                {birthdays.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.photo || "/placeholder.svg?height=40&width=40&query=church+member"} />
                      <AvatarFallback className="bg-purple-100 text-purple-700">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{member.name || "Membro"}</p>
                      <p className="text-xs text-gray-600">{formatBirthdayDate(member.birthdayThisYear)}</p>
                      <p className="text-xs text-purple-600 font-medium">
                        {(() => {
                          const today = new Date()
                          const birthDate = new Date(member.birthDate)
                          const thisYearBirthday = new Date(
                            today.getFullYear(),
                            birthDate.getMonth(),
                            birthDate.getDate(),
                          )
                          const daysUntilBirthday = Math.ceil(
                            (thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
                          )
                          const hasPassed = daysUntilBirthday < 0
                          const isToday = daysUntilBirthday === 0

                          const currentAge = today.getFullYear() - birthDate.getFullYear()
                          const hasHadBirthdayThisYear = today >= thisYearBirthday
                          const actualAge = hasHadBirthdayThisYear ? currentAge : currentAge - 1

                          if (hasPassed) {
                            const daysPassed = Math.abs(daysUntilBirthday)
                            return `fez ${actualAge} anos há ${daysPassed} ${daysPassed === 1 ? "dia" : "dias"}`
                          } else if (isToday) {
                            return `faz ${actualAge + 1} anos hoje! 🎉`
                          } else if (daysUntilBirthday === 1) {
                            return `fará ${actualAge + 1} anos amanhã`
                          } else {
                            return `fará ${actualAge + 1} anos daqui ${daysUntilBirthday} dias`
                          }
                        })()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Nenhum aniversário esta semana</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Carrossel de Banners de Eventos */}
        <Card className="overflow-hidden">
          <div className="relative h-48">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${banners[currentBannerIndex].color} flex items-center justify-center text-white`}
            >
              <div className="text-center p-4">
                <h3 className="text-lg font-bold mb-2">{banners[currentBannerIndex].title}</h3>
                <p className="text-sm opacity-90">{banners[currentBannerIndex].subtitle}</p>
              </div>
            </div>

            {/* Controles do carrossel */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
              onClick={onPrevBanner}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
              onClick={onNextBanner}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Indicadores */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentBannerIndex ? "bg-white" : "bg-white/50"
                  }`}
                  onClick={() => onSetBannerIndex(index)}
                />
              ))}
            </div>
          </div>
        </Card>

        {/* Carrossel de Banners de Propaganda */}
        <Card className="overflow-hidden">
          <div className="relative h-48">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${promoBanners[currentPromoIndex].color} flex items-center justify-center text-white`}
            >
              <div className="text-center p-4">
                <div className="mb-3">{promoBanners[currentPromoIndex].icon}</div>
                <h3 className="text-lg font-bold mb-2">{promoBanners[currentPromoIndex].title}</h3>
                <p className="text-sm opacity-90 mb-3">{promoBanners[currentPromoIndex].subtitle}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  {promoBanners[currentPromoIndex].action}
                </Button>
              </div>
            </div>

            {/* Controles do carrossel */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
              onClick={onPrevPromo}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
              onClick={onNextPromo}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Indicadores */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {promoBanners.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentPromoIndex ? "bg-white" : "bg-white/50"
                  }`}
                  onClick={() => onSetPromoIndex(index)}
                />
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
