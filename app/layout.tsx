import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/contexts/language-context"
import { ErrorBoundary } from "@/components/error-boundary"
import { ToastProvider } from "@/contexts/toast-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MyChurch - Sistema de Gestão para Igrejas",
  description: "Sistema completo de gestão para igrejas com controle de membros, finanças, eventos e comunicação.",
  keywords: "igreja, gestão, membros, finanças, eventos, comunicação",
  authors: [{ name: "MyChurch Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#3b82f6",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/api/icon/16", sizes: "16x16", type: "image/png" },
      { url: "/api/icon/32", sizes: "32x32", type: "image/png" },
      { url: "/api/icon/192", sizes: "192x192", type: "image/png" },
      { url: "/api/icon/512", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/api/icon/180", sizes: "180x180", type: "image/png" }],
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <LanguageProvider>
              <ToastProvider>{children}</ToastProvider>
            </LanguageProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
