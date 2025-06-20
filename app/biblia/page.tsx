"use client";
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BibleBook,
  bibleService,
  BibleVerse,
  GeminiModalProps,
  TooltipState,
} from "@/services/biblia/biblia";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sun,
  Moon,
  Loader2,
  ArrowLeft,
  Copy, // Novo ícone
  Share2, // Novo ícone
  Bot, // Ícone placeholder para Gemini
  X,
  Sparkles, // Ícone para fechar tooltip
} from "lucide-react";
import { useSwipeable } from "react-swipeable";
import { useRouter } from "next/navigation";
import ReactDOM from "react-dom"; // Importar ReactDOM para Portals

export default function BiblePage() {
  const [versionId, setVersionId] = useState<number | undefined>();
  const [book, setBook] = useState<BibleBook | undefined>();
  const [chapter, setChapter] = useState<number>(1);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null); // Estado para o tooltip
  const [geminiExplanation, setGeminiExplanation] = useState<string | null>(
    null
  ); // Estado para a explicação do Gemini
  const [isGeminiLoading, setIsGeminiLoading] = useState(false); // Estado para o loading do Gemini
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState(false);
  const [geminiFullResponse, setGeminiFullResponse] = useState<{
    explanation: string;
    context: string;
    application: string;
  } | null>(null);
  const router = useRouter();
  const mainContentRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null); // Ref para o próprio tooltip

  // Toggle Dark Mode: Aplicar a classe 'dark' ao <html> e salvar preferência
  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // Carregar preferência de tema do localStorage na montagem
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
    }
  }, []);

  // Fechar tooltip ao clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setTooltip(null);
        setGeminiExplanation(null); // Limpa a explicação do Gemini
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [tooltipRef]);

  // 1. Buscar versões
  const { data: versions = [], isLoading: isLoadingVersions } = useQuery({
    queryKey: ["bible-versions"],
    queryFn: bibleService.getVersions,
    staleTime: 1000 * 60 * 10, // 10 minutos de cache
  });

  // Define a primeira versão como padrão se não houver nenhuma selecionada
  useEffect(() => {
    if (versions.length && !versionId) {
      setVersionId(versions[0].id);
    }
  }, [versions, versionId]);

  // 2. Buscar livros da versão
  const { data: books = [], isLoading: isLoadingBooks } = useQuery({
    queryKey: ["bible-books", versionId],
    queryFn: () =>
      versionId
        ? bibleService.getBooksByVersion(versionId)
        : Promise.resolve([]),
    enabled: !!versionId, // Só executa se versionId estiver definido
    staleTime: 1000 * 60 * 10, // 10 minutos de cache
  });

  // Define o primeiro livro como padrão para a versão selecionada ou ajusta se o livro atual não existir na nova versão
  useEffect(() => {
    if (books.length && !book) {
      setBook(books[0]);
    } else if (book && !books.some((b) => b.id === book.id)) {
      setBook(books[0]); // Seleciona o primeiro livro da nova versão
    }
  }, [books, book]);

  // 3. Buscar capítulos do livro
  const { data: chapters = [], isLoading: isLoadingChapters } = useQuery({
    queryKey: ["bible-chapters", book?.id],
    queryFn: () =>
      book ? bibleService.getChaptersByBookId(book.id) : Promise.resolve([]),
    enabled: !!book, // Só executa se book estiver definido
    staleTime: 1000 * 60 * 10, // 10 minutos de cache
  });

  // Ajusta o capítulo quando o livro muda ou os capítulos são carregados
  useEffect(() => {
    if (book && chapters.length > 0) {
      // Se o capítulo atual for inválido para o novo livro, volte para o capítulo 1
      if (chapter > chapters.length || chapter < 1) {
        setChapter(1);
      }
    } else if (book && chapters.length === 0) {
      setChapter(1); // Caso o livro não tenha capítulos, mantenha 1 ou considere um estado de "indisponível"
    }
  }, [book, chapters, chapter]);

  // 4. Buscar versículos do capítulo
  const chapterId = useMemo(
    () => chapters.find((c) => c.chapterNumber === chapter)?.id,
    [chapters, chapter]
  );

  const { data: verses = [], isLoading: isLoadingVerses } = useQuery<
    BibleVerse[]
  >({
    queryKey: ["bible-verses", chapterId],
    queryFn: () =>
      chapterId
        ? bibleService.getVersesByChapterId(chapterId)
        : Promise.resolve([]),
    enabled: !!chapterId,
    staleTime: 0, // Sempre buscar fresco
  });

  // Side-effect: rolar pro topo e limpar tooltip/explicação ao trocar de capítulo
  useEffect(() => {
    if (verses) {
      mainContentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      setTooltip(null);
      setGeminiExplanation(null);
    }
  }, [verses]);

  const currentChapterIndex = useMemo(
    () => chapters.findIndex((c) => c.chapterNumber === chapter),
    [chapters, chapter]
  );
  const totalChapters = chapters.length;

  const handleNextChapter = useCallback(async () => {
    if (isLoadingChapters || isLoadingVerses) return;

    if (currentChapterIndex < totalChapters - 1) {
      setChapter((prev) => prev + 1);
    } else {
      const currentBookIndex = books.findIndex((b) => b.id === book?.id);
      if (currentBookIndex < books.length - 1) {
        const nextBook = books[currentBookIndex + 1];
        setBook(nextBook);
        setChapter(1);
      }
    }
  }, [
    isLoadingChapters,
    isLoadingVerses,
    currentChapterIndex,
    totalChapters,
    books,
    book,
    setBook,
    setChapter,
  ]);

  const handlePrevChapter = useCallback(async () => {
    if (isLoadingChapters || isLoadingVerses) return;

    if (currentChapterIndex > 0) {
      setChapter((prev) => prev - 1);
    } else {
      const currentBookIndex = books.findIndex((b) => b.id === book?.id);
      if (currentBookIndex > 0) {
        const prevBook = books[currentBookIndex - 1];
        setBook(prevBook);
        const prevBookChapters = await bibleService.getChaptersByBookId(
          prevBook.id
        );
        if (prevBookChapters.length > 0) {
          setChapter(
            prevBookChapters[prevBookChapters.length - 1].chapterNumber
          );
        } else {
          setChapter(1);
        }
      }
    }
  }, [
    isLoadingChapters,
    isLoadingVerses,
    currentChapterIndex,
    books,
    book,
    setBook,
    setChapter,
  ]);

  // Hook para detecção de swipe
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (!isLoadingChapters && !isLoadingVerses) {
        handleNextChapter();
      }
    },
    onSwipedRight: () => {
      if (!isLoadingChapters && !isLoadingVerses) {
        handlePrevChapter();
      }
    },
    preventScrollOnSwipe: true,
    trackMouse: true,
    delta: 50,
  });

  const showGlobalLoading =
    isLoadingVersions || isLoadingBooks || isLoadingChapters;

  // --- Funções do Tooltip ---

  const handleVerseClick = (
    event: React.MouseEvent<HTMLParagraphElement>,
    verseId: number,
    text: string,
    verseObj: BibleVerse
  ) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();

    // Abreviação e referência
    const verseReference =
      book && chapter
        ? `${book.abbreviation} ${chapter}:${verseObj.verseNumber}`
        : "";

    setTooltip({
      verseId,
      text,
      verseText: text,
      x: rect.left + window.scrollX + rect.width / 2,
      y: rect.top + window.scrollY - 10,
      width: rect.width,
      height: rect.height,
      verseReference,
    });
    setGeminiExplanation(null);
  };

  const handleCopy = async () => {
    if (tooltip?.text) {
      try {
        await navigator.clipboard.writeText(tooltip.text);
        alert("Versículo copiado!");
      } catch (err) {
        console.error("Falha ao copiar texto: ", err);
        alert("Erro ao copiar o versículo.");
      }
    }
    setTooltip(null);
  };

  const handleShare = async () => {
    if (tooltip && book && chapter) {
      try {
        const reference = `${book.name} ${chapter}:${tooltip.verseId}`;
        const textToShare = `${reference} — ${tooltip.text}`;
        if (navigator.share) {
          await navigator.share({
            title: `Bíblia - ${reference}`,
            text: textToShare,
            url: window.location.href,
          });
        } else {
          prompt("Copie para compartilhar:", textToShare);
        }
      } catch (err: any) {
        if (
          typeof err === "object" &&
          err !== null &&
          "message" in err &&
          (err as any).message === "Share canceled"
        ) {
        } else {
          console.error("Erro ao compartilhar: ", err);
        }
      }
    }
    setTooltip(null);
  };

  const handleExplainWithGemini = async () => {
    if (tooltip?.text && tooltip?.verseReference) {
      setIsGeminiLoading(true);
      setGeminiExplanation(null);
      try {
        const resp = await bibleService.explainWithGemini(
          tooltip.text,
          tooltip.verseReference
        );
        setGeminiFullResponse(resp);
        setIsGeminiModalOpen(true);
        setTooltip(null); // FECHA TOOLTIP AO ABRIR O MODAL
      } catch (error) {
        setGeminiFullResponse(null);
        setIsGeminiModalOpen(false);
        setGeminiExplanation(
          "Não foi possível obter uma explicação no momento. Tente novamente mais tarde."
        );
      } finally {
        setIsGeminiLoading(false);
      }
    }
  };

  // Componente Tooltip (usando Portal)
  const TooltipPortal = ({ children }: { children: React.ReactNode }) => {
    // Certifica-se de que o elemento `body` existe antes de criar o portal
    if (typeof window === "undefined") return null;
    const body = document.querySelector("body");
    if (!body) return null;
    return ReactDOM.createPortal(children, body);
  };

  function GeminiModal({
    open,
    onClose,
    data,
    isLoading = false, // Default para false
  }: GeminiModalProps) {
    if (!open) return null;

    return (
      // Overlay de fundo: fecha ao clicar fora do modal
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Conteúdo do Modal: NÃO fecha ao clicar dentro */}
        <div
          className="bg-white dark:bg-gray-900 rounded-2xl max-w-sm md:max-w-lg lg:max-w-2xl w-full p-6 sm:p-8 shadow-3xl border border-gray-200 dark:border-gray-700 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Botão de fechar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 z-10"
            aria-label="Fechar"
            title="Fechar explicação"
          >
            <X size={24} />
          </button>

          {/* Cabeçalho do Modal */}
          <h2 className="flex items-center gap-2 text-2xl font-extrabold mb-6 text-blue-700 dark:text-blue-400">
            <Sparkles
              size={28}
              className="text-yellow-500 dark:text-yellow-400"
            />
            Explicação do Versículo
          </h2>

          {/* Conteúdo do Modal */}
          <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-2">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 text-blue-600 dark:text-blue-400">
                <Loader2 className="h-10 w-10 animate-spin mb-4" />
                <p className="text-lg font-medium">Gerando explicação...</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Isso pode levar alguns segundos.
                </p>
              </div>
            ) : !data ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                <p className="text-lg font-medium mb-2">
                  Nenhuma explicação disponível.
                </p>
                <p className="text-sm">Por favor, tente novamente.</p>
              </div>
            ) : (
              <>
                {/* Seção Explicação */}
                <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                  <span className="block font-semibold mb-2 text-gray-800 dark:text-gray-200 text-lg">
                    Explicação:
                  </span>
                  <p className="text-base text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                    {data.explanation}
                  </p>
                </div>
                {/* Seção Contexto */}
                <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                  <span className="block font-semibold mb-2 text-gray-800 dark:text-gray-200 text-lg">
                    Contexto:
                  </span>
                  <p className="text-base text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                    {data.context}
                  </p>
                </div>
                {/* Seção Aplicação */}
                <div>
                  <span className="block font-semibold mb-2 text-gray-800 dark:text-gray-200 text-lg">
                    Aplicação:
                  </span>
                  <p className="text-base text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                    {data.application}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      {...handlers}
      className="relative min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-sans overflow-x-hidden"
    >
      {/* Botões Flutuantes Laterais (Desktop Only) */}
      <button
        onClick={handlePrevChapter}
        disabled={
          isLoadingChapters ||
          isLoadingVerses ||
          (currentChapterIndex === 0 &&
            books.findIndex((b) => b.id === book?.id) === 0)
        }
        className="hidden lg:flex fixed left-4 top-1/2 -translate-y-1/2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-200 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed z-30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        aria-label="Capítulo anterior"
        title="Capítulo anterior"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={handleNextChapter}
        disabled={
          isLoadingChapters ||
          isLoadingVerses ||
          (currentChapterIndex === totalChapters - 1 &&
            books.findIndex((b) => b.id === book?.id) === books.length - 1)
        }
        className="hidden lg:flex fixed right-4 top-1/2 -translate-y-1/2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-200 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed z-30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        aria-label="Próximo capítulo"
        title="Próximo capítulo"
      >
        <ChevronRight size={24} />
      </button>

      {/* Header com controles de navegação fixos */}
      <header className="sticky top-0 z-20 bg-white dark:bg-gray-900 shadow-md p-4 flex flex-col md:flex-row items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Botão de voltar */}
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            aria-label="Voltar para a página anterior"
            title="Voltar"
          >
            <ArrowLeft className="text-gray-600 dark:text-gray-300" size={24} />
          </button>

          <BookOpen className="text-blue-700 dark:text-blue-400" size={32} />
          <h1 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 hidden sm:block">
            Leitor da Bíblia
          </h1>
        </div>

        <div className="flex flex-wrap justify-center md:justify-end items-center gap-3 w-full md:w-auto">
          {/* Seleção de versão */}
          <div className="relative flex-grow min-w-[140px]">
            <label htmlFor="version-select" className="sr-only">
              Selecionar Versão
            </label>
            <select
              id="version-select"
              value={versionId || ""}
              onChange={(e) => {
                setVersionId(Number(e.target.value));
                setBook(undefined);
                setChapter(1);
              }}
              className="w-full p-2.5 pr-8 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-base focus:ring-blue-600 focus:border-blue-600 appearance-none transition-colors duration-200 ease-in-out cursor-pointer shadow-sm"
              disabled={isLoadingVersions}
              aria-live="polite"
            >
              {isLoadingVersions ? (
                <option value="">Carregando versões...</option>
              ) : (
                versions.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))
              )}
            </select>
            {isLoadingVersions && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400 dark:text-gray-500" />
            )}
          </div>

          {/* Seleção de livro */}
          <div className="relative flex-grow min-w-[160px]">
            <label htmlFor="book-select" className="sr-only">
              Selecionar Livro
            </label>
            <select
              id="book-select"
              value={book?.id || ""}
              onChange={(e) => {
                const newBook = books.find(
                  (b) => b.id === Number(e.target.value)
                );
                setBook(newBook);
                setChapter(1);
              }}
              className="w-full p-2.5 pr-8 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-base focus:ring-blue-600 focus:border-blue-600 appearance-none transition-colors duration-200 ease-in-out cursor-pointer shadow-sm"
              disabled={isLoadingBooks || !versionId}
              aria-live="polite"
            >
              {isLoadingBooks ? (
                <option value="">Carregando livros...</option>
              ) : !versionId ? (
                <option value="">Selecione uma versão</option>
              ) : (
                books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.abbreviation})
                  </option>
                ))
              )}
            </select>
            {isLoadingBooks && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400 dark:text-gray-500" />
            )}
          </div>

          {/* Navegação de capítulo */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevChapter}
              disabled={
                isLoadingChapters ||
                isLoadingVerses ||
                (currentChapterIndex === 0 &&
                  books.findIndex((b) => b.id === book?.id) === 0)
              }
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all duration-200 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              aria-label="Capítulo anterior"
              title="Capítulo anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="relative min-w-[80px]">
              <label htmlFor="chapter-select" className="sr-only">
                Selecionar Capítulo
              </label>
              <select
                id="chapter-select"
                value={chapter}
                onChange={(e) => setChapter(Number(e.target.value))}
                className="w-full p-2.5 pr-8 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-base focus:ring-blue-600 focus:border-blue-600 appearance-none transition-colors duration-200 ease-in-out cursor-pointer shadow-sm"
                disabled={isLoadingChapters || !book}
                aria-live="polite"
              >
                {isLoadingChapters ? (
                  <option value="">...</option>
                ) : !book ? (
                  <option value="">Capítulo</option>
                ) : (
                  chapters.map((c) => (
                    <option key={c.id} value={c.chapterNumber}>
                      Cap. {c.chapterNumber}
                    </option>
                  ))
                )}
              </select>
              {isLoadingChapters && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400 dark:text-gray-500" />
              )}
            </div>
            <button
              onClick={handleNextChapter}
              disabled={
                isLoadingChapters ||
                isLoadingVerses ||
                (currentChapterIndex === totalChapters - 1 &&
                  books.findIndex((b) => b.id === book?.id) ===
                    books.length - 1)
              }
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all duration-200 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              aria-label="Próximo capítulo"
              title="Próximo capítulo"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Toggle Dark Mode */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            aria-label="Alternar modo de cor"
            title="Alternar modo de cor"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Conteúdo principal da Bíblia */}
      <main
        ref={mainContentRef}
        className="flex-grow p-4 md:p-6 max-w-4xl mx-auto w-full overflow-y-auto"
      >
        {showGlobalLoading && (
          <div className="flex items-center justify-center py-8 text-blue-600 dark:text-blue-400 animate-pulse">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            <span className="text-lg font-medium">Carregando dados...</span>
          </div>
        )}

        {!showGlobalLoading && (book || versionId) && (
          <div className="mb-6 text-center text-gray-700 dark:text-gray-300 text-xl md:text-2xl font-bold leading-tight">
            <span className="block text-base font-semibold text-gray-500 dark:text-gray-400 mb-1">
              {versions.find((v) => v.id === versionId)?.name}
            </span>
            <span className="block">
              {book && book.name}
              {book && chapter && ` - Capítulo ${chapter}`}
            </span>
          </div>
        )}

        {/* Área de exibição dos versículos */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 sm:p-8 space-y-5 text-lg leading-relaxed border border-gray-200 dark:border-gray-700 relative min-h-[200px]">
          {isLoadingVerses && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-900 bg-opacity-80 dark:bg-opacity-80 z-10 rounded-xl">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400 mb-4" />
              <p className="text-center text-gray-600 dark:text-gray-400 font-medium">
                Carregando versículos...
              </p>
            </div>
          )}

          {!isLoadingVerses && verses.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <p className="text-xl font-medium mb-2">
                Nenhum versículo encontrado.
              </p>
              <p className="text-base">
                Verifique a seleção do livro e capítulo.
              </p>
            </div>
          )}

          {!isLoadingVerses && verses.length > 0 && (
            <article className="prose prose-lg dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
              {verses.map((v) => (
                <p
                  key={v.id}
                  className="mb-4 last:mb-0 indent-0 text-justify relative
                             group cursor-pointer p-2 rounded-md transition-all duration-150 ease-in-out
                             hover:bg-blue-100/50 dark:hover:bg-blue-900/40" // Destaque ao passar o mouse
                  onClick={(e) => handleVerseClick(e, v.verseNumber, v.text, v)}
                >
                  <sup className="font-bold text-blue-700 dark:text-blue-400 mr-2 text-base select-none">
                    {v.verseNumber}
                  </sup>
                  {v.text}
                </p>
              ))}
            </article>
          )}
        </div>

        {/* Bloco de Navegação no Final do Conteúdo */}
        {!showGlobalLoading && book && totalChapters > 0 && (
          <div className="mt-8 mb-4 flex justify-center items-center gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-inner border border-gray-200 dark:border-gray-700 mx-auto max-w-sm md:max-w-md">
            <button
              onClick={handlePrevChapter}
              disabled={
                isLoadingChapters ||
                isLoadingVerses ||
                (currentChapterIndex === 0 &&
                  books.findIndex((b) => b.id === book?.id) === 0)
              }
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all duration-200 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              aria-label="Capítulo anterior"
              title="Capítulo anterior"
            >
              <ChevronLeft size={24} />
            </button>
            <span className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Capítulo {chapter} de {totalChapters}
            </span>
            <button
              onClick={handleNextChapter}
              disabled={
                isLoadingChapters ||
                isLoadingVerses ||
                (currentChapterIndex === totalChapters - 1 &&
                  books.findIndex((b) => b.id === book?.id) ===
                    books.length - 1)
              }
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all duration-200 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              aria-label="Próximo capítulo"
              title="Próximo capítulo"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="p-4 bg-gray-100 dark:bg-gray-900 text-center text-gray-600 dark:text-gray-400 text-sm border-t border-gray-200 dark:border-gray-800 mt-6">
        Desenvolvido com{" "}
        <span role="img" aria-label="coração">
          ❤️
        </span>{" "}
        para o estudo da Bíblia.
      </footer>

      {/* Tooltip do Versículo (usando Portal) */}
      {tooltip && (
        <TooltipPortal>
          <div
            ref={tooltipRef}
            className="absolute z-50 flex flex-col items-center"
            style={{
              top: tooltip.y - (geminiExplanation ? 200 : 80), // Ajusta a posição para cima, mais se houver explicação
              left: tooltip.x,
              transform: "translateX(-50%)", // Centraliza o tooltip na horizontal
            }}
          >
            <div className="bg-gray-800 dark:bg-gray-700 text-white rounded-lg shadow-xl p-2 flex flex-col gap-2 border border-gray-700 dark:border-gray-600 min-w-[200px] max-w-xs sm:max-w-md">
              <div className="flex justify-between items-center pb-2 border-b border-gray-600 dark:border-gray-500">
                <span className="font-semibold text-sm sm:text-base">
                  Versículo {tooltip.verseId}
                </span>
                <button
                  onClick={() => {
                    setTooltip(null);
                    setGeminiExplanation(null);
                  }}
                  className="p-1 rounded-full hover:bg-gray-600 dark:hover:bg-gray-500 transition-colors"
                  aria-label="Fechar"
                  title="Fechar"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex justify-around items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex flex-col items-center p-2 rounded-md hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base flex-1"
                  aria-label="Copiar versículo"
                  title="Copiar"
                >
                  <Copy size={20} className="mb-1" />
                  Copiar
                </button>
                <button
                  onClick={handleShare}
                  className="flex flex-col items-center p-2 rounded-md hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base flex-1"
                  aria-label="Compartilhar versículo"
                  title="Compartilhar"
                >
                  <Share2 size={20} className="mb-1" />
                  Compartilhar
                </button>
                <button
                  onClick={handleExplainWithGemini}
                  disabled={isGeminiLoading}
                  className="flex flex-col items-center p-2 rounded-md hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Explicar com Gemini"
                  title="Explicar com Gemini"
                >
                  {isGeminiLoading ? (
                    <Loader2 size={20} className="mb-1 animate-spin" />
                  ) : (
                    <Bot size={20} className="mb-1" />
                  )}
                  Explicar
                </button>
              </div>

              {geminiExplanation && (
                <div className="mt-2 pt-2 border-t border-gray-600 dark:border-gray-500 text-sm text-gray-200 leading-snug max-h-40 overflow-y-auto">
                  <p className="font-semibold mb-1 text-base">Explicação:</p>
                  <p>{geminiExplanation}</p>
                </div>
              )}
            </div>
            {/* Triângulo apontando para o versículo */}
            <div
              className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent
                         border-t-[10px] border-t-gray-800 dark:border-t-gray-700 -mt-1"
            ></div>
          </div>
        </TooltipPortal>
      )}
      <GeminiModal
        open={isGeminiModalOpen}
        onClose={() => setIsGeminiModalOpen(false)}
        data={geminiFullResponse}
      />
    </div>
  );
}
