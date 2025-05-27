"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ComunicacaoPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar para Nova Publicação por padrão
    router.replace("/dashboard/comunicacao/nova-publicacao")
  }, [router])

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-gray-600">Redirecionando...</p>
      </div>
    </div>
  )
}
