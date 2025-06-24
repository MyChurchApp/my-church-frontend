"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  X,
  Package,
  Heart,
  Book,
  BookHeart,
} from "lucide-react";
import { logout } from "@/lib/auth-utils";
import clsx from "clsx";
import FocusTrap from "focus-trap-react";

// TIPOS E DADOS
type Role = "admin" | "member";
interface User {
  name: string;
  accessLevel: Role;
}
interface Church {
  name: string;
}
interface SubItem {
  label: string;
  href: string;
  accessLevel?: Role;
}
interface MenuItem {
  id: string;
  icon: React.ElementType;
  label: string;
  href: string;
  accessLevel: Role;
  subItems?: SubItem[];
}

const rawMenu: MenuItem[] = [
  {
    id: "home",
    icon: Home,
    label: "Início",
    href: "/dashboard",
    accessLevel: "member",
  },
  {
    id: "members",
    icon: Users,
    label: "Membros",
    href: "/dashboard/membros",
    accessLevel: "admin",
  },
  {
    id: "events",
    icon: Calendar,
    label: "Eventos",
    href: "/dashboard/eventos",
    accessLevel: "member",
  },
  {
    id: "service",
    icon: Book,
    label: "Culto",
    href: "/dashboard/culto",
    accessLevel: "member",
    subItems: [
      { label: "Acompanhar", href: "/dashboard/culto", accessLevel: "member" },
      {
        label: "Gestão",
        href: "/dashboard/culto/gestao",
        accessLevel: "admin",
      },
    ],
  },
  {
    id: "donations",
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
    id: "bible",
    icon: BookHeart,
    label: "Bíblia",
    href: "/biblia",
    accessLevel: "member",
  },
  {
    id: "communication",
    icon: MessageSquare,
    label: "Comunicação",
    href: "/dashboard/comunicacao",
    accessLevel: "admin",
  },
  {
    id: "finance",
    icon: DollarSign,
    label: "Financeiro",
    href: "/dashboard/financeiro",
    accessLevel: "admin",
  },
  {
    id: "assets",
    icon: Package,
    label: "Ativos",
    href: "/dashboard/ativos",
    accessLevel: "admin",
  },
  {
    id: "settings",
    icon: Settings,
    label: "Configurações",
    href: "/dashboard/configuracoes",
    accessLevel: "admin",
  },
];

// CONTEXTO INTERNO
interface SidebarContextProps {
  isCollapsed: boolean;
  expandedMenus: string[];
  toggleSubMenu: (id: string) => void;
  isActive: (href: string, subs?: SubItem[]) => boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);
const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context)
    throw new Error("useSidebar must be used within a SidebarProvider");
  return context;
};

