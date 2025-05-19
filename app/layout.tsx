import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import ScrollToSection from "@/components/scroll-to-section"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "MyChurch - Software de Gestão para Igrejas",
  description: "Transforme a gestão da sua igreja com uma solução digital completa e integrada.",
  icons: {
    icon: "/mychurch-logo.png",
    apple: "/mychurch-logo.png",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <ScrollToSection />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
