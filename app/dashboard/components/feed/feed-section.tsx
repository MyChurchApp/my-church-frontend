"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface FeedItem {
  id: string
  type: "donation" | "event" | "member" | "announcement"
  title: string
  description: string
  timestamp: string
  user?: {
    name: string
    avatar?: string
  }
  amount?: number
}

interface FeedSectionProps {
  items: FeedItem[]
}

export function FeedSection({ items }: FeedSectionProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "donation":
        return "bg-green-100 text-green-800"
      case "event":
        return "bg-blue-100 text-blue-800"
      case "member":
        return "bg-purple-100 text-purple-800"
      case "announcement":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "donation":
        return "Doação"
      case "event":
        return "Evento"
      case "member":
        return "Membro"
      case "announcement":
        return "Anúncio"
      default:
        return type
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Nenhuma atividade recente</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={item.user?.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{item.user?.name?.charAt(0) || "?"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <Badge className={getTypeColor(item.type)}>{getTypeLabel(item.type)}</Badge>
                    <span className="text-sm text-muted-foreground">{item.timestamp}</span>
                  </div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  {item.amount && (
                    <p className="text-sm font-medium text-green-600">R$ {item.amount.toLocaleString()}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
