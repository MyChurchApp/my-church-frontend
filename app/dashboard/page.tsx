"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, DollarSign, TrendingUp, BookOpen, Gift } from "lucide-react"
import { FeedSectionContainer } from "./containers/feed/feed-section.container"
import { VerseOfDayService, type VerseOfDay } from "@/services/verse-of-day.service"
import { MembersService, type BirthdayMember } from "@/services/members.service"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeEvents: 0,
    monthlyDonations: 0,
    growth: 0,
  })

  const [verseOfDay, setVerseOfDay] = useState<VerseOfDay | null>(null)
  const [loadingVerse, setLoadingVerse] = useState(true)

  const [birthdays, setBirthdays] = useState<BirthdayMember[]>([])
  const [loadingBirthdays, setLoadingBirthdays] = useState(true)

  useEffect(() => {
    // Por enquanto, deixar os stats zerados até conectar com a API real
    setStats({
      totalMembers: 0,
      activeEvents: 0,
      monthlyDonations: 0,
      growth: 0,
    })

    // Carregar versículo do dia
    const loadVerseOfDay = async () => {
      try {
        const verse = await VerseOfDayService.getVerseOfDay()
        setVerseOfDay(verse)
      } catch (error) {
        console.error("Erro ao carregar versículo do dia:", error)
      } finally {
        setLoadingVerse(false)
      }
    }

    // Carregar aniversários da semana
    const loadBirthdays = async () => {
      try {
        const weeklyBirthdays = await MembersService.getWeeklyBirthdays()
        setBirthdays(weeklyBirthdays)
      } catch (error) {
        console.error("Erro ao carregar aniversários:", error)
      } finally {
        setLoadingBirthdays(false)
      }
    }

    loadVerseOfDay()
    loadBirthdays()
  }, [])

  // Função para gerar mensagem de aniversário melhorada
  const getBirthdayMessage = (member: BirthdayMember) => {
    if (member.isToday) {
      return `🎉 HOJE É ANIVERSÁRIO! Fazendo ${member.ageWillTurn} anos`
    } else if (member.daysUntilBirthday > 0) {
      const days = member.daysUntilBirthday
      if (days === 1) {
        return `🎈 Falta 1 dia para o aniversário (${member.ageWillTurn} anos)`
      } else {
        return `🎁 Faltam ${days} dias para o aniversário (${member.ageWillTurn} anos)`
      }
    } else {
      // Para aniversários que já passaram (caso apareçam na lista da semana)
      const daysPassed = Math.abs(member.daysUntilBirthday)
      if (daysPassed === 1) {
        return `Foi aniversário há 1 dia (fez ${member.ageWillTurn} anos)`
      } else {
        return `Foi aniversário há ${daysPassed} dias (fez ${member.ageWillTurn} anos)`
      }
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral da sua igreja</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Membros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">Membros cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Ativos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEvents}</div>
            <p className="text-xs text-muted-foreground">Eventos este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doações do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.monthlyDonations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total arrecadado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.growth}%</div>
            <p className="text-xs text-muted-foreground">Comparado ao mês anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Feed e Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feed da Comunidade - 2/3 da largura */}
        <div className="lg:col-span-2">
          <FeedSectionContainer />
        </div>

        {/* Sidebar - 1/3 da largura */}
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
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ) : verseOfDay ? (
                <div className="space-y-4">
                  <blockquote className="text-lg italic text-gray-700 leading-relaxed">
                    "{verseOfDay.verseText}"
                  </blockquote>
                  <cite className="text-sm font-semibold text-blue-600 block text-right">— {verseOfDay.reference}</cite>
                </div>
              ) : (
                <p className="text-gray-500">Não foi possível carregar o versículo do dia.</p>
              )}
            </CardContent>
          </Card>

          {/* Aniversários da Semana */}
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
                    <div key={i} className="flex items-center space-x-3 animate-pulse">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : birthdays.length > 0 ? (
                <div className="space-y-4">
                  {birthdays.slice(0, 5).map((member) => (
                    <div key={member.id} className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={member.photo || undefined} alt={member.name} />
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                        <p className={`text-xs ${member.isToday ? "text-red-600 font-semibold" : "text-gray-500"}`}>
                          {getBirthdayMessage(member)}
                        </p>
                        {member.isToday && (
                          <Badge variant="secondary" className="mt-1 text-xs bg-red-100 text-red-800">
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
                <p className="text-gray-500 text-sm">Nenhum aniversário esta semana.</p>
              )}
            </CardContent>
          </Card>

          {/* Card adicional para outras informações */}
          <Card>
            <CardHeader>
              <CardTitle>Próximos Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-sm">Nenhum evento próximo cadastrado.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
