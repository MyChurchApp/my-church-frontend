import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, DollarSign, Users, Bell } from "lucide-react"

// Interface para os itens do feed
interface FeedItem {
  id: number
  type: "event" | "donation" | "member" | "announcement"
  title: string
  description: string
  date: string
  icon?: string
}

interface FeedSectionProps {
  feedItems: FeedItem[]
  loading: boolean
}

export function FeedSection({ feedItems, loading }: FeedSectionProps) {
  // Função para formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Função para obter o ícone com base no tipo
  const getIcon = (type: string) => {
    switch (type) {
      case "event":
        return <Calendar className="h-4 w-4" />
      case "donation":
        return <DollarSign className="h-4 w-4" />
      case "member":
        return <Users className="h-4 w-4" />
      case "announcement":
        return <Bell className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : feedItems.length > 0 ? (
          <div className="space-y-4">
            {feedItems.map((item) => (
              <div key={item.id} className="flex items-start gap-4 rounded-md border p-3">
                <div className="mt-0.5 rounded-full bg-gray-100 p-2">{getIcon(item.type)}</div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{item.title}</h4>
                  <p className="text-sm text-gray-500">{item.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(item.date)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">Nenhuma atividade recente encontrada.</p>
        )}
      </CardContent>
    </Card>
  )
}
