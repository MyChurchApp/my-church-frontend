"use client";

import { useQuery } from "@tanstack/react-query";
import { getChurchData } from "@/services/church.service";
import { useState, useRef, useEffect } from "react";
import { Share2, Copy, Check, X } from "lucide-react";

export default function MembrosPendentesPage() {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [presentation, setPresentation] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["church-data"],
    queryFn: getChurchData,
    staleTime: 1000 * 60 * 5,
  });

  const link = data?.id
    ? `https://www.mychurchlab.net/onboarding?church=${data.id}`
    : "";

  // Fullscreen: ativa/desativa se F11 ou botão
  useEffect(() => {
    if (!presentation) return;

    function handleF11(e: KeyboardEvent) {
      if (e.key === "F11") {
        e.preventDefault();
        toggleFullscreen();
      }
    }
    document.addEventListener("keydown", handleF11);

    return () => document.removeEventListener("keydown", handleF11);
    // eslint-disable-next-line
  }, [presentation]);

  // Tenta colocar o modal/página em fullscreen
  function toggleFullscreen() {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  // Fechar modal clicando fora
  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setOpen(false);
      setPresentation(false);
      if (document.fullscreenElement) document.exitFullscreen?.();
    }
  }

  // Fechar e sair do modo apresentação
  function exitPresentation() {
    setPresentation(false);
    if (document.fullscreenElement) document.exitFullscreen?.();
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!data?.onboardingQrCode || !navigator.share) {
      alert(
        "O compartilhamento não é suportado neste navegador ou não há QR Code."
      );
      return;
    }

    try {
      const response = await fetch(data.onboardingQrCode);
      const blob = await response.blob();
      const file = new File([blob], "qrcode-convite.png", { type: blob.type });

      await navigator.share({
        title: `Convite para ${data.name || "nossa Igreja"}`,
        text: `Use este link ou QR Code para se cadastrar como membro.`,
        url: link,
        files: [file],
      });
    } catch (err) {
      console.error("Erro ao compartilhar:", err);
      alert("Não foi possível compartilhar.");
    }
  };

  if (!open) {
    return (
      <div className="flex justify-center items-center h-screen">
        <button
          onClick={() => setOpen(true)}
          className="px-8 py-3 rounded-lg bg-blue-600 text-white text-lg font-bold shadow hover:bg-blue-700 transition"
        >
          CONVITE
        </button>
      </div>
    );
  }

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        ${presentation ? "bg-white" : "bg-black bg-opacity-40"}
      `}
      onClick={handleOverlayClick}
      style={presentation ? { background: "#f1f5f9" } : {}}
    >
      <div
        ref={modalRef}
        className={`
          relative
          ${
            presentation
              ? "w-full h-full max-w-none max-h-none flex flex-col justify-center items-center bg-white rounded-none shadow-none"
              : "w-full max-w-xs bg-white p-8 rounded-lg shadow-md text-center"
          }
          transition-all
        `}
        style={
          presentation
            ? { maxWidth: "100vw", maxHeight: "100vh", padding: 0 }
            : {}
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão sair da apresentação */}
        {presentation && (
          <button
            onClick={exitPresentation}
            className="absolute top-4 right-4 z-20 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-1"
            aria-label="Sair do modo apresentação"
            style={{ boxShadow: "0 0 10px #0001" }}
          >
            <X size={32} className="text-gray-500" />
          </button>
        )}

        {/* Botão fechar modal (quando NÃO está apresentando) */}
        {!presentation && (
          <button
            onClick={() => {
              setOpen(false);
              setPresentation(false);
            }}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 z-10"
            aria-label="Fechar modal"
          >
            <X size={24} />
          </button>
        )}

        {/* Conteúdo do modal */}
        <header className={presentation ? "pt-16" : ""}>
          <h1
            className={`font-bold ${
              presentation
                ? "text-4xl text-blue-700 mb-6"
                : "text-2xl text-gray-800"
            }`}
          >
            {presentation
              ? "Aponte a câmera do seu celular"
              : "Convite para Novos Membros"}
          </h1>
          <p
            className={`${
              presentation ? "text-xl text-gray-700" : "text-gray-600 mt-2"
            }`}
          >
            {presentation
              ? "Abra a câmera e escaneie o QR Code na tela para se cadastrar como membro da nossa igreja."
              : "Compartilhe o QR Code ou o link para que novos membros possam se cadastrar."}
          </p>
        </header>

        {isLoading && (
          <div className="py-16">
            <p>Carregando...</p>
          </div>
        )}
        {error && (
          <div className="py-16">
            <p className="text-red-500">Ocorreu um erro ao buscar os dados.</p>
          </div>
        )}
        {!isLoading && !error && (
          <>
            {data?.onboardingQrCode && (
              <div
                className={`my-6 flex justify-center items-center ${
                  presentation
                    ? "bg-white"
                    : "p-4 bg-white rounded-lg shadow-md"
                }`}
              >
                <img
                  src={data.onboardingQrCode}
                  alt="QR Code de convite para a igreja"
                  className={
                    presentation
                      ? "w-[420px] h-[420px] max-w-[60vw] max-h-[60vh] rounded-lg border-2 border-blue-200 shadow-2xl"
                      : "w-48 h-48 mx-auto rounded-md"
                  }
                  style={presentation ? { boxShadow: "0 12px 64px #0003" } : {}}
                />
              </div>
            )}

            {!presentation && (
              <div className="space-y-3">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={link}
                    readOnly
                    className="w-full pl-3 pr-12 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-gray-600 hover:bg-gray-200 rounded-md"
                    aria-label="Copiar link"
                  >
                    {copied ? (
                      <Check size={20} className="text-green-500" />
                    ) : (
                      <Copy size={20} />
                    )}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 transition-colors"
                >
                  <Share2 size={20} />
                  <span>Compartilhar Convite</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPresentation(true);
                    setTimeout(() => toggleFullscreen(), 200); // Dá tempo do modal animar antes do fullscreen
                  }}
                  className="w-full mt-4 px-4 py-3 rounded-md font-semibold border bg-white text-blue-600 border-blue-600"
                >
                  Modo apresentação
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