// SUBCOMPONENTES
const SidebarMenuItem = ({ item }: { item: MenuItem }) => {
  const { isCollapsed, isActive, expandedMenus, toggleSubMenu } = useSidebar();
  const pathname = usePathname();
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const isExpanded = expandedMenus.includes(item.id);

  const renderContent = () => (
    <>
      <item.icon className="h-5 w-5 flex-shrink-0" />
      <span
        className={clsx(
          "truncate transition-opacity duration-200",
          isCollapsed && "w-0 opacity-0"
        )}
      >
        {item.label}
      </span>
    </>
  );

  const commonClasses =
    "flex items-center gap-3 w-full text-sm px-3 py-2.5 rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:ring-white";
  const activeClasses = "bg-[#1d5991] text-white font-semibold";
  const inactiveClasses = "text-gray-300 hover:bg-gray-700 hover:text-white";
  const itemIsActive = isActive(item.href, item.subItems);

  return (
    <li>
      {hasSubItems ? (
        <div>
          <button
            onClick={() => toggleSubMenu(item.id)}
            aria-expanded={isExpanded}
            aria-controls={`submenu-${item.id}`}
            className={clsx(
              commonClasses,
              "justify-between",
              itemIsActive ? activeClasses : inactiveClasses
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              {renderContent()}
            </div>
            {!isCollapsed && (
              <ChevronRight
                className={clsx(
                  "h-4 w-4 transform transition-transform duration-300 flex-shrink-0",
                  isExpanded && "rotate-90"
                )}
              />
            )}
          </button>
          <div
            className={clsx(
              "overflow-hidden transition-[max-height] duration-300 ease-in-out",
              isExpanded && !isCollapsed ? "max-h-screen" : "max-h-0"
            )}
          >
            <ul
              id={`submenu-${item.id}`}
              className="ml-4 mt-1 space-y-1 border-l border-gray-700 pl-4 py-1"
            >
              {item.subItems!.map((sub) => (
                <li key={sub.href}>
                  <Link
                    href={sub.href}
                    className={clsx(
                      "block px-3 py-1.5 text-sm rounded-md transition-colors",
                      pathname === sub.href
                        ? "text-white font-medium"
                        : "text-gray-400 hover:text-white"
                    )}
                  >
                    {sub.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <Link
          href={item.href}
          className={clsx(
            commonClasses,
            itemIsActive ? activeClasses : inactiveClasses
          )}
        >
          {renderContent()}
        </Link>
      )}
    </li>
  );
};

const SidebarContent = ({
  menuItems,
  church,
  isCollapsed,
  onToggleCollapse,
}: any) => {
  const router = useRouter();
  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 text-white border-r border-gray-700">
      <div
        className="flex items-center h-16 px-4 border-b border-gray-700 flex-shrink-0 cursor-pointer"
        onClick={onToggleCollapse}
      >
        <div className="flex items-center justify-between w-full">
          <span
            className={clsx(
              "font-bold text-lg text-white transition-opacity duration-200",
              isCollapsed && "opacity-0 w-0"
            )}
          >
            {church?.name || "MyChurch"}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
            className="hidden md:flex text-gray-400 hover:text-white hover:bg-gray-700"
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1.5">
          {menuItems.map((item: MenuItem) => (
            <SidebarMenuItem key={item.id} item={item} />
          ))}
        </ul>
      </nav>
      <div className="px-3 py-4 border-t border-gray-700 flex-shrink-0">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={clsx(
            "w-full justify-start text-red-500 hover:text-red-400 hover:bg-red-500/10",
            isCollapsed ? "px-2.5" : "px-3"
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span
            className={clsx(
              "ml-3 truncate transition-opacity duration-200",
              isCollapsed && "opacity-0"
            )}
          >
            Sair
          </span>
        </Button>
      </div>
    </div>
  );
};

// COMPONENTE PRINCIPAL DA SIDEBAR
interface SidebarProps {
  user: User | null;
  church: Church | null;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
}

export function Sidebar({
  user,
  church,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}: SidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname, setIsMobileOpen]);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setIsMobileOpen]);

  const filterByRole = (items: MenuItem[]): MenuItem[] =>
    items
      .map((item) => {
        if (!user) return null;
        const parentAllowed =
          user.accessLevel === "admin" || item.accessLevel === "member";
        const subItems = item.subItems?.filter(
          (sub) =>
            (sub.accessLevel ?? item.accessLevel) === "member" ||
            user.accessLevel === "admin"
        );
        if (!parentAllowed && (!subItems || subItems.length === 0)) return null;
        if (!parentAllowed && subItems && subItems.length > 0)
          return { ...item, href: subItems[0].href, subItems };
        return { ...item, subItems };
      })
      .filter(Boolean) as MenuItem[];

  const menuItems = user ? filterByRole(rawMenu) : [];

  const isActive = (href: string, subs?: SubItem[]): boolean => {
    if (href === "/dashboard" && pathname === "/dashboard") return true;
    const isParentActive = href !== "/dashboard" && pathname.startsWith(href);
    const isChildActive = subs?.some((s) => pathname === s.href) ?? false;
    return isParentActive || isChildActive;
  };

  const sidebarProviderValue: SidebarContextProps = {
    isCollapsed,
    expandedMenus,
    toggleSubMenu: (id: string) =>
      setExpandedMenus((p) =>
        p.includes(id) ? p.filter((i) => i !== id) : [...p, id]
      ),
    isActive,
  };

  return (
    <>
      <aside
        className={clsx(
          "hidden md:flex flex-col fixed inset-y-0 left-0 z-30 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <SidebarContext.Provider value={sidebarProviderValue}>
          <SidebarContent
            menuItems={menuItems}
            church={church}
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          />
        </SidebarContext.Provider>
      </aside>

      <div className="md:hidden">
        <div
          className={clsx(
            "fixed inset-0 bg-black/60 z-40 transition-opacity",
            isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
        <FocusTrap active={isMobileOpen}>
          <div
            role="dialog"
            aria-modal="true"
            className={clsx(
              "fixed top-0 left-0 h-full w-72 z-50 transform transition-transform duration-300 ease-in-out",
              isMobileOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <SidebarContext.Provider
              value={{ ...sidebarProviderValue, isCollapsed: false }}
            >
              <div className="flex flex-col h-full bg-gray-800 text-white border-r border-gray-700">
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700 flex-shrink-0">
                  <h2 className="font-bold text-lg text-white">
                    {church?.name || "MyChurch"}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileOpen(false)}
                    aria-label="Fechar menu"
                    className="text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <nav className="flex-1 px-3 py-4 overflow-y-auto">
                  <ul className="space-y-1.5">
                    {menuItems.map((item) => (
                      <SidebarMenuItem key={item.id} item={item} />
                    ))}
                  </ul>
                </nav>
                <div className="px-3 py-4 border-t border-gray-700 flex-shrink-0">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      logout();
                    }}
                    className="w-full justify-start text-red-500 hover:text-red-400 hover:bg-red-500/10 px-3"
                  >
                    <LogOut className="h-5 w-5 flex-shrink-0" />
                    <span className="ml-3 truncate">Sair</span>
                  </Button>
                </div>
              </div>
            </SidebarContext.Provider>
          </div>
        </FocusTrap>
      </div>
    </>
  );
}
