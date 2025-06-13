"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth-utils"

export default function CultoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    // Verificar se está autenticado
    if (!isAuthenticated()) {
      router.push("/login")
    }
  }, [router])

  return <>{children}</>
}
