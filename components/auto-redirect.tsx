"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

interface AutoRedirectProps {
  to: string
  condition?: boolean
  delay?: number
}

export function AutoRedirect({ to, condition = true, delay = 0 }: AutoRedirectProps) {
  const router = useRouter()
  const { isAuthenticated, hasChecked } = useAuth()

  useEffect(() => {
    if (!hasChecked) return

    if (condition && isAuthenticated) {
      console.log(`AutoRedirect: Redirecionando para ${to} em ${delay}ms`)

      const redirect = () => {
        // Tentar múltiplas estratégias
        try {
          router.push(to)
        } catch (error) {
          console.error("Erro com router.push:", error)
          window.location.href = to
        }

        // Backup após 500ms
        setTimeout(() => {
          if (window.location.pathname !== to) {
            console.log("Router.push falhou, usando window.location.replace")
            window.location.replace(to)
          }
        }, 500)
      }

      if (delay > 0) {
        setTimeout(redirect, delay)
      } else {
        redirect()
      }
    }
  }, [condition, isAuthenticated, hasChecked, to, delay, router])

  return null
}
