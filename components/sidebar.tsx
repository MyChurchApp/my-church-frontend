"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
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
  Menu,
  X,
  Package,
  Heart,
} from "lucide-react"
import { getUser, getChurchData } from "@/lib/fake-api"

interface SidebarProps {
  className?: string
}

interface MenuItem {
  icon: any
  label: string
  href: string
  accessLevel: "admin" | "member"
  subItems?: {
    label: string
    href: string
  }[]
}

export function Sidebar({ className = "" }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const router = useRouter()
  const pathname = usePathname()
  const user = getUser()
  const churchData = getChurchData()

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      const scrollY = window.scrollY
      document.body.style.position = "fixed"
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = "100%"
      document.body.style.overflow = "hidden"
    } else {
      const scrollY = document.body.style.top
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.width = ""
      document.body.style.overflow = ""
      if (scrollY) {
        window.scrollTo(0, Number.parseInt(scrollY || "0") * -1)
      }
    }

    return () => {
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.width = ""
      document.body.style.overflow = ""
    }
  }, [isMobileOpen])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  const allMenuItems: MenuItem[] = [
    { icon: Home, label: "Início", href: "/dashboard", accessLevel: "member" },
    { icon: Users, label: "Membros", href: "/dashboard/membros", accessLevel: "member" },
    { icon: Calendar, label: "Eventos", href: "/dashboard/eventos", accessLevel: "member" },
    { icon: Heart, label: "Doações", href: "/dashboard/doacoes", accessLevel: "member" },
    {
      icon: MessageSquare,
      label: "Comunicação",
      href: "/dashboard/comunicacao",
      accessLevel: "admin",
      subItems: [
        { label: "Nova Publicação", href: "/dashboard/comunicacao/nova-publicacao" },
        { label: "WhatsApp", href: "/dashboard/comunicacao/whatsapp" },
      ],
    },
    { icon: DollarSign, label: "Financeiro", href: "/dashboard/financeiro", accessLevel: "admin" },
    { icon: Package, label: "Ativos", href: "/dashboard/ativos", accessLevel: "admin" },
    { icon: Settings, label: "Configurações", href: "/dashboard/configuracoes", accessLevel: "admin" },
  ]

  // Filtrar itens baseado no nível de acesso do usuário
  const menuItems = allMenuItems.filter((item) => {
    if (!user) return false
    if (user.accessLevel === "admin") return true
    return item.accessLevel === "member"
  })

  const toggleSubmenu = (href: string) => {
    setExpandedMenus((prev) => (prev.includes(href) ? prev.filter((item) => item !== href) : [...prev, href]))
  }

  const isActiveRoute = (href: string, subItems?: any[]) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }
    if (subItems) {
      return pathname.startsWith(href) || subItems.some((sub) => pathname.startsWith(sub.href))
    }
    return pathname.startsWith(href)
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && <div className="text-lg font-bold text-gray-900 truncate">{churchData.name}</div>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto hidden md:flex"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(false)} className="ml-auto md:hidden">
            <X className="h-4 w-4" />
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
              <div>
                {item.subItems ? (
                  // Item com submenu
                  <div>
                    <button
                      onClick={() => toggleSubmenu(item.href)}
                      className={`flex items-center justify-between w-full gap-3 px-3 py-2 rounded-md transition-colors ${
                        isActiveRoute(item.href, item.subItems)
                          ? "text-white shadow-md"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                      style={isActiveRoute(item.href, item.subItems) ? { backgroundColor: "#89f0e6" } : {}}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && <span className="font-medium">{item.label}</span>}
                      </div>
                      {!isCollapsed && (
                        <ChevronRight
                          className={`h-4 w-4 transition-transform ${
                            expandedMenus.includes(item.href) ? "rotate-90" : ""
                          }`}
                        />
                      )}
                    </button>

                    {/* Submenus */}
                    {!isCollapsed && expandedMenus.includes(item.href) && (
                      <ul className="ml-8 mt-2 space-y-1">
                        {item.subItems.map((subItem) => (
                          <li key={subItem.href}>
                            <Link
                              href={subItem.href}
                              className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                                pathname.startsWith(subItem.href)
                                  ? "bg-teal-100 text-teal-800"
                                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                              }`}
                            >
                              {subItem.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  // Item normal sem submenu
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
                )}
              </div>
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
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50 bg-white shadow-md"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Desktop Sidebar */}
      <div
        className={`hidden md:block bg-white border-r border-gray-200 transition-all duration-300 ${
          isCollapsed ? "w-16" : "w-64"
        } ${className}`}
      >
        <SidebarContent />
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 md:hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </div>
    </>
  )
}
