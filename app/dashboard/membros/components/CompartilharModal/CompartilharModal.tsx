import React, { useRef, useState } from "react";
import { X, Check, Copy, Share2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getChurchData } from "@/services/church.service";

function CompartilharModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const {
    data: dataChurch,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["church-data"],
    queryFn: getChurchData,
    staleTime: 1000 * 60 * 5,
  });

  const link = dataChurch?.id
    ? `https://www.mychurchlab.net/onboarding?church=${dataChurch.id}`
    : "";

  // Fecha ao clicar fora do modal
  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  }

  const handleCopy = () => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!dataChurch?.onboardingQrCode || !navigator.share) {
      alert(
        "O compartilhamento não é suportado neste navegador ou não há QR Code."
      );
      return;
    }
    try {
      const response = await fetch(dataChurch.onboardingQrCode);
      const blob = await response.blob();
      const file = new File([blob], "qrcode-convite.png", { type: blob.type });

      await navigator.share({
        title: `Convite para ${dataChurch.name || "nossa Igreja"}`,
        text: `Use este link ou QR Code para se cadastrar como membro.`,
        url: link,
        files: [file],
      });
    } catch (err) {
      alert("Não foi possível compartilhar.");
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-xs bg-white p-8 rounded-lg shadow-md text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 z-10"
          aria-label="Fechar modal"
        >
          <X size={24} />
        </button>
        <h1 className="font-bold text-2xl text-gray-800 mb-2">
          Convite para Novos Membros
        </h1>
        <p className="text-gray-600 mb-4">
          Compartilhe o QR Code ou o link para que novos membros possam se
          cadastrar.
        </p>
        {isLoading && <p>Carregando...</p>}
        {error && (
          <p className="text-red-500">Ocorreu um erro ao buscar os dados.</p>
        )}
        {!isLoading && !error && dataChurch && (
          <>
            {dataChurch?.onboardingQrCode && (
              <img
                src={dataChurch.onboardingQrCode}
                alt="QR Code de convite para a igreja"
                className="w-48 h-48 mx-auto rounded-md my-3"
              />
            )}
            <div className="relative flex items-center mb-3">
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
          </>
        )}
      </div>
    </div>
  );
}

export default CompartilharModal;
