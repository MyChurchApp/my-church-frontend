"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Home,
  Users,
  Calendar,
  DollarSign,
  MessageSquare,
  Settings,
  Church,
  BookOpen,
  BarChart3,
  Gift,
} from "lucide-react"

interface User {
  name: string
  email: string
  avatar?: string
  role?: string
}

interface SidebarContentProps {
  user?: User | null
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Membros", href: "/dashboard/membros", icon: Users },
  { name: "Eventos", href: "/dashboard/eventos", icon: Calendar },
  { name: "Financeiro", href: "/dashboard/financeiro", icon: DollarSign },
  { name: "Doações", href: "/dashboard/doacoes", icon: Gift },
  { name: "Culto", href: "/dashboard/culto", icon: Church },
  { name: "Comunicação", href: "/dashboard/comunicacao", icon: MessageSquare },
  { name: "Leitura Bíblica", href: "/dashboard/leitura-biblica", icon: BookOpen },
  { name: "Relatórios", href: "/dashboard/relatorios", icon: BarChart3 },
  { name: "Configurações", href: "/dashboard/configuracoes", icon: Settings },
]

export function SidebarContent({ user }: SidebarContentProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      {/* User Profile */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={user?.avatar || "/placeholder.svg"} />
            <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || "Usuário"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Button
              key={item.name}
              variant={isActive ? "secondary" : "ghost"}
              className={cn("w-full justify-start", isActive && "bg-secondary")}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Link>
            </Button>
          )
        })}
      </nav>
    </div>
  )
}
