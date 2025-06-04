"use client"

import type React from "react"
import { createContext, useContext, useEffect } from "react"
import { Toaster } from "@/components/ui/toaster"
import { toast } from "@/hooks/use-toast"

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info") => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    toast({
      title: type === "success" ? "Sucesso" : type === "error" ? "Erro" : "Informação",
      description: message,
      variant: type === "error" ? "destructive" : "default",
    })
  }

  // Escutar eventos de erro 500
  useEffect(() => {
    const handleApiError500 = (event: CustomEvent) => {
      showToast(event.detail.message, "error")
    }

    window.addEventListener("api-error-500", handleApiError500 as EventListener)

    return () => {
      window.removeEventListener("api-error-500", handleApiError500 as EventListener)
    }
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  )
}

export function useToastContext() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToastContext must be used within a ToastProvider")
  }
  return context
}
