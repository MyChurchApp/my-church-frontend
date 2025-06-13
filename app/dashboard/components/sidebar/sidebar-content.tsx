"use client"

import Link from "next/link"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Home,
  Users,
  Calendar,
  DollarSign,
  Settings,
  MessageSquare,
  BookOpen,
  BarChart,
  FileText,
  Bell,
  LogOut,
} from "lucide-react"

interface SidebarContentProps {
  churchName: string
  churchLogo: string
  userRole: string
  loading: boolean
}

export function SidebarContent({ churchName, churchLogo, userRole, loading }: SidebarContentProps) {
  // Função para verificar se o usuário tem permissão para acessar determinada rota
  const hasPermission = (requiredRole: string) => {
    if (userRole === "Admin") return true
    if (userRole === "Pastor" && requiredRole !== "Admin") return true
    if (userRole === "Leader" && (requiredRole === "Member" || requiredRole === "Leader")) return true
    if (userRole === "Member" && requiredRole === "Member") return true
    return false
  }

  // Função para fazer logout
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken")
      localStorage.removeItem("userRole")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo e Nome da Igreja */}
      <div className="flex items-center gap-2 px-4 py-3">
        {loading ? (
          <>
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </>
        ) : (
          <>
            <div className="flex h-8 w-8 items-center justify-center rounded-full overflow-hidden">
              {churchLogo ? (
                <Image src={churchLogo || "/placeholder.svg"} alt={churchName} width={32} height={32} />
              ) : (
                <div className="bg-primary text-primary-foreground flex h-full w-full items-center justify-center rounded-full text-lg font-semibold">
                  {churchName.charAt(0)}
                </div>
              )}
            </div>
            <span className="font-medium">{churchName}</span>
          </>
        )}
      </div>

      {/* Links de Navegação */}
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>

          {hasPermission("Member") && (
            <Link
              href="/dashboard/membros"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <Users className="h-4 w-4" />
              <span>Membros</span>
            </Link>
          )}

          {hasPermission("Member") && (
            <Link
              href="/dashboard/eventos"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <Calendar className="h-4 w-4" />
              <span>Eventos</span>
            </Link>
          )}

          {hasPermission("Leader") && (
            <Link
              href="/dashboard/financeiro"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <DollarSign className="h-4 w-4" />
              <span>Financeiro</span>
            </Link>
          )}

          {hasPermission("Leader") && (
            <Link
              href="/dashboard/doacoes"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <DollarSign className="h-4 w-4" />
              <span>Doações</span>
            </Link>
          )}

          {hasPermission("Member") && (
            <Link
              href="/dashboard/comunicacao"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Comunicação</span>
            </Link>
          )}

          {hasPermission("Member") && (
            <Link
              href="/dashboard/culto"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <BookOpen className="h-4 w-4" />
              <span>Culto</span>
            </Link>
          )}

          {hasPermission("Leader") && (
            <Link
              href="/dashboard/relatorios"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <BarChart className="h-4 w-4" />
              <span>Relatórios</span>
            </Link>
          )}

          {hasPermission("Member") && (
            <Link
              href="/dashboard/documentos"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <FileText className="h-4 w-4" />
              <span>Documentos</span>
            </Link>
          )}

          {hasPermission("Member") && (
            <Link
              href="/dashboard/notificacoes"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <Bell className="h-4 w-4" />
              <span>Notificações</span>
            </Link>
          )}

          {hasPermission("Admin") && (
            <Link
              href="/dashboard/configuracoes"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <Settings className="h-4 w-4" />
              <span>Configurações</span>
            </Link>
          )}
        </nav>
      </div>

      {/* Botão de Logout */}
      <div className="mt-auto border-t p-2">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        >
          <LogOut className="h-4 w-4" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  )
}
