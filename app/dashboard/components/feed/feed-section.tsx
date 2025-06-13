"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RefreshCw, Send, Edit, Trash2, User } from "lucide-react"
import { formatTimeAgo, type ApiFeedItem } from "@/lib/api"

interface FeedSectionProps {
  feedItems: ApiFeedItem[]
  loading: boolean
  error: string | null
  onCreatePost: (content: string) => Promise<ApiFeedItem>
  onUpdatePost: (postId: number, content: string) => Promise<ApiFeedItem>
  onDeletePost: (postId: number) => Promise<void>
  onRefresh: () => Promise<void>
}

export function FeedSection({
  feedItems,
  loading,
  error,
  onCreatePost,
  onUpdatePost,
  onDeletePost,
  onRefresh,
}: FeedSectionProps) {
  const [newPostContent, setNewPostContent] = useState("")
  const [editingPost, setEditingPost] = useState<number | null>(null)
  const [editContent, setEditContent] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmitPost = async () => {
    if (!newPostContent.trim()) return

    try {
      setSubmitting(true)
      await onCreatePost(newPostContent.trim())
      setNewPostContent("")
    } catch (error) {
      console.error("Erro ao criar post:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditPost = (post: ApiFeedItem) => {
    setEditingPost(post.id)
    setEditContent(post.content)
  }

  const handleSaveEdit = async () => {
    if (!editContent.trim() || !editingPost) return

    try {
      setSubmitting(true)
      await onUpdatePost(editingPost, editContent.trim())
      setEditingPost(null)
      setEditContent("")
    } catch (error) {
      console.error("Erro ao editar post:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeletePost = async (postId: number) => {
    if (!confirm("Tem certeza que deseja deletar este post?")) return

    try {
      await onDeletePost(postId)
    } catch (error) {
      console.error("Erro ao deletar post:", error)
    }
  }

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
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
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
              Publicar
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
            {feedItems.map((post) => (
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
                      <p className="text-xs text-gray-500">{formatTimeAgo(post.created)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEditPost(post)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeletePost(post.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button size="sm" onClick={handleSaveEdit} disabled={!editContent.trim() || submitting}>
                        Salvar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm">
                    <p className="whitespace-pre-wrap">{post.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
