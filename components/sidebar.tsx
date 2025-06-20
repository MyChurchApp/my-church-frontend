"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
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
  Book,
} from "lucide-react";
import { getUserData, logout } from "@/lib/auth-utils";

type Role = "admin" | "member";

interface SubItem {
  label: string;
  href: string;
  accessLevel?: Role;
}

interface MenuItem {
  icon: any;
  label: string;
  href: string;
  accessLevel: Role;
  subItems?: SubItem[];
}

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className = "" }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [churchData, setChurchData] = useState<{
    id: string;
    name: string;
    logo: string;
  } | null>(null);

  const pathname = usePathname();

  useEffect(() => {
    setUser(getUserData());
    setChurchData({ id: "1", name: "MyChurch", logo: "/mychurch-logo.png" });
  }, []);

  useEffect(() => setIsMobileOpen(false), [pathname]);

  useEffect(() => {
    if (!isMobileOpen) return;
    const scrollY = window.scrollY;
    document.body.style.cssText = `position:fixed;top:-${scrollY}px;width:100%;overflow:hidden`;
    return () => {
      document.body.style.cssText = "";
      window.scrollTo(0, scrollY);
    };
  }, [isMobileOpen]);

  const rawMenu: MenuItem[] = [
    { icon: Home, label: "Início", href: "/dashboard", accessLevel: "member" },

    {
      icon: Users,
      label: "Membros",
      href: "/dashboard/membros",
      accessLevel: "admin",
    },

    {
      icon: Calendar,
      label: "Eventos",
      href: "/dashboard/eventos",
      accessLevel: "member",
    },

    {
      icon: Book,
      label: "Culto",
      href: "/dashboard/culto",
      accessLevel: "member",
      subItems: [
        {
          label: "Acompanhar Culto",
          href: "/dashboard/culto",
          accessLevel: "member",
        },
        {
          label: "Gestão de Culto",
          href: "/dashboard/culto/gestao",
          accessLevel: "admin",
        },
      ],
    },

    {
      icon: Heart,
      label: "Doações",
      href: "/dashboard/doacoes",
      accessLevel: "member",
      subItems: [
        { label: "Ofertar", href: "/dashboard/doacoes", accessLevel: "member" },
        {
          label: "Histórico",
          href: "/dashboard/doacoes/historico",
          accessLevel: "admin",
        },
      ],
    },

    {
      icon: MessageSquare,
      label: "Comunicação",
      href: "/dashboard/comunicacao",
      accessLevel: "admin",
      subItems: [
        {
          label: "Nova Publicação",
          href: "/dashboard/comunicacao/nova-publicacao",
          accessLevel: "admin",
        },
        {
          label: "WhatsApp",
          href: "/dashboard/comunicacao/whatsapp",
          accessLevel: "admin",
        },
      ],
    },

    {
      icon: DollarSign,
      label: "Financeiro",
      href: "/dashboard/financeiro",
      accessLevel: "admin",
      subItems: [
        {
          label: "Fluxo de Caixa",
          href: "/dashboard/financeiro",
          accessLevel: "admin",
        },
        {
          label: "Transferir Doações",
          href: "/dashboard/financeiro/ofertas-realizadas",
          accessLevel: "admin",
        },
      ],
    },

    {
      icon: Package,
      label: "Ativos",
      href: "/dashboard/ativos",
      accessLevel: "admin",
    },

    {
      icon: Settings,
      label: "Configurações",
      href: "/dashboard/configuracoes",
      accessLevel: "admin",
    },
  ];

  const filterByRole = (items: MenuItem[]): MenuItem[] =>
    items
      .map((item) => {
        const parentAllowed =
          user?.accessLevel === "admin" || item.accessLevel === "member";

        const subItems = item.subItems?.filter((sub) => {
          const level = sub.accessLevel ?? item.accessLevel;
          return user?.accessLevel === "admin" || level === "member";
        });

        if (!parentAllowed && (!subItems || subItems.length === 0)) return null;

        if (!parentAllowed && subItems && subItems.length > 0) {
          return { ...item, href: subItems[0].href, subItems };
        }

        return { ...item, subItems };
      })
      .filter(Boolean) as MenuItem[];

  const menuItems = filterByRole(rawMenu);

  const toggleSub = (href: string) =>
    setExpandedMenus((prev) =>
      prev.includes(href) ? prev.filter((i) => i !== href) : [...prev, href]
    );

  const isActive = (href: string, subs?: SubItem[]) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href) ||
        subs?.some((s) => pathname.startsWith(s.href));

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <span className="font-bold truncate">{churchData?.name}</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              {item.subItems && item.subItems.length ? (
                <>
                  <button
                    onClick={() => toggleSub(item.href)}
                    className={`flex w-full items-center justify-between gap-3 px-3 py-2 rounded-md transition-colors ${
                      isActive(item.href, item.subItems)
                        ? "text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    style={
                      isActive(item.href, item.subItems)
                        ? { background: "#89f0e6" }
                        : {}
                    }
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span>{item.label}</span>}
                    </div>
                    {!isCollapsed && (
                      <ChevronRight
                        className={`h-4 w-4 transform transition-transform ${
                          expandedMenus.includes(item.href) ? "rotate-90" : ""
                        }`}
                      />
                    )}
                  </button>

                  {!isCollapsed && expandedMenus.includes(item.href) && (
                    <ul className="ml-8 mt-1 space-y-1">
                      {item.subItems!.map((sub) => (
                        <li key={sub.href}>
                          <Link
                            href={sub.href}
                            className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                              pathname.startsWith(sub.href)
                                ? "bg-teal-100 text-teal-800"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            }`}
                          >
                            {sub.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActive(item.href)
                      ? "text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                  style={isActive(item.href) ? { background: "#89f0e6" } : {}}
                >
                  <item.icon className="h-5 w-5" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          onClick={logout}
          className={`w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 ${
            isCollapsed ? "px-2" : "px-3"
          }`}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="ml-3">Sair</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50 bg-white shadow-md"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div
        className={`hidden md:block bg-white border-r border-gray-200 transition-all duration-300 ${
          isCollapsed ? "w-16" : "w-64"
        } ${className}`}
      >
        <SidebarContent />
      </div>

      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 md:hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </div>
    </>
  );
}
