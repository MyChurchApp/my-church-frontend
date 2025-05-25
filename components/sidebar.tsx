"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import {
  Home,
  Users,
  Calendar,
  DollarSign,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { getUser } from "@/lib/fake-api"

interface SidebarProps {
  className?: string
}

interface MenuItem {
  icon: any
  label: string
  href: string
  accessLevel: "admin" | "member"
}

export function Sidebar({ className = "" }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const user = getUser()

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  const allMenuItems: MenuItem[] = [
    { icon: Home, label: "Dashboard", href: "/dashboard", accessLevel: "member" },
    { icon: Users, label: "Membros", href: "/dashboard/membros", accessLevel: "member" },
    { icon: Calendar, label: "Eventos", href: "/dashboard/eventos", accessLevel: "member" },
    // Itens apenas para admin
    { icon: MessageSquare, label: "Comunicação", href: "/dashboard/comunicacao", accessLevel: "admin" },
    { icon: DollarSign, label: "Financeiro", href: "/dashboard/financeiro", accessLevel: "admin" },
    { icon: Settings, label: "Configurações", href: "/dashboard/configuracoes", accessLevel: "admin" },
  ]

  // Filtrar itens baseado no nível de acesso do usuário
  const menuItems = allMenuItems.filter((item) => {
    if (!user) return false
    if (user.accessLevel === "admin") return true
    return item.accessLevel === "member"
  })

  const isActiveRoute = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname.startsWith(href)
  }

  return (
    <div
      className={`bg-white border-r border-gray-200 transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"} ${className}`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!isCollapsed && <Logo size="md" />}
            <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="ml-auto">
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* User Info */}
        {!isCollapsed && user && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="text-sm">
              <p className="font-medium text-gray-900">{user.name}</p>
              <p className="text-gray-600">{user.role}</p>
              <span
                className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                  user.accessLevel === "admin" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                }`}
              >
                {user.accessLevel === "admin" ? "Administrador" : "Membro"}
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActiveRoute(item.href)
                      ? "text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                  style={isActiveRoute(item.href) ? { backgroundColor: "#89f0e6" } : {}}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={`w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 ${
              isCollapsed ? "px-2" : "px-3"
            }`}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="ml-3">Sair</span>}
          </Button>
        </div>
      </div>
    </div>
  )
}
