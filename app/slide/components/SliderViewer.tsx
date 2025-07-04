import React, { useState, useEffect } from "react";
import {
  getPresentationById,
  Presentation,
  Slide,
} from "../../../services/presentation/presentation";

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "#000",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    fontSize: "1.5rem",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
};

interface SlideViewerProps {
  data: {
    presentationId: number;
    slideIndex: number;
  } | null;
}

export function SlideViewer({ data }: SlideViewerProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [presentationData, setPresentationData] = useState<Presentation | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!data || !data.presentationId) {
        setImageUrl(null);
        return;
      }

      const { presentationId, slideIndex } = data;
      setError(null);

      // --- LÓGICA DE CACHE CORRIGIDA ---
      let presentationToUse = presentationData;
      const mustRefetch =
        !presentationToUse ||
        presentationToUse.id !== presentationId ||
        !presentationToUse.slides[slideIndex];

      if (mustRefetch) {
        let reason = "Cache vazio";
        if (presentationToUse) {
          reason =
            presentationToUse.id !== presentationId
              ? "ID da apresentação mudou"
              : "Índice do slide não encontrado no cache";
        }

        setIsLoading(true);
        try {
          const newPresentationData = await getPresentationById(presentationId);
          setPresentationData(newPresentationData);
          presentationToUse = newPresentationData;
        } catch (err: any) {
          setError(err.message || "Erro ao buscar nova apresentação.");
          setPresentationData(null);
          setImageUrl(null);
          setIsLoading(false);
          return;
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log(
          `[CACHE HIT] Usando apresentação ID ${presentationId} do cache.`
        );
      }

      if (presentationToUse && presentationToUse.slides) {
        const targetSlide: Slide | undefined =
          presentationToUse.slides[slideIndex];

        if (targetSlide) {
          console.log(
            `Exibindo slide do índice ${slideIndex}. URL: ${targetSlide.cachedMediaUrl}`
          );
          setImageUrl(targetSlide.cachedMediaUrl);
        } else {
          console.error(
            `ERRO CRÍTICO: Slide com índice ${slideIndex} não encontrado MESMO APÓS a requisição.`
          );
          setError(`Slide com índice ${slideIndex} não pôde ser encontrado.`);
          setImageUrl(null);
        }
      }
    })();
  }, [data]);

  if (isLoading) {
    return <div style={styles.container}>Carregando...</div>;
  }

  if (error) {
    return <div style={styles.container}>Erro: {error}</div>;
  }

  if (imageUrl) {
    return (
      <div style={styles.container}>
        <img
          src={imageUrl}
          alt={`Slide da apresentação`}
          style={styles.image}
        />
      </div>
    );
  }

  return (
    <div style={styles.container}>Aguardando dados da apresentação...</div>
  );
}
