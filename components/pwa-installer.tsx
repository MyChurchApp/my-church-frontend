"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, Check } from "lucide-react"

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    // Detecta se o app já está instalado
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
    }

    // Captura o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    // Detecta quando o app é instalado
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Mostra o prompt de instalação
    deferredPrompt.prompt()

    // Espera o usuário responder
    const { outcome } = await deferredPrompt.userChoice

    // Limpa o prompt salvo
    setDeferredPrompt(null)

    if (outcome === "accepted") {
      setIsInstalled(true)
    }
  }

  if (isInstalled) {
    return (
      <Button variant="outline" className="gap-2" disabled>
        <Check className="h-4 w-4" />
        App Instalado
      </Button>
    )
  }

  if (!isInstallable) {
    return null
  }

  return (
    <Button onClick={handleInstallClick} className="gap-2">
      <Download className="h-4 w-4" />
      Instalar App
    </Button>
  )
}
