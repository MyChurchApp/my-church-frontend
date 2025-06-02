"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface BirthdaysCardProps {
  birthdays: any[]
  getInitials: (name: string | undefined | null) => string
}

export function BirthdaysCard({ birthdays, getInitials }: BirthdaysCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Aniversariantes da Semana</CardTitle>
      </CardHeader>
      <CardContent>
        {birthdays.length === 0 ? (
          <p className="text-center text-gray-500 py-4">Nenhum aniversariante esta semana</p>
        ) : (
          <div className="space-y-3">
            {birthdays.map((person) => (
              <div key={person.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm">{person.name}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {person.birthdayThisYear.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
