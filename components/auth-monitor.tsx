"use client"

import { useAuthMonitor } from "@/hooks/use-auth-monitor"

/**
 * Componente que monitora a autenticação globalmente
 * Deve ser usado no layout principal
 */
export function AuthMonitor() {
  useAuthMonitor()

  // Este componente não renderiza nada visível
  return null
}
