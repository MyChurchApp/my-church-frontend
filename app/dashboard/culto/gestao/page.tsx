"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Music,
  Book,
  MessageSquare,
  Users,
  ChevronRight,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { isAuthenticated, getUser } from "@/lib/auth-utils";

// Tipos para a API
interface WorshipService {
  id: number;
  title: string;
  date: string;
  time: string;
  status: "scheduled" | "in-progress" | "completed";
  preacher: string;
  theme: string;
  description: string;
  songs: Song[];
  readings: Reading[];
  announcements: Announcement[];
}

interface Song {
  id: number;
  title: string;
  artist: string;
  key: string;
  bpm: number;
  duration: string;
}

interface Reading {
  id: number;
  title: string;
  reference: string;
  text: string;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
}

export default function GestaoCultoPage() {
  const router = useRouter();
  const [cultos, setCultos] = useState<WorshipService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCulto, setEditingCulto] = useState<WorshipService | null>(null);
  const [activeTab, setActiveTab] = useState("informacoes");
  const [formData, setFormData] = useState<Partial<WorshipService>>({
    songs: [],
    readings: [],
    announcements: [],
  });

  // Estados para os formulários de itens
  const [newSong, setNewSong] = useState<Partial<Song>>({});
  const [newReading, setNewReading] = useState<Partial<Reading>>({});
  const [newAnnouncement, setNewAnnouncement] = useState<Partial<Announcement>>(
    {}
  );

  // Função para obter o token de autenticação do localStorage
  const getAuthToken = (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken");
    }
    return null;
  };

  // Função para fazer requisições autenticadas
  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();

    if (!token) {
      throw new Error("Token de autenticação não encontrado");
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem("authToken");
      router.push("/login");
      throw new Error("Sessão expirada. Por favor, faça login novamente.");
    }

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    return response.json();
  };

  // Função para buscar os cultos da API
  const fetchWorshipServices = async (): Promise<WorshipService[]> => {
    try {
      // Aqui você faria a chamada real para a API
      // const data = await authenticatedFetch("https://demoapp.top1soft.com.br/api/Worship")
      // return data

      // Por enquanto, retornamos dados simulados
      return [
        {
          id: 1,
          title: "Culto de Domingo",
          date: "2025-06-15",
          time: "10:00",
          status: "scheduled",
          preacher: "Pastor João Silva",
          theme: "Fé e Perseverança",
          description:
            "Culto dominical sobre a importância da fé em tempos difíceis",
          songs: [
            {
              id: 1,
              title: "Grande é o Senhor",
              artist: "Adhemar de Campos",
              key: "G",
              bpm: 75,
              duration: "4:30",
            },
            {
              id: 2,
              title: "Deus é Fiel",
              artist: "Diante do Trono",
              key: "D",
              bpm: 72,
              duration: "5:15",
            },
            {
              id: 3,
              title: "Maravilhosa Graça",
              artist: "Ministério Ipiranga",
              key: "E",
              bpm: 68,
              duration: "4:45",
            },
          ],
          readings: [
            {
              id: 1,
              title: "Leitura Inicial",
              reference: "Salmos 23",
              text: "O Senhor é meu pastor, nada me faltará...",
            },
            {
              id: 2,
              title: "Leitura Principal",
              reference: "Hebreus 11:1-6",
              text: "Ora, a fé é a certeza daquilo que esperamos e a prova das coisas que não vemos...",
            },
          ],
          announcements: [
            {
              id: 1,
              title: "Encontro de Jovens",
              content:
                "No próximo sábado às 19h teremos nosso encontro de jovens",
            },
            {
              id: 2,
              title: "Campanha de Arrecadação",
              content:
                "Estamos arrecadando alimentos não perecíveis para famílias carentes",
            },
          ],
        },
        {
          id: 2,
          title: "Culto de Quarta-feira",
          date: "2025-06-18",
          time: "19:30",
          status: "scheduled",
          preacher: "Pastor Carlos Oliveira",
          theme: "Oração e Intercessão",
          description: "Culto de oração e intercessão pelas famílias",
          songs: [
            {
              id: 4,
              title: "Teu Santo Nome",
              artist: "Gabriela Rocha",
              key: "A",
              bpm: 70,
              duration: "6:00",
            },
            {
              id: 5,
              title: "Lugar Secreto",
              artist: "Gabriela Rocha",
              key: "G",
              bpm: 68,
              duration: "5:30",
            },
          ],
          readings: [
            {
              id: 3,
              title: "Leitura Bíblica",
              reference: "Filipenses 4:6-7",
              text: "Não andeis ansiosos por coisa alguma; antes em tudo sejam os vossos pedidos conhecidos diante de Deus pela oração e súplica com ações de graças...",
            },
          ],
          announcements: [
            {
              id: 3,
              title: "Jejum Congregacional",
              content: "No próximo domingo teremos jejum congregacional",
            },
          ],
        },
      ];
    } catch (error) {
      console.error("Erro ao buscar cultos:", error);
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!isAuthenticated()) {
          router.push("/login");
          return;
        }

        const userRole = getUser();
        if (userRole.role !== "Admin" && userRole.role !== "Pastor") {
          router.push("/dashboard");
          return;
        }

        const worshipData = await fetchWorshipServices();
        setCultos(worshipData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setError(
          "Não foi possível carregar os dados dos cultos. Por favor, tente novamente."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const openEditDialog = (culto: WorshipService | null) => {
    if (culto) {
      setEditingCulto(culto);
      setFormData({
        ...culto,
        songs: [...culto.songs],
        readings: [...culto.readings],
        announcements: [...culto.announcements],
      });
    } else {
      setEditingCulto(null);
      setFormData({
        title: "",
        date: new Date().toISOString().split("T")[0],
        time: "10:00",
        status: "scheduled",
        preacher: "",
        theme: "",
        description: "",
        songs: [],
        readings: [],
        announcements: [],
      });
    }
    setActiveTab("informacoes");
    setIsDialogOpen(true);
  };

  // Função para salvar o culto
  const handleSaveCulto = async () => {
    try {
      // Validar dados obrigatórios
      if (!formData.title || !formData.date || !formData.time) {
        alert(
          "Por favor, preencha os campos obrigatórios: título, data e horário."
        );
        return;
      }

      const savedCulto: WorshipService = {
        id: editingCulto
          ? editingCulto.id
          : Math.floor(Math.random() * 1000) + 3,
        title: formData.title || "Sem título",
        date: formData.date || new Date().toISOString().split("T")[0],
        time: formData.time || "10:00",
        status:
          (formData.status as "scheduled" | "in-progress" | "completed") ||
          "scheduled",
        preacher: formData.preacher || "",
        theme: formData.theme || "",
        description: formData.description || "",
        songs: formData.songs || [],
        readings: formData.readings || [],
        announcements: formData.announcements || [],
      };

      if (editingCulto) {
        setCultos(
          cultos.map((c) => (c.id === editingCulto.id ? savedCulto : c))
        );
      } else {
        setCultos([...cultos, savedCulto]);
      }

      setIsDialogOpen(false);
      setEditingCulto(null);
      setFormData({
        songs: [],
        readings: [],
        announcements: [],
      });

      alert(
        editingCulto
          ? "Culto atualizado com sucesso!"
          : "Culto criado com sucesso!"
      );
    } catch (error) {
      console.error("Erro ao salvar culto:", error);
      alert("Erro ao salvar o culto. Por favor, tente novamente.");
    }
  };

  const handleDeleteCulto = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este culto?")) {
      return;
    }

    try {
      setCultos(cultos.filter((c) => c.id !== id));
      alert("Culto excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir culto:", error);
      alert("Erro ao excluir o culto. Por favor, tente novamente.");
    }
  };

  const addSong = () => {
    if (!newSong.title || !newSong.artist) {
      alert("Por favor, preencha pelo menos o título e o artista da música.");
      return;
    }

    const song: Song = {
      id: Math.floor(Math.random() * 1000) + 100,
      title: newSong.title || "",
      artist: newSong.artist || "",
      key: newSong.key || "C",
      bpm: newSong.bpm || 0,
      duration: newSong.duration || "0:00",
    };

    setFormData({
      ...formData,
      songs: [...(formData.songs || []), song],
    });

    setNewSong({});
  };

  const addReading = () => {
    if (!newReading.title || !newReading.reference) {
      alert(
        "Por favor, preencha pelo menos o título e a referência da leitura."
      );
      return;
    }

    const reading: Reading = {
      id: Math.floor(Math.random() * 1000) + 100,
      title: newReading.title || "",
      reference: newReading.reference || "",
      text: newReading.text || "",
    };

    setFormData({
      ...formData,
      readings: [...(formData.readings || []), reading],
    });

    setNewReading({});
  };

  const addAnnouncement = () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      alert("Por favor, preencha o título e o conteúdo do anúncio.");
      return;
    }

    const announcement: Announcement = {
      id: Math.floor(Math.random() * 1000) + 100,
      title: newAnnouncement.title || "",
      content: newAnnouncement.content || "",
    };

    setFormData({
      ...formData,
      announcements: [...(formData.announcements || []), announcement],
    });

    setNewAnnouncement({});
  };

  const removeSong = (id: number) => {
    setFormData({
      ...formData,
      songs: formData.songs?.filter((s) => s.id !== id) || [],
    });
  };

  const removeReading = (id: number) => {
    setFormData({
      ...formData,
      readings: formData.readings?.filter((r) => r.id !== id) || [],
    });
  };

  const removeAnnouncement = (id: number) => {
    setFormData({
      ...formData,
      announcements: formData.announcements?.filter((a) => a.id !== id) || [],
    });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-gray-500">
            Carregando dados dos cultos...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center p-6">
            <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Erro ao carregar
            </h2>
            <p className="text-gray-600 text-center mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gestão de Cultos
              </h1>
              <p className="text-gray-600">
                Gerencie os cultos e eventos da igreja
              </p>
            </div>
            <Button onClick={() => openEditDialog(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Culto
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="grid gap-4">
              {cultos.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <Calendar className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      Nenhum culto encontrado
                    </h3>
                    <p className="text-gray-600 text-center mb-4">
                      Você ainda não tem nenhum culto cadastrado. Clique no
                      botão abaixo para criar seu primeiro culto.
                    </p>
                    <Button onClick={() => openEditDialog(null)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Culto
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                cultos.map((culto) => (
                  <Card key={culto.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {culto.title}
                            </h3>
                            <Badge
                              variant={
                                culto.status === "completed"
                                  ? "secondary"
                                  : culto.status === "in-progress"
                                  ? "default"
                                  : "outline"
                              }
                              className={
                                culto.status === "in-progress"
                                  ? "bg-green-500 hover:bg-green-600"
                                  : ""
                              }
                            >
                              {culto.status === "completed"
                                ? "Concluído"
                                : culto.status === "in-progress"
                                ? "Em andamento"
                                : "Agendado"}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 mb-3 text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(culto.date)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{culto.time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{culto.preacher}</span>
                            </div>
                          </div>

                          <p className="text-gray-600 mb-4">
                            {culto.description}
                          </p>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="flex items-center gap-2">
                              <Music className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">
                                {culto.songs.length} músicas
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Book className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">
                                {culto.readings.length} leituras
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">
                                {culto.announcements.length} anúncios
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            variant="outline"
                            onClick={() =>
                              router.push(
                                `/dashboard/culto/acompanhar?id=${culto.id}`
                              )
                            }
                          >
                            Acompanhar
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => openEditDialog(culto)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteCulto(culto.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dialog para Criar/Editar Culto */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingCulto(null);
            setFormData({
              songs: [],
              readings: [],
              announcements: [],
            });
          }
        }}
      >
        <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCulto ? "Editar Culto" : "Novo Culto"}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="informacoes">Informações</TabsTrigger>
              <TabsTrigger value="musicas">Músicas</TabsTrigger>
              <TabsTrigger value="leituras">Leituras</TabsTrigger>
              <TabsTrigger value="anuncios">Anúncios</TabsTrigger>
            </TabsList>

            {/* Aba de Informações Gerais */}
            <TabsContent value="informacoes" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título do Culto *</Label>
                  <Input
                    id="title"
                    value={formData.title || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Ex: Culto de Domingo"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status || "scheduled"}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        status: value as
                          | "scheduled"
                          | "in-progress"
                          | "completed",
                      })
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Agendado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Agendado</SelectItem>
                      <SelectItem value="in-progress">Em Andamento</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Data *</Label>
                  <Input
                    type="date"
                    id="date"
                    value={
                      formData.date || new Date().toISOString().split("T")[0]
                    }
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time">Horário *</Label>
                  <Input
                    type="time"
                    id="time"
                    value={formData.time || "10:00"}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="preacher">Pregador</Label>
                <Input
                  id="preacher"
                  value={formData.preacher || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, preacher: e.target.value })
                  }
                  placeholder="Ex: Pastor João Silva"
                />
              </div>

              <div>
                <Label htmlFor="theme">Tema</Label>
                <Input
                  id="theme"
                  value={formData.theme || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, theme: e.target.value })
                  }
                  placeholder="Ex: Fé e Perseverança"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Culto dominical sobre a importância da fé em tempos difíceis"
                />
              </div>
            </TabsContent>

            {/* Aba de Músicas */}
            <TabsContent value="musicas" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newSongTitle">Título da Música</Label>
                  <Input
                    id="newSongTitle"
                    value={newSong.title || ""}
                    onChange={(e) =>
                      setNewSong({ ...newSong, title: e.target.value })
                    }
                    placeholder="Ex: Grande é o Senhor"
                  />
                </div>
                <div>
                  <Label htmlFor="newSongArtist">Artista</Label>
                  <Input
                    id="newSongArtist"
                    value={newSong.artist || ""}
                    onChange={(e) =>
                      setNewSong({ ...newSong, artist: e.target.value })
                    }
                    placeholder="Ex: Adhemar de Campos"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="newSongKey">Tom</Label>
                  <Input
                    id="newSongKey"
                    value={newSong.key || ""}
                    onChange={(e) =>
                      setNewSong({ ...newSong, key: e.target.value })
                    }
                    placeholder="Ex: G"
                  />
                </div>
                <div>
                  <Label htmlFor="newSongBpm">BPM</Label>
                  <Input
                    type="number"
                    id="newSongBpm"
                    value={newSong.bpm || ""}
                    onChange={(e) =>
                      setNewSong({ ...newSong, bpm: Number(e.target.value) })
                    }
                    placeholder="Ex: 75"
                  />
                </div>
                <div>
                  <Label htmlFor="newSongDuration">Duração</Label>
                  <Input
                    id="newSongDuration"
                    value={newSong.duration || ""}
                    onChange={(e) =>
                      setNewSong({ ...newSong, duration: e.target.value })
                    }
                    placeholder="Ex: 4:30"
                  />
                </div>
              </div>

              <Button type="button" onClick={addSong}>
                Adicionar Música
              </Button>

              {formData.songs && formData.songs.length > 0 ? (
                <div className="space-y-2">
                  {formData.songs.map((song) => (
                    <div
                      key={song.id}
                      className="flex items-center justify-between border rounded-md p-2"
                    >
                      <div>
                        {song.title} - {song.artist} ({song.key}, {song.bpm}{" "}
                        BPM, {song.duration})
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeSong(song.id)}
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nenhuma música adicionada.</p>
              )}
            </TabsContent>

            {/* Aba de Leituras */}
            <TabsContent value="leituras" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newReadingTitle">Título da Leitura</Label>
                  <Input
                    id="newReadingTitle"
                    value={newReading.title || ""}
                    onChange={(e) =>
                      setNewReading({ ...newReading, title: e.target.value })
                    }
                    placeholder="Ex: Leitura Inicial"
                  />
                </div>
                <div>
                  <Label htmlFor="newReadingReference">Referência</Label>
                  <Input
                    id="newReadingReference"
                    value={newReading.reference || ""}
                    onChange={(e) =>
                      setNewReading({
                        ...newReading,
                        reference: e.target.value,
                      })
                    }
                    placeholder="Ex: Salmos 23"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="newReadingText">Texto</Label>
                <Textarea
                  id="newReadingText"
                  value={newReading.text || ""}
                  onChange={(e) =>
                    setNewReading({ ...newReading, text: e.target.value })
                  }
                  placeholder="O Senhor é meu pastor, nada me faltará..."
                />
              </div>

              <Button type="button" onClick={addReading}>
                Adicionar Leitura
              </Button>

              {formData.readings && formData.readings.length > 0 ? (
                <div className="space-y-2">
                  {formData.readings.map((reading) => (
                    <div
                      key={reading.id}
                      className="flex items-center justify-between border rounded-md p-2"
                    >
                      <div>
                        {reading.title} - {reading.reference}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeReading(reading.id)}
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nenhuma leitura adicionada.</p>
              )}
            </TabsContent>

            {/* Aba de Anúncios */}
            <TabsContent value="anuncios" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newAnnouncementTitle">
                    Título do Anúncio
                  </Label>
                  <Input
                    id="newAnnouncementTitle"
                    value={newAnnouncement.title || ""}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        title: e.target.value,
                      })
                    }
                    placeholder="Ex: Encontro de Jovens"
                  />
                </div>
                <div>
                  <Label htmlFor="newAnnouncementContent">Conteúdo</Label>
                  <Input
                    id="newAnnouncementContent"
                    value={newAnnouncement.content || ""}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        content: e.target.value,
                      })
                    }
                    placeholder="Ex: No próximo sábado às 19h teremos nosso encontro de jovens"
                  />
                </div>
              </div>

              <Button type="button" onClick={addAnnouncement}>
                Adicionar Anúncio
              </Button>

              {formData.announcements && formData.announcements.length > 0 ? (
                <div className="space-y-2">
                  {formData.announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="flex items-center justify-between border rounded-md p-2"
                    >
                      <div>
                        {announcement.title} - {announcement.content}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeAnnouncement(announcement.id)}
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nenhum anúncio adicionado.</p>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="button" className="ml-2" onClick={handleSaveCulto}>
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
