import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import Script from "next/script";
import { ReactQueryProvider } from "@/app/providers/react-query-provider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "MyChurch Lab | Software para Gestão de Igrejas | MyChurch",
  description:
    "A plataforma MyChurch Lab (MyChurch) simplifica a gestão de membros, finanças e eventos da sua igreja. Comece com nosso plano gratuito.",
  keywords: [
    "mychurchlab","mychurch","my church lab","my church",
    "gestão de igrejas","software para igreja",
    "aplicativo para igreja","sistema para igreja"
  ],

  // PWA
  manifest: "/manifest.webmanifest",
  themeColor: "#0ea5e9",
  icons: {
    icon: [
      { url: "/icons/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/android-chrome-512x512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ]
  },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "MyChurch Lab" },

  // OG
  openGraph: {
    title: "MyChurch Lab | Software para Gestão de Igrejas",
    description: "Simplifique a gestão da sua igreja com a plataforma MyChurch.",
    url: "https://www.mychurchlab.com.br",
    siteName: "MyChurch Lab",
    images: [{ url: "https://www.mychurchlab.com.br/og-image.png" }],
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 2. DADOS ESTRUTURADOS COM NOMES DA MARCA
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "MyChurch Lab",
    // Nomes alternativos ajudam o Google a entender as variações
    alternateName: ["MyChurch", "my church lab", "mychurch"],
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0.00",
      priceCurrency: "BRL",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5.0", // Comece com uma nota alta!
      reviewCount: "15", // Atualize quando tiver avaliações reais
    },
    url: "https://www.mychurchlab.com.br", // <-- TROQUE PELA SUA URL REAL
  };

  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        {/* Adiciona o script de dados estruturados no <head> */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/aos@2.3.1/dist/aos.css"
        />
      </head>
      <body className={inter.className}>
        <ReactQueryProvider>
          {children}
          <Script
            src="https://unpkg.com/aos@2.3.1/dist/aos.js"
            strategy="afterInteractive"
          />
          <Script id="aos-init" strategy="afterInteractive">
            {`
              if (window.AOS) {
                AOS.init({
                  duration: 800,
                  once: true,
                  offset: 50
                });
              }
            `}
          </Script>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
