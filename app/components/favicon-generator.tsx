import type { MetadataRoute } from "next"

export function generateFavicon(): MetadataRoute.Manifest {
  return {
    name: "MyChurch - Software de Gestão para Igrejas",
    short_name: "MyChurch",
    description: "Transforme a gestão da sua igreja com uma solução digital completa e integrada.",
    start_url: "/",
    display: "standalone",
    background_color: "#2D2D2D",
    theme_color: "#8EEEE5",
    icons: [
      {
        src: "/mychurch-logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/mychurch-logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
