"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Home,
  Users,
  Calendar,
  DollarSign,
  MessageSquare,
  BookOpen,
  Settings,
  LogOut,
  BarChart3,
  Heart,
  Building2,
  UserCheck,
} from "lucide-react"
import { getUserRole, logout } from "@/lib/auth-utils"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    roles: ["Admin", "Pastor", "Leader", "Member"],
  },
  {
    name: "Membros",
    href: "/dashboard/membros",
    icon: Users,
    roles: ["Admin", "Pastor", "Leader", "Member"],
  },
  {
    name: "Eventos",
    href: "/dashboard/eventos",
    icon: Calendar,
    roles: ["Admin", "Pastor", "Leader", "Member"],
  },
  {
    name: "Financeiro",
    href: "/dashboard/financeiro",
    icon: DollarSign,
    roles: ["Admin", "Pastor", "Leader"],
  },
  {
    name: "Doações",
    href: "/dashboard/doacoes",
    icon: Heart,
    roles: ["Admin", "Pastor", "Leader"],
  },
  {
    name: "Comunicação",
    href: "/dashboard/comunicacao",
    icon: MessageSquare,
    roles: ["Admin", "Pastor", "Leader", "Member"],
  },
  {
    name: "Culto",
    href: "/dashboard/culto",
    icon: BookOpen,
    roles: ["Admin", "Pastor", "Leader", "Member"],
  },
  {
    name: "Relatórios",
    href: "/dashboard/relatorios",
    icon: BarChart3,
    roles: ["Admin", "Pastor", "Leader"],
  },
  {
    name: "Igreja",
    href: "/dashboard/igreja",
    icon: Building2,
    roles: ["Admin", "Pastor"],
  },
  {
    name: "Configurações",
    href: "/dashboard/configuracoes",
    icon: Settings,
    roles: ["Admin"],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const userRole = getUserRole()

  const handleLogout = () => {
    logout()
  }

  // Filtrar navegação baseada no papel do usuário
  const filteredNavigation = navigation.filter((item) => item.roles.includes(userRole))

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-gray-900">MyChurch</span>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* User Section */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
            <UserCheck className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Usuário</p>
            <p className="text-xs text-gray-500 truncate">{userRole}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  )
}
