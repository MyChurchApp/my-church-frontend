import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import Script from "next/script";
import { ReactQueryProvider } from "@/app/providers/react-query-provider"; // <-- Faltava isso

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "MyChurch: Lançamento em Breve",
  description: "A Revolução na Gestão de Igrejas Está a Chegar.",
  icons: {
    icon: "/favicon.ico",
  },
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
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
