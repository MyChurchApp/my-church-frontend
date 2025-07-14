"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Check } from "lucide-react"

export default function GenerateIcons() {
  const [downloading, setDownloading] = useState(false)
  const [completed, setCompleted] = useState(false)

  const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512]

  const downloadIcons = async () => {
    setDownloading(true)

    try {
      // Cria um ZIP com todos os ícones
      const JSZip = (await import("jszip")).default
      const zip = new JSZip()
      const iconsFolder = zip.folder("icons")

      // Adiciona cada ícone ao ZIP
      for (const size of iconSizes) {
        const response = await fetch(`/icons/icon-${size}x${size}.png`)
        const blob = await response.blob()
        iconsFolder.file(`icon-${size}x${size}.png`, blob)
      }

      // Gera o arquivo ZIP
      const content = await zip.generateAsync({ type: "blob" })

      // Cria um link para download
      const url = URL.createObjectURL(content)
      const link = document.createElement("a")
      link.href = url
      link.download = "mychurch-icons.zip"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setCompleted(true)
      setTimeout(() => setCompleted(false), 3000)
    } catch (error) {
      console.error("Erro ao baixar ícones:", error)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Ícones do PWA</CardTitle>
        <CardDescription>Baixe todos os ícones necessários para o PWA</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4">
          {iconSizes.map((size) => (
            <div key={size} className="flex flex-col items-center">
              <img
                src={`/icons/icon-${size}x${size}.png`}
                alt={`Ícone ${size}x${size}`}
                className="w-16 h-16 object-contain mb-1"
              />
              <span className="text-xs text-gray-500">
                {size}x{size}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={downloadIcons} disabled={downloading} className="w-full">
          {completed ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Baixado!
            </>
          ) : downloading ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Baixando...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Baixar Todos os Ícones
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
