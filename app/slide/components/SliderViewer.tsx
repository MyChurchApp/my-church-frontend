import React, { useState, useEffect } from "react";
import {
  getPresentationById,
  Presentation,
  Slide,
} from "../../../services/presentation/presentation"; // Ajuste o caminho se necessário

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
    slideIndex: number; // Este valor corresponde ao 'orderIndex' do slide
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

      let presentationToUse = presentationData;

      // <-- MUDANÇA 1: A lógica de refetch agora checa o 'orderIndex' usando .find()
      const mustRefetch =
        !presentationToUse ||
        presentationToUse.id !== presentationId ||
        !presentationToUse.slides.find((s) => s.orderIndex === slideIndex);

      if (mustRefetch) {
        let reason = "Cache vazio";
        if (presentationToUse) {
          reason =
            presentationToUse.id !== presentationId
              ? "ID da apresentação mudou"
              : "Índice do slide (orderIndex) não encontrado no cache";
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
          return; // Sai da função em caso de erro
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log(
          `[CACHE HIT] Usando apresentação ID ${presentationId} do cache.`
        );
      }

      if (presentationToUse && presentationToUse.slides) {
        // <-- MUDANÇA 2: Encontra o slide correto usando .find() com o orderIndex
        const targetSlide: Slide | undefined = presentationToUse.slides.find(
          (slide) => slide.orderIndex === slideIndex
        );

        if (targetSlide) {
          console.log(
            `Exibindo slide com orderIndex ${slideIndex}. URL: ${targetSlide.cachedMediaUrl}`
          );
          setImageUrl(targetSlide.cachedMediaUrl);
        } else {
          console.error(
            `ERRO CRÍTICO: Slide com orderIndex ${slideIndex} não encontrado na apresentação.`
          );
          setError(
            `Slide com orderIndex ${slideIndex} não pôde ser encontrado.`
          );
          setImageUrl(null);
        }
      }
    })();
  }, [data]);

  // A parte de renderização permanece a mesma
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
