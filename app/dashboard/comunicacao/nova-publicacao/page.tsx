"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, MessageSquare, Heart, Loader2 } from "lucide-react"
import { getUser, type User } from "@/lib/fake-api"

// Helper function to safely get initials
const getInitials = (name: string | undefined): string => {
  if (!name || typeof name !== "string") return "U"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// Tipos para a API real
interface Member {
  id: number
  name: string
  photo: string | null
  // outros campos do membro...
}

interface FeedItem {
  id: number
  content: string
  memberId: number
  churchId: number
  created: string
  updated: string | null
  member: Member
  likesCount: number
}

interface FeedResponse {
  items: FeedItem[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export default function ComunicacaoPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isApiAvailable, setIsApiAvailable] = useState(false)

  // Form state
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Função para obter o token de autenticação do localStorage
  const getAuthToken = (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken")
    }
    return null
  }

  // Função para fazer requisições autenticadas
  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken()

    if (!token) {
      throw new Error("Token de autenticação não encontrado")
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (response.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem("authToken")
      router.push("/login")
      throw new Error("Sessão expirada. Por favor, faça login novamente.")
    }

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`)
    }

    return response.json()
  }

  // Função para buscar o feed da API
  const getFeedFromAPI = async (): Promise<FeedResponse> => {
    try {
      const data = await authenticatedFetch("https://demoapp.top1soft.com.br/api/Feed")
      return data
    } catch (error) {
      console.error("Erro ao buscar feed da API:", error)
      throw error
    }
  }

  // Função para criar um novo post
  const createPost = async (content: string): Promise<FeedItem> => {
    try {
      const data = await authenticatedFetch("https://demoapp.top1soft.com.br/api/Feed", {
        method: "POST",
        body: JSON.stringify({ content }),
      })
      return data
    } catch (error) {
      console.error("Erro ao criar post:", error)
      throw error
    }
  }

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)

      // Verificar se temos um token de autenticação
      const token = getAuthToken()

      if (token) {
        try {
          // Tentar carregar dados da API real
          const feedData = await getFeedFromAPI()
          setFeedItems(feedData.items)
          setIsApiAvailable(true)
        } catch (error) {
          console.error("Erro ao carregar dados da API:", error)
          // Fallback para dados fake
          setUser(getUser())
          setFeedItems([])
          setIsApiAvailable(false)
        }
      } else {
        // Sem token, usar dados fake
        setUser(getUser())
        setFeedItems([])
        setIsApiAvailable(false)
      }

      setIsLoading(false)
    }

    loadData()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content) return

    setIsSubmitting(true)

    try {
      if (isApiAvailable) {
        // Enviar para API real
        const newPost = await createPost(content)
       

        // Atualizar a lista de posts imediatamente
        setFeedItems((prevItems) => [newPost, ...prevItems])

        // Mostrar mensagem de sucesso
        alert("Publicação criada com sucesso!")
      } else {
        // Simulação com dados fake
        await new Promise((resolve) => setTimeout(resolve, 1000))
        alert("Modo demonstração - Publicação simulada com sucesso!")
      }

      // Reset form apenas após sucesso
      setContent("")
    } catch (error) {
      console.error("Erro detalhado ao publicar:", error)

      // Mostrar erro mais específico
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      alert(`Erro ao criar publicação: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-gray-500">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Comunicação</h1>
              <p className="text-gray-600">Publique no mural da igreja</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium text-gray-900">{user?.name || "Usuário"}</p>
                <p className="text-sm text-gray-600">{isApiAvailable ? "Conectado à API" : "Modo demonstração"}</p>
              </div>
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="max-w-4xl mx-auto grid gap-6 lg:grid-cols-2">
              {/* Formulário de Nova Publicação */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Nova Publicação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="content">Conteúdo</Label>
                      <Textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Escreva sua publicação..."
                        rows={6}
                        required
                      />
                    </div>

                    <Button type="submit" disabled={isSubmitting || !content} className="w-full">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Publicando...
                        </>
                      ) : (
                        "Publicar no Mural"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Preview das Últimas Publicações */}
              <Card>
                <CardHeader>
                  <CardTitle>Últimas Publicações</CardTitle>
                </CardHeader>
                <CardContent>
                  {isApiAvailable ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {feedItems.length > 0 ? (
                        feedItems.map((item) => (
                          <div key={item.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={item.member.photo || "/placeholder.svg?height=32&width=32"}
                                  alt={item.member.name}
                                />
                                <AvatarFallback className="text-xs">{getInitials(item.member.name)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-sm">{item.member.name}</h4>
                                </div>
                                <p className="text-sm text-gray-800 mb-2">{item.content}</p>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1">
                                    <Heart className="h-3.5 w-3.5 text-gray-500" />
                                    <span className="text-xs text-gray-500">{item.likesCount}</span>
                                  </div>
                                  <span className="text-xs text-gray-500">{formatDate(item.created)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-4">Nenhuma publicação encontrada</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <MessageSquare className="h-12 w-12 text-gray-300 mb-2" />
                      <h3 className="text-lg font-medium text-gray-900">Modo Demonstração</h3>
                      <p className="text-sm text-gray-500 max-w-xs mt-1">
                        Faça login com uma conta real para ver e criar publicações.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
