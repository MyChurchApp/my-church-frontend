"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { FeedItem } from "@/lib/types/feed.types"

interface FeedItemsProps {
  isLoadingFeed: boolean
  feedItems: FeedItem[]
  hasMoreFeedItems: boolean
  getInitials: (name: string | undefined | null) => string
  canUserEditOrDeletePost: (item: FeedItem) => boolean
  handleEditPost: (item: FeedItem) => void
  handleDeletePost: (item: FeedItem) => void
  loadMoreFeed: () => void
  setIsNewPostModalOpen: (open: boolean) => void
}

export function FeedItems({
  isLoadingFeed,
  feedItems,
  hasMoreFeedItems,
  getInitials,
  canUserEditOrDeletePost,
  handleEditPost,
  handleDeletePost,
  loadMoreFeed,
  setIsNewPostModalOpen,
}: FeedItemsProps) {
  const formatTimeAgo = (dateString: string): string => {
    try {
      // Converter a data UTC para data local
      const utcDate = new Date(dateString)
      const localDate = new Date(utcDate)
      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - localDate.getTime()) / 1000)

      if (diffInSeconds < 60) {
        return "Agora mesmo"
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60)
        return `${minutes} min atrás`
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600)
        return `${hours}h atrás`
      } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400)
        return `${days}d atrás`
      } else {
        return localDate.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      }
    } catch (error) {
      console.error("Erro ao formatar data:", error)
      return "Data inválida"
    }
  }

  if (isLoadingFeed && feedItems.length === 0) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (feedItems.length === 0 && !isLoadingFeed) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Nenhuma publicação encontrada.</p>
          <Button variant="outline" className="mt-4" onClick={() => setIsNewPostModalOpen(true)}>
            Criar primeira publicação
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {feedItems.map((item) => {
        const canEdit = canUserEditOrDeletePost(item)

        console.log(`Post ${item.id}:`, {
          memberId: item.memberId,
          created: item.created,
          canEdit: canEdit,
          memberName: item.member?.name,
        })

        return (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={item.member?.photo || ""} alt={item.member?.name || "Usuário"} />
                    <AvatarFallback>{getInitials(item.member?.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{item.member?.name || "Usuário"}</p>
                    <p className="text-xs text-gray-500">{formatTimeAgo(item.created)}</p>
                  </div>
                </div>

                {canEdit && (
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPost(item)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeletePost(item)}
                    >
                      Excluir
                    </Button>
                  </div>
                )}
              </div>

              <div className="px-4 pb-4 whitespace-pre-wrap">{item.content}</div>

              {item.likesCount > 0 && (
                <div className="px-4 pb-2">
                  <p className="text-sm text-gray-500">
                    {item.likesCount} {item.likesCount === 1 ? "curtida" : "curtidas"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}

      {hasMoreFeedItems && (
        <div className="flex justify-center p-4">
          <Button variant="outline" onClick={loadMoreFeed} disabled={isLoadingFeed}>
            {isLoadingFeed ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Carregando...
              </>
            ) : (
              "Carregar mais"
            )}
          </Button>
        </div>
      )}
    </>
  )
}
