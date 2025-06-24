"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Music,
  Book,
  MessageSquare,
  Users,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-utils";

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
  attendees: number;
}

interface Song {
  id: number;
  title: string;
  artist: string;
  key: string;
  bpm: number;
  duration: string;
  status: "pending" | "current" | "completed";
}

interface Reading {
  id: number;
  title: string;
  reference: string;
  text: string;
  status: "pending" | "current" | "completed";
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  status: "pending" | "current" | "completed";
}

export default function AcompanharCultoPage() {
  const router = useRouter();
  const [cultoAtual, setCultoAtual] = useState<WorshipService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("musicas");

  // Estado para controlar o item atual em cada seção
  const [currentSongIndex, setCurrentSongIndex] = useState(-1);
  const [currentReadingIndex, setCurrentReadingIndex] = useState(-1);
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(-1);

  // Estado para controlar se o culto está em andamento
  const [isWorshipInProgress, setIsWorshipInProgress] = useState(false);

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

  // Função para buscar o culto atual da API
  const fetchCurrentWorship = async (): Promise<WorshipService | null> => {
    try {
      // Aqui você faria a chamada real para a API
      // const data = await authenticatedFetch("https://demoapp.top1soft.com.br/api/Worship/current")
      // return data

      // Por enquanto, retornamos dados simulados
      return {
        id: 1,
        title: "Culto de Domingo",
        date: "2025-06-15",
        time: "10:00",
        status: "in-progress",
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
            status: "completed",
          },
          {
            id: 2,
            title: "Deus é Fiel",
            artist: "Diante do Trono",
            key: "D",
            bpm: 72,
            duration: "5:15",
            status: "current",
          },
          {
            id: 3,
            title: "Maravilhosa Graça",
            artist: "Ministério Ipiranga",
            key: "E",
            bpm: 68,
            duration: "4:45",
            status: "pending",
          },
          {
            id: 4,
            title: "Teu Santo Nome",
            artist: "Gabriela Rocha",
            key: "A",
            bpm: 70,
            duration: "6:00",
            status: "pending",
          },
        ],
        readings: [
          {
            id: 1,
            title: "Leitura Inicial",
            reference: "Salmos 23",
            text: "O Senhor é meu pastor, nada me faltará...",
            status: "completed",
          },
          {
            id: 2,
            title: "Leitura Principal",
            reference: "Hebreus 11:1-6",
            text: "Ora, a fé é a certeza daquilo que esperamos e a prova das coisas que não vemos...",
            status: "pending",
          },
        ],
        announcements: [
          {
            id: 1,
            title: "Encontro de Jovens",
            content:
              "No próximo sábado às 19h teremos nosso encontro de jovens",
            status: "pending",
          },
          {
            id: 2,
            title: "Campanha de Arrecadação",
            content:
              "Estamos arrecadando alimentos não perecíveis para famílias carentes",
            status: "pending",
          },
        ],
        attendees: 87,
      };
    } catch (error) {
      console.error("Erro ao buscar culto atual:", error);
      throw error;
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Verificar se o usuário está autenticado
        if (!isAuthenticated()) {
          router.push("/login");
          return;
        }

        // Buscar dados do culto atual
        const worshipData = await fetchCurrentWorship();
        setCultoAtual(worshipData);

        // Configurar índices iniciais baseados no status
        if (worshipData) {
          setIsWorshipInProgress(worshipData.status === "in-progress");

          // Encontrar o índice da música atual
          const songIndex = worshipData.songs.findIndex(
            (song) => song.status === "current"
          );
          setCurrentSongIndex(songIndex !== -1 ? songIndex : -1);

          // Encontrar o índice da leitura atual
          const readingIndex = worshipData.readings.findIndex(
            (reading) => reading.status === "current"
          );
          setCurrentReadingIndex(readingIndex !== -1 ? readingIndex : -1);

          // Encontrar o índice do anúncio atual
          const announcementIndex = worshipData.announcements.findIndex(
            (announcement) => announcement.status === "current"
          );
          setCurrentAnnouncementIndex(
            announcementIndex !== -1 ? announcementIndex : -1
          );
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setError(
          "Não foi possível carregar os dados do culto. Por favor, tente novamente."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  // Funções para controlar o fluxo do culto
  const startWorship = () => {
    setIsWorshipInProgress(true);
    // Em uma implementação real, você enviaria uma requisição para a API
    // para atualizar o status do culto
  };

  const pauseWorship = () => {
    setIsWorshipInProgress(false);
    // Em uma implementação real, você enviaria uma requisição para a API
    // para atualizar o status do culto
  };

  // Funções para controlar os itens em cada seção
  const startItem = (
    section: "songs" | "readings" | "announcements",
    index: number
  ) => {
    if (!cultoAtual) return;

    // Atualizar o estado local
    if (section === "songs") {
      setCurrentSongIndex(index);

      // Atualizar o status das músicas
      const updatedSongs = cultoAtual.songs.map((song, i) => ({
        ...song,
        status: i < index ? "completed" : i === index ? "current" : "pending",
      }));

      setCultoAtual({
        ...cultoAtual,
        songs: updatedSongs,
      });
    } else if (section === "readings") {
      setCurrentReadingIndex(index);

      // Atualizar o status das leituras
      const updatedReadings = cultoAtual.readings.map((reading, i) => ({
        ...reading,
        status: i < index ? "completed" : i === index ? "current" : "pending",
      }));

      setCultoAtual({
        ...cultoAtual,
        readings: updatedReadings,
      });
    } else if (section === "announcements") {
      setCurrentAnnouncementIndex(index);

      // Atualizar o status dos anúncios
      const updatedAnnouncements = cultoAtual.announcements.map(
        (announcement, i) => ({
          ...announcement,
          status: i < index ? "completed" : i === index ? "current" : "pending",
        })
      );

      setCultoAtual({
        ...cultoAtual,
        announcements: updatedAnnouncements,
      });
    }

    // Em uma implementação real, você enviaria uma requisição para a API
    // para atualizar o status do item
  };

  const completeItem = (
    section: "songs" | "readings" | "announcements",
    index: number
  ) => {
    if (!cultoAtual) return;

    // Atualizar o estado local
    if (section === "songs") {
      // Marcar a música atual como concluída
      const updatedSongs = cultoAtual.songs.map((song, i) => ({
        ...song,
        status: i <= index ? "completed" : song.status,
      }));

      // Avançar para a próxima música, se houver
      const nextIndex = index + 1;
      if (nextIndex < cultoAtual.songs.length) {
        updatedSongs[nextIndex].status = "current";
        setCurrentSongIndex(nextIndex);
      } else {
        setCurrentSongIndex(-1); // Todas as músicas foram concluídas
      }

      setCultoAtual({
        ...cultoAtual,
        songs: updatedSongs,
      });
    } else if (section === "readings") {
      // Marcar a leitura atual como concluída
      const updatedReadings = cultoAtual.readings.map((reading, i) => ({
        ...reading,
        status: i <= index ? "completed" : reading.status,
      }));

      // Avançar para a próxima leitura, se houver
      const nextIndex = index + 1;
      if (nextIndex < cultoAtual.readings.length) {
        updatedReadings[nextIndex].status = "current";
        setCurrentReadingIndex(nextIndex);
      } else {
        setCurrentReadingIndex(-1); // Todas as leituras foram concluídas
      }

      setCultoAtual({
        ...cultoAtual,
        readings: updatedReadings,
      });
    } else if (section === "announcements") {
      // Marcar o anúncio atual como concluído
      const updatedAnnouncements = cultoAtual.announcements.map(
        (announcement, i) => ({
          ...announcement,
          status: i <= index ? "completed" : announcement.status,
        })
      );

      // Avançar para o próximo anúncio, se houver
      const nextIndex = index + 1;
      if (nextIndex < cultoAtual.announcements.length) {
        updatedAnnouncements[nextIndex].status = "current";
        setCurrentAnnouncementIndex(nextIndex);
      } else {
        setCurrentAnnouncementIndex(-1); // Todos os anúncios foram concluídos
      }

      setCultoAtual({
        ...cultoAtual,
        announcements: updatedAnnouncements,
      });
    }

    // Em uma implementação real, você enviaria uma requisição para a API
    // para atualizar o status do item
  };

  // Renderização condicional para carregamento
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-gray-500">Carregando dados do culto...</p>
        </div>
      </div>
    );
  }

  // Renderização condicional para erro
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center p-6">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
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

  // Renderização condicional para quando não há culto em andamento
  if (!cultoAtual) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <Card className="w-full max-w-2xl mx-auto">
              <CardContent className="flex flex-col items-center p-6">
                <Calendar className="h-16 w-16 text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Nenhum culto em andamento
                </h2>
                <p className="text-gray-600 text-center mb-4">
                  Não há nenhum culto em andamento no momento. Verifique a
                  programação ou volte mais tarde.
                </p>
                <Button onClick={() => router.push("/dashboard/culto")}>
                  Ver programação
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Renderização principal
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge
                variant={isWorshipInProgress ? "default" : "outline"}
                className={
                  isWorshipInProgress ? "bg-green-500 hover:bg-green-600" : ""
                }
              >
                {isWorshipInProgress ? "Em andamento" : "Não iniciado"}
              </Badge>
              {isWorshipInProgress ? (
                <Button variant="outline" size="sm" onClick={pauseWorship}>
                  <Pause className="h-4 w-4 mr-2" />
                  Pausar
                </Button>
              ) : (
                <Button size="sm" onClick={startWorship}>
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Coluna da Esquerda - Informações do Culto */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Informações do Culto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {cultoAtual.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(cultoAtual.date).toLocaleDateString("pt-BR")}
                      </span>
                      <Clock className="h-4 w-4 ml-2" />
                      <span>{cultoAtual.time}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Pregador:</span>
                      <span className="text-sm">{cultoAtual.preacher}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Tema:</span>
                      <span className="text-sm">{cultoAtual.theme}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Presentes:</span>
                      <span className="text-sm">
                        {cultoAtual.attendees} pessoas
                      </span>
                    </div>
                  </div>

                  {cultoAtual.description && (
                    <div className="pt-2">
                      <p className="text-sm text-gray-600">
                        {cultoAtual.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Coluna da Direita - Abas com Músicas, Leituras e Anúncios */}
              <Card className="lg:col-span-2">
                <CardContent className="p-0">
                  <Tabs
                    defaultValue="musicas"
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <TabsList className="w-full grid grid-cols-3">
                      <TabsTrigger
                        value="musicas"
                        className="flex items-center gap-1"
                      >
                        <Music className="h-4 w-4" />
                        <span className="hidden sm:inline">Músicas</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="leituras"
                        className="flex items-center gap-1"
                      >
                        <Book className="h-4 w-4" />
                        <span className="hidden sm:inline">Leituras</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="anuncios"
                        className="flex items-center gap-1"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span className="hidden sm:inline">Anúncios</span>
                      </TabsTrigger>
                    </TabsList>

                    {/* Conteúdo da aba Músicas */}
                    <TabsContent value="musicas" className="p-4">
                      <div className="space-y-4">
                        {cultoAtual.songs.map((song, index) => (
                          <Card
                            key={song.id}
                            className={`
                            ${song.status === "completed" ? "bg-gray-50" : ""}
                            ${
                              song.status === "current"
                                ? "border-green-500 border-2"
                                : ""
                            }
                          `}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold">
                                      {song.title}
                                    </h3>
                                    {song.status === "completed" && (
                                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    )}
                                    {song.status === "current" && (
                                      <Badge className="bg-green-500">
                                        Atual
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {song.artist}
                                  </p>
                                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                    <span>Tom: {song.key}</span>
                                    <span>BPM: {song.bpm}</span>
                                    <span>Duração: {song.duration}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isWorshipInProgress &&
                                    song.status === "pending" && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          startItem("songs", index)
                                        }
                                      >
                                        <Play className="h-3 w-3 mr-1" />
                                        Iniciar
                                      </Button>
                                    )}
                                  {isWorshipInProgress &&
                                    song.status === "current" && (
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          completeItem("songs", index)
                                        }
                                      >
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Concluir
                                      </Button>
                                    )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    {/* Conteúdo da aba Leituras */}
                    <TabsContent value="leituras" className="p-4">
                      <div className="space-y-4">
                        {cultoAtual.readings.map((reading, index) => (
                          <Card
                            key={reading.id}
                            className={`
                            ${
                              reading.status === "completed" ? "bg-gray-50" : ""
                            }
                            ${
                              reading.status === "current"
                                ? "border-green-500 border-2"
                                : ""
                            }
                          `}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold">
                                      {reading.title}
                                    </h3>
                                    {reading.status === "completed" && (
                                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    )}
                                    {reading.status === "current" && (
                                      <Badge className="bg-green-500">
                                        Atual
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm font-medium text-gray-700 mt-1">
                                    {reading.reference}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-2">
                                    {reading.text}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isWorshipInProgress &&
                                    reading.status === "pending" && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          startItem("readings", index)
                                        }
                                      >
                                        <Play className="h-3 w-3 mr-1" />
                                        Iniciar
                                      </Button>
                                    )}
                                  {isWorshipInProgress &&
                                    reading.status === "current" && (
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          completeItem("readings", index)
                                        }
                                      >
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Concluir
                                      </Button>
                                    )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    {/* Conteúdo da aba Anúncios */}
                    <TabsContent value="anuncios" className="p-4">
                      <div className="space-y-4">
                        {cultoAtual.announcements.map((announcement, index) => (
                          <Card
                            key={announcement.id}
                            className={`
                            ${
                              announcement.status === "completed"
                                ? "bg-gray-50"
                                : ""
                            }
                            ${
                              announcement.status === "current"
                                ? "border-green-500 border-2"
                                : ""
                            }
                          `}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold">
                                      {announcement.title}
                                    </h3>
                                    {announcement.status === "completed" && (
                                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    )}
                                    {announcement.status === "current" && (
                                      <Badge className="bg-green-500">
                                        Atual
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {announcement.content}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isWorshipInProgress &&
                                    announcement.status === "pending" && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          startItem("announcements", index)
                                        }
                                      >
                                        <Play className="h-3 w-3 mr-1" />
                                        Iniciar
                                      </Button>
                                    )}
                                  {isWorshipInProgress &&
                                    announcement.status === "current" && (
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          completeItem("announcements", index)
                                        }
                                      >
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Concluir
                                      </Button>
                                    )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
