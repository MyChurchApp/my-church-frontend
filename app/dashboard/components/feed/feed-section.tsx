"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, Send, Edit, Trash2, User, Clock, AlertCircle } from "lucide-react"
import {
  formatTimeAgo,
  canEditOrDeletePost,
  getTimeLeftForEdit,
  isRecentPost,
  type FeedItem,
} from "@/services/feed.service"

interface FeedSectionProps {
  feedItems: FeedItem[]
  loading: boolean
  error: string | null
  hasMore: boolean
  onCreatePost: (content: string) => Promise<number>
  onUpdatePost: (postId: number, content: string) => Promise<void>
  onDeletePost: (postId: number) => Promise<void>
  onLoadMore: () => Promise<void>
  onRefresh: () => Promise<void>
}

export function FeedSection({
  feedItems,
  loading,
  error,
  hasMore,
  onCreatePost,
  onUpdatePost,
  onDeletePost,
  onLoadMore,
  onRefresh,
}: FeedSectionProps) {
  const [newPostContent, setNewPostContent] = useState("")
  const [editingPost, setEditingPost] = useState<number | null>(null)
  const [editContent, setEditContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  // Obter ID do usuário atual
  const getCurrentUserId = (): string => {
    if (typeof window === "undefined") return ""

    const token = localStorage.getItem("authToken")
    if (!token) return ""

    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      return payload.nameid || payload.sub || payload.id || ""
    } catch (error) {
      console.error("Erro ao decodificar token:", error)
      return ""
    }
  }

  const handleSubmitPost = async () => {
    if (!newPostContent.trim()) return

    try {
      setSubmitting(true)
      setActionError(null)
      await onCreatePost(newPostContent.trim())
      setNewPostContent("")
    } catch (error) {
      console.error("Erro ao criar post:", error)
      setActionError(error instanceof Error ? error.message : "Erro ao criar post")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditPost = (post: FeedItem) => {
    setEditingPost(post.id)
    setEditContent(post.content)
    setActionError(null)
  }

  const handleSaveEdit = async () => {
    if (!editContent.trim() || !editingPost) return

    try {
      setSubmitting(true)
      setActionError(null)
      await onUpdatePost(editingPost, editContent.trim())
      setEditingPost(null)
      setEditContent("")
    } catch (error) {
      console.error("Erro ao editar post:", error)
      setActionError(error instanceof Error ? error.message : "Erro ao editar post")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeletePost = async (postId: number) => {
    if (!confirm("Tem certeza que deseja deletar este post?")) return

    try {
      setActionError(null)
      await onDeletePost(postId)
    } catch (error) {
      console.error("Erro ao deletar post:", error)
      setActionError(error instanceof Error ? error.message : "Erro ao deletar post")
    }
  }

  const handleLoadMore = async () => {
    try {
      setLoadingMore(true)
      await onLoadMore()
    } catch (error) {
      console.error("Erro ao carregar mais posts:", error)
    } finally {
      setLoadingMore(false)
    }
  }

  const currentUserId = getCurrentUserId()

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Feed da Comunidade
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="text-center mt-4">
            <Button onClick={onRefresh} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Feed da Comunidade
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Exibir erro de ação se houver */}
        {actionError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{actionError}</AlertDescription>
          </Alert>
        )}

        {/* Criar novo post */}
        <div className="space-y-2">
          <Textarea
            placeholder="Compartilhe algo com a comunidade..."
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            className="min-h-[80px]"
          />
          <div className="flex justify-end">
            <Button onClick={handleSubmitPost} disabled={!newPostContent.trim() || submitting} size="sm">
              <Send className="h-4 w-4 mr-2" />
              {submitting ? "Publicando..." : "Publicar"}
            </Button>
          </div>
        </div>

        {/* Lista de posts */}
        {loading && feedItems.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : feedItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum post encontrado.</p>
            <p className="text-sm">Seja o primeiro a compartilhar algo!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedItems.map((post) => {
              const canEdit = canEditOrDeletePost(post, currentUserId)
              const timeLeft = getTimeLeftForEdit(post.created)
              const isRecent = isRecentPost(post.created)

              return (
                <div key={post.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        {post.member?.photo ? (
                          <img
                            src={post.member.photo || "/placeholder.svg"}
                            alt={post.member.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{post.member?.name || "Usuário"}</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>{formatTimeAgo(post.created)}</span>
                          {post.memberId.toString() === currentUserId && isRecent && (
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{timeLeft}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {canEdit && (
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditPost(post)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeletePost(post.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {editingPost === post.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[80px]"
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingPost(null)
                            setEditContent("")
                            setActionError(null)
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button size="sm" onClick={handleSaveEdit} disabled={!editContent.trim() || submitting}>
                          {submitting ? "Salvando..." : "Salvar"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm">
                      <p className="whitespace-pre-wrap">{post.content}</p>
                      {post.updated && (
                        <p className="text-xs text-gray-400 mt-2">Editado em {formatTimeAgo(post.updated)}</p>
                      )}
                    </div>
                  )}

                  {/* Estatísticas do post */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                    <span>{post.likesCount} curtidas</span>
                    {post.memberId.toString() === currentUserId && !isRecent && (
                      <span className="text-orange-600">Não pode mais ser editado</span>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Botão carregar mais */}
            {hasMore && (
              <div className="text-center">
                <Button variant="outline" onClick={handleLoadMore} disabled={loadingMore}>
                  {loadingMore ? "Carregando..." : "Carregar mais"}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
