"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Book,
  Clock,
  Bug,
  BookOpen,
  AlertCircle,
  RefreshCw,
  Database,
  Hash,
} from "lucide-react";
import { useSignalR } from "../useSignalR";
import { getBibleReading } from "@/lib/bible-api";

interface BibleReading {
  id: string;
  versionId: number;
  bookId: number;
  chapterId: number;
  verseId?: number;
  text: string;
  book: string;
  chapter: number;
  chapterNumber?: number;
  verse?: number;
  verseNumber?: number;
  version: string;
  timestamp: Date;
  isFullChapter: boolean;
  error?: boolean;
  originalData?: any;
  chapterInfo?: any;
}

export default function CultoPage() {
  const [readings, setReadings] = useState<BibleReading[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  // Usar o hook SignalR
  useSignalR(1);

  // Função para adicionar info de debug
  const addDebugInfo = (info: string) => {
    console.log("📝 Debug info:", info);
    setDebugInfo((prev) => [
      `${new Date().toLocaleTimeString()}: ${info}`,
      ...prev.slice(0, 8),
    ]);
  };

  // Função para buscar leitura bíblica da API real
  const fetchBibleReading = async (
    versionId: number,
    bookId: number,
    chapterId: number,
    verseId?: number,
    originalData?: any
  ) => {
    console.log("🔍 fetchBibleReading chamada com parâmetros:");
    console.log("   versionId:", versionId);
    console.log("   bookId:", bookId);
    console.log("   chapterId:", chapterId);
    console.log("   verseId:", verseId);
    console.log("   originalData:", originalData);

    setIsLoading(true);
    const isFullChapter = !verseId;

    const debugMessage = isFullChapter
      ? `Buscando: V${versionId}, L${bookId}, C${chapterId} (completo)`
      : `Buscando: V${versionId}, L${bookId}, C${chapterId}:${verseId}`;

    addDebugInfo(debugMessage);

    try {
      const bibleData = await getBibleReading(
        versionId,
        bookId,
        chapterId,
        verseId
      );
      console.log("📖 Resultado completo da busca bíblica:", bibleData);

      if (bibleData.success) {
        let text = "Texto não disponível";
        let verseNumber = verseId;

        if (isFullChapter && Array.isArray(bibleData.content)) {
          text =
            bibleData.content
              .slice(0, 3)
              .map((v: any) => v.text)
              .join(" ") + "...";
        } else if (bibleData.content?.text) {
          text = bibleData.content.text;
          verseNumber = bibleData.content.verseNumber || verseId;
        }

        const newReading: BibleReading = {
          id: `${versionId}-${bookId}-${chapterId}-${
            verseId || "full"
          }-${Date.now()}`,
          versionId,
          bookId,
          chapterId,
          verseId,
          text,
          book: bibleData.bookName,
          chapter: bibleData.chapterNumber || chapterId,
          chapterNumber: bibleData.chapterNumber,
          verse: verseId,
          verseNumber,
          version: bibleData.versionName,
          timestamp: new Date(),
          isFullChapter,
          originalData,
          chapterInfo: bibleData.chapterInfo,
        };

        console.log("✅ Nova leitura criada:", newReading);
        setReadings((prev) => [newReading, ...prev]);

        const successMessage = isFullChapter
          ? `✅ Capítulo carregado: ${bibleData.versionName} - ${
              bibleData.bookName
            } ${bibleData.chapterNumber || chapterId}`
          : `✅ Versículo carregado: ${bibleData.versionName} - ${
              bibleData.bookName
            } ${bibleData.chapterNumber || chapterId}:${verseNumber}`;

        addDebugInfo(successMessage);
      } else {
        throw new Error(bibleData.error || "Erro desconhecido na API");
      }
    } catch (error) {
      console.error("❌ Erro ao buscar leitura bíblica:", error);
      console.error("❌ Stack trace:", (error as Error).stack);

      const errorReading: BibleReading = {
        id: `error-${versionId}-${bookId}-${chapterId}-${
          verseId || "full"
        }-${Date.now()}`,
        versionId,
        bookId,
        chapterId,
        verseId,
        text: "Erro ao carregar o texto bíblico. Verifique sua conexão ou autenticação.",
        book: `Livro ${bookId}`,
        chapter: chapterId,
        verse: verseId,
        version: `Versão ${versionId}`,
        timestamp: new Date(),
        isFullChapter,
        error: true,
        originalData,
      };

      console.log("❌ Leitura de erro criada:", errorReading);
      setReadings((prev) => [errorReading, ...prev]);
      addDebugInfo(`❌ Erro: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
      console.log("🏁 fetchBibleReading finalizada");
    }
  };

  // Exemplos de teste com versões
  const testReadings = [
    { versionId: 1, bookId: 1, chapterId: 1, verseId: 1, name: "V1 - Gn 1:1" },
    {
      versionId: 1,
      bookId: 43,
      chapterId: 3,
      verseId: 16,
      name: "V1 - Jo 3:16",
    },
    {
      versionId: 2,
      bookId: 67,
      chapterId: 1190,
      verseId: 31120,
      name: "V2 - Gn 1:15",
    },
  ];

  const testChapters = [
    { versionId: 1, bookId: 1, chapterId: 1, name: "V1 - Gn 1" },
    { versionId: 2, bookId: 67, chapterId: 1190, name: "V2 - Gn 1" },
  ];

  // Escutar eventos do SignalR globalmente
  useEffect(() => {
    console.log("👂 Configurando listener para eventos de leitura bíblica...");

    const handleBibleReading = (event: CustomEvent) => {
      console.log("🎯 ===== EVENTO CUSTOMIZADO RECEBIDO NA PÁGINA =====");
      console.log("🎯 Event detail:", event.detail);

      const {
        versionId,
        bookId,
        chapterId,
        verseId,
        isFullChapter,
        apiData,
        error,
        originalData,
      } = event.detail;

      const eventMessage = `📡 Evento: V${versionId}, L${bookId}, C${chapterId}${
        verseId ? `:${verseId}` : " (completo)"
      }`;
      console.log(eventMessage);
      addDebugInfo(eventMessage);

      if (apiData) {
        console.log(
          "✅ Evento já tem dados da API, processando diretamente..."
        );
        console.log("📊 API Data:", apiData);

        let text = "Texto não disponível";
        let verseNumber = verseId;

        if (isFullChapter && Array.isArray(apiData.content)) {
          text =
            apiData.content
              .slice(0, 3)
              .map((v: any) => v.text)
              .join(" ") + "...";
        } else if (apiData.content?.text) {
          text = apiData.content.text;
          verseNumber = apiData.content.verseNumber || verseId;
        }

        const bookName = apiData.bookName || `Livro ${bookId}`;
        const versionName = apiData.versionName || `Versão ${versionId}`;
        const chapterNumber = apiData.chapterNumber || chapterId;

        console.log("📖 Dados extraídos:");
        console.log("   text:", text);
        console.log("   bookName:", bookName);
        console.log("   versionName:", versionName);
        console.log("   chapterNumber:", chapterNumber);
        console.log("   verseNumber:", verseNumber);

        const newReading: BibleReading = {
          id: `${versionId}-${bookId}-${chapterId}-${
            verseId || "full"
          }-${Date.now()}`,
          versionId,
          bookId,
          chapterId,
          verseId,
          text,
          book: bookName,
          chapter: chapterNumber,
          chapterNumber,
          verse: verseId,
          verseNumber,
          version: versionName,
          timestamp: new Date(),
          isFullChapter,
          error: false,
          originalData,
          chapterInfo: apiData.chapterInfo,
        };

        console.log("✅ Nova leitura criada diretamente:", newReading);
        setReadings((prev) => [newReading, ...prev]);
        addDebugInfo(
          `✅ Leitura adicionada: ${versionName} - ${bookName} ${chapterNumber}`
        );
      } else if (error) {
        console.log("❌ Evento tem erro, criando leitura de erro...");

        const errorReading: BibleReading = {
          id: `error-${versionId}-${bookId}-${chapterId}-${
            verseId || "full"
          }-${Date.now()}`,
          versionId,
          bookId,
          chapterId,
          verseId,
          text: "Erro ao carregar o texto bíblico. Verifique sua conexão ou autenticação.",
          book: `Livro ${bookId}`,
          chapter: chapterId,
          verse: verseId,
          version: `Versão ${versionId}`,
          timestamp: new Date(),
          isFullChapter,
          error: true,
          originalData,
        };

        console.log("❌ Leitura de erro criada:", errorReading);
        setReadings((prev) => [errorReading, ...prev]);
        addDebugInfo(`❌ Erro no evento SignalR`);
      } else {
        console.log("🔍 Evento não tem dados nem erro, buscando na API...");
        fetchBibleReading(versionId, bookId, chapterId, verseId, originalData);
      }

      console.log("🎯 ===== FIM DO PROCESSAMENTO DO EVENTO NA PÁGINA =====");
    };

    window.addEventListener(
      "bibleReadingHighlighted",
      handleBibleReading as EventListener
    );

    return () => {
      console.log("👂 Removendo listener de eventos de leitura bíblica...");
      window.removeEventListener(
        "bibleReadingHighlighted",
        handleBibleReading as EventListener
      );
    };
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Acompanhar Culto</h1>
          <p className="text-gray-600">
            Acompanhe as leituras bíblicas em tempo real
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Versículos específicos */}
          {testReadings.map((test) => (
            <Button
              key={`${test.versionId}-${test.bookId}-${test.chapterId}-${test.verseId}`}
              onClick={() => {
                console.log("🔘 Botão de teste clicado:", test);
                fetchBibleReading(
                  test.versionId,
                  test.bookId,
                  test.chapterId,
                  test.verseId
                );
              }}
              variant="outline"
              size="sm"
              disabled={isLoading}
              title={`Testar: Versão ${test.versionId}, Livro ${test.bookId}, Capítulo ${test.chapterId}, Versículo ${test.verseId}`}
            >
              <Book className="h-4 w-4 mr-2" />
              {test.name}
            </Button>
          ))}

          {/* Capítulos completos */}
          {testChapters.map((test) => (
            <Button
              key={`${test.versionId}-${test.bookId}-${test.chapterId}`}
              onClick={() => {
                console.log("🔘 Botão de capítulo clicado:", test);
                fetchBibleReading(test.versionId, test.bookId, test.chapterId);
              }}
              variant="secondary"
              size="sm"
              disabled={isLoading}
              title={`Testar: Versão ${test.versionId}, Livro ${test.bookId}, Capítulo ${test.chapterId} completo`}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              {test.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Status de conexão */}
      <div className="mb-4 flex items-center gap-2 text-sm">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-gray-600">
          Conectado ao sistema de leitura bíblica
        </span>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card className="mb-4">
          <CardContent className="p-4 flex items-center justify-center">
            <RefreshCw className="h-5 w-5 mr-2 animate-spin text-blue-500" />
            <span>Carregando texto bíblico...</span>
          </CardContent>
        </Card>
      )}

      {/* Debug Info */}
      {debugInfo.length > 0 && (
        <Card className="mb-4 bg-gray-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Bug className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Debug Info (Console tem mais detalhes)
              </span>
            </div>
            <div className="space-y-1">
              {debugInfo.map((info, index) => (
                <p key={index} className="text-xs text-gray-600 font-mono">
                  {info}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de leituras */}
      <div className="space-y-4">
        {readings.length === 0 && !isLoading ? (
          <Card>
            <CardContent className="p-4 text-center">
              <Book className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Aguardando leituras bíblicas...</p>
              <p className="text-xs text-gray-400 mt-1">
                Use os botões acima para testar versículos ou capítulos
              </p>
            </CardContent>
          </Card>
        ) : (
          readings.map((reading, index) => (
            <Card
              key={reading.id}
              className={`mb-4 ${index === 0 ? "ring-2 ring-blue-200" : ""} ${
                reading.error ? "border-red-200" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    {reading.error ? (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    ) : reading.isFullChapter ? (
                      <BookOpen className="h-4 w-4 text-purple-600" />
                    ) : (
                      <Book className="h-4 w-4 text-blue-600" />
                    )}
                    <span
                      className={`font-medium ${
                        reading.error ? "text-red-600" : ""
                      }`}
                    >
                      {reading.version} - {reading.book} {reading.chapter}
                      {reading.isFullChapter
                        ? " (capítulo completo)"
                        : `:${reading.verseNumber || reading.verse}`}
                    </span>
                    {index === 0 && (
                      <Badge variant="secondary" className="text-xs">
                        Mais recente
                      </Badge>
                    )}
                    {reading.isFullChapter && !reading.error && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-purple-50 text-purple-700"
                      >
                        Capítulo
                      </Badge>
                    )}
                    {reading.error && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-red-50 text-red-700"
                      >
                        Erro
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className="text-xs bg-blue-50 text-blue-700"
                    >
                      <Database className="h-3 w-3 mr-1" />V{reading.versionId}
                    </Badge>
                    {reading.verseNumber && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-green-50 text-green-700"
                      >
                        <Hash className="h-3 w-3 mr-1" />
                        {reading.verseNumber}
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {reading.timestamp.toLocaleTimeString()}
                  </Badge>
                </div>
                <p
                  className={`text-gray-700 border-l-2 pl-3 italic ${
                    reading.error
                      ? "border-red-300 text-red-600"
                      : reading.isFullChapter
                      ? "border-purple-200"
                      : "border-blue-200"
                  }`}
                >
                  "{reading.text}"
                </p>
                {reading.originalData && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer">
                      Dados originais do SignalR
                    </summary>
                    <pre className="text-xs text-gray-600 mt-1 bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(reading.originalData, null, 2)}
                    </pre>
                  </details>
                )}
                {reading.chapterInfo && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer">
                      Informações do capítulo
                    </summary>
                    <pre className="text-xs text-gray-600 mt-1 bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(reading.chapterInfo, null, 2)}
                    </pre>
                  </details>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
