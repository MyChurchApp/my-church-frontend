import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/contexts/language-context"
import ScrollToSection from "@/components/scroll-to-section"
import { ErrorBoundary } from "@/components/error-boundary"
import { RouteGuard } from "@/components/route-guard"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "MyChurch - Software de Gestão para Igrejas",
  description: "Transforme a gestão da sua igreja com uma solução digital completa e integrada.",
  manifest: "/manifest.json",
  icons: {
    icon: "/api/icon/32",
    apple: "/api/icon/180",
  },
  themeColor: "#3b82f6",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MyChurch",
  },
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MyChurch" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="apple-touch-icon" href="/api/icon/180" />
        <link rel="mask-icon" href="/api/icon/192" color="#3b82f6" />
        <link rel="icon" type="image/svg+xml" href="/api/icon/32" />
        <link rel="icon" type="image/svg+xml" sizes="16x16" href="/api/icon/16" />
        <link rel="icon" type="image/svg+xml" sizes="32x32" href="/api/icon/32" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <LanguageProvider>
              <RouteGuard>
                <ScrollToSection />
                {children}
              </RouteGuard>
            </LanguageProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
