import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "MyChurch - Sistema de Gestão Eclesiástica",
  description: "Sistema completo para gestão de igrejas e comunidades religiosas",
  generator: "MyChurch",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
