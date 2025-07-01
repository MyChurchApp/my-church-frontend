"use client";

import { getChurchData } from "@/services/church.service";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Share2, Copy, Check } from "lucide-react";

export default function MembrosPendentesPage() {
  const [copied, setCopied] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["church-data"],
    queryFn: getChurchData,
    staleTime: 1000 * 60 * 5,
  });

  const link = data?.id
    ? `https://www.mychurchlab.net/onboarding?church=${data.id}`
    : "";

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Ocorreu um erro ao buscar os dados.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col ">
      <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
        <div className="w-full max-w-xs space-y-6">
          <header>
            <h1 className="text-2xl font-bold text-gray-800">
              Convite para Novos Membros
            </h1>
            <p className="text-gray-600 mt-2">
              Compartilhe o QR Code ou o link para que novos membros possam se
              cadastrar.
            </p>
          </header>

          {data?.onboardingQrCode && (
            <div className="p-4 bg-white rounded-lg shadow-md">
              <img
                src={data.onboardingQrCode}
                alt="QR Code de convite para a igreja"
                className="w-48 h-48 mx-auto rounded-md"
              />
            </div>
          )}

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
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white font-semibold rounded-md shadow-sm hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <Share2 size={20} />
              <span>Compartilhar Convite</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
