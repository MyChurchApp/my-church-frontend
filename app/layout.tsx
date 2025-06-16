// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "../styles/globals.css";

// CORREÇÃO: Adicionados todos os pesos da fonte original
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "MyChurch: Lançamento em Breve",
  description: "A Revolução na Gestão de Igrejas Está a Chegar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
        <link
          href="https://unpkg.com/aos@2.3.1/dist/aos.css"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        {children}
        <Script
          src="https://unpkg.com/aos@2.3.1/dist/aos.js"
          strategy="lazyOnload"
        />
        <Script id="aos-init" strategy="lazyOnload">
          {`AOS.init({
              duration: 800,
              once: true,
              offset: 50
            });`}
        </Script>
      </body>
    </html>
  );
}
