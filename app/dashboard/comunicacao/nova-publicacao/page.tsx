"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ImagePlus, Send, Calendar, MessageSquare, Heart, DollarSign, Users } from "lucide-react"
import { getUser, getNotifications, type User, type Notification } from "@/lib/fake-api"

export default function ComunicacaoPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Form state
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [type, setType] = useState<string>("")
  const [image, setImage] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const userData = getUser()
    if (!userData) {
      router.push("/login")
      return
    }

    if (userData.accessLevel !== "admin") {
      router.push("/dashboard")
      return
    }

    setUser(userData)
    setNotifications(getNotifications())
  }, [router])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !content || !type) return

    setIsSubmitting(true)

    // Simular envio
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Aqui você implementaria a lógica real de envio
    console.log({
      title,
      content,
      type,
      author: user?.name,
      image: image?.name,
    })

    // Reset form
    setTitle("")
    setContent("")
    setType("")
    setImage(null)
    setIsSubmitting(false)

    // Mostrar mensagem de sucesso (você pode implementar um toast aqui)
    alert("Post publicado com sucesso!")
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "event":
        return <Calendar className="h-4 w-4" />
      case "announcement":
        return <MessageSquare className="h-4 w-4" />
      case "prayer":
        return <Heart className="h-4 w-4" />
      case "birthday":
        return <Users className="h-4 w-4" />
      case "finance":
        return <DollarSign className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getTypeBadge = (type: string) => {
    const badges = {
      event: { label: "Evento", color: "bg-blue-100 text-blue-800" },
      announcement: { label: "Anúncio", color: "bg-green-100 text-green-800" },
      prayer: { label: "Oração", color: "bg-red-100 text-red-800" },
      birthday: { label: "Aniversário", color: "bg-purple-100 text-purple-800" },
      finance: { label: "Financeiro", color: "bg-yellow-100 text-yellow-800" },
    }
    return badges[type as keyof typeof badges] || badges.announcement
  }

  if (!user) {
    return <div>Carregando...</div>
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
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-600">{user.role}</p>
              </div>
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=40&width=40&query=pastor+profile" />
                <AvatarFallback>
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
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
                      <Label htmlFor="type">Tipo de Publicação</Label>
                      <Select value={type} onValueChange={setType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="announcement">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" />
                              Anúncio
                            </div>
                          </SelectItem>
                          <SelectItem value="event">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Evento
                            </div>
                          </SelectItem>
                          <SelectItem value="prayer">
                            <div className="flex items-center gap-2">
                              <Heart className="h-4 w-4" />
                              Pedido de Oração
                            </div>
                          </SelectItem>
                          <SelectItem value="birthday">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Aniversário
                            </div>
                          </SelectItem>
                          <SelectItem value="finance">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              Financeiro
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">Título</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Digite o título da publicação"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content">Conteúdo</Label>
                      <Textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Escreva o conteúdo da publicação..."
                        rows={6}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image">Imagem (opcional)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("image")?.click()}
                          className="flex items-center gap-2"
                        >
                          <ImagePlus className="h-4 w-4" />
                          {image ? image.name : "Adicionar Imagem"}
                        </Button>
                      </div>
                    </div>

                    <Button type="submit" disabled={isSubmitting || !title || !content || !type} className="w-full">
                      {isSubmitting ? "Publicando..." : "Publicar no Mural"}
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
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {notifications.slice(0, 5).map((notification) => (
                      <div key={notification.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder.svg?height=32&width=32&query=church+member" />
                            <AvatarFallback className="text-xs">
                              {notification.author
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {getTypeIcon(notification.type)}
                              <h4 className="font-medium text-sm truncate">{notification.title}</h4>
                            </div>
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{notification.content}</p>
                            <div className="flex items-center justify-between">
                              <Badge className={`text-xs ${getTypeBadge(notification.type).color}`}>
                                {getTypeBadge(notification.type).label}
                              </Badge>
                              <span className="text-xs text-gray-500">{notification.author}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
