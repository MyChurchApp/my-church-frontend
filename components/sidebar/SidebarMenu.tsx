"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, ChevronLeft, ChevronRight, X } from "lucide-react";
import { logout } from "@/lib/auth-utils";
import clsx from "clsx";
import FocusTrap from "focus-trap-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MenuItem,
  SidebarContextProps,
  SidebarProps,
  SubItem,
} from "./sidernar.types";
import { rawMenu } from "./sidebar.constant";

// --- Contexto da Sidebar ---
const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);
const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context)
    throw new Error("useSidebar deve ser usado dentro de um SidebarProvider");
  return context;
};

// --- Subcomponente: Item do Menu ---
const SidebarMenuItem = ({ item }: { item: MenuItem }) => {
  const { isCollapsed, isActive, expandedMenus, toggleSubMenu, expandSidebar } =
    useSidebar();
  const pathname = usePathname();
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const isExpanded = expandedMenus.includes(item.id);

  const handleClick = () => {
    if (isCollapsed && hasSubItems) {
      expandSidebar();
    }
    toggleSubMenu(item.id);
  };

  const itemContent = (
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

  const menuItemElement = hasSubItems ? (
    <div>
      <button
        onClick={handleClick}
        aria-expanded={isExpanded}
        aria-controls={`submenu-${item.id}`}
        className={clsx(
          commonClasses,
          "justify-between",
          itemIsActive ? activeClasses : inactiveClasses
        )}
      >
        <div className="flex items-center gap-3 min-w-0">{itemContent}</div>
        {!isCollapsed && (
          <ChevronRight
            className={clsx(
              "h-4 w-4 transform transition-transform duration-300",
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
                  "block px-3 py-1.5 text-sm rounded-md",
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
      {itemContent}
    </Link>
  );

  return (
    <li>
      {isCollapsed ? (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>{menuItemElement}</TooltipTrigger>
            <TooltipContent
              side="right"
              className="bg-gray-900 text-white border-gray-700"
            >
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        menuItemElement
      )}
    </li>
  );
};

interface InternalSidebarProps {
  menuItems: MenuItem[];
  church: SidebarProps["church"];
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
  closeButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

const InternalSidebarContent = ({
  menuItems,
  church,
  onToggleCollapse,
  onCloseMobile,
  closeButtonRef,
}: InternalSidebarProps) => {
  const { isCollapsed } = useSidebar();
  const router = useRouter();
  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 text-white border-r border-gray-700">
      <div
        className="flex items-center justify-between h-16 px-4 border-b border-gray-700 flex-shrink-0 cursor-pointer"
        onClick={onToggleCollapse}
      >
        <span
          className={clsx(
            "font-bold text-lg text-white transition-opacity duration-200 truncate",
            isCollapsed && "opacity-0 w-0"
          )}
        >
          {church?.name || "MyChurch"}
        </span>

        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse();
            }}
            aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
            className="hidden md:flex text-gray-400 hover:text-white hover:bg-gray-700"
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        )}

        {onCloseMobile && (
          <Button
            ref={closeButtonRef}
            variant="ghost"
            size="icon"
            onClick={onCloseMobile}
            aria-label="Fechar menu"
            className="text-gray-400 hover:text-white hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
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

// --- COMPONENTE PRINCIPAL DA SIDEBAR (EXPORTADO) ---

export default function SidebarMenu({
  user,
  church,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}: SidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const pathname = usePathname();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const filterByRole = useCallback(
    (items: MenuItem[]): MenuItem[] =>
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
          if (!parentAllowed && (!subItems || subItems.length === 0))
            return null;
          if (!parentAllowed && subItems && subItems.length > 0)
            return { ...item, href: subItems[0].href, subItems };
          return { ...item, subItems };
        })
        .filter(Boolean) as MenuItem[],
    [user]
  );

  const menuItems = user ? filterByRole(rawMenu) : [];

  useEffect(() => {
    const activeParent = menuItems.find((item) =>
      item.subItems?.some((sub) => sub.href === pathname)
    );
    if (activeParent && !expandedMenus.includes(activeParent.id)) {
      setExpandedMenus([activeParent.id]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, menuItems]);

  const isActive = (href: string, subs?: SubItem[]): boolean => {
    if (href === "/dashboard" && pathname === "/dashboard") return true;
    if (href === "/dashboard" && pathname !== "/dashboard") return false;
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
    expandSidebar: () => setIsCollapsed(false),
  };

  return (
    <>
      <aside
        className={clsx(
          "hidden md:flex flex-col fixed inset-y-0 left-0 z-30 transition-all duration-300",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <SidebarContext.Provider value={sidebarProviderValue}>
          <InternalSidebarContent
            menuItems={menuItems}
            church={church}
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
        <FocusTrap
          active={isMobileOpen}
          focusTrapOptions={{
            onDeactivate: () => setIsMobileOpen(false),
            clickOutsideDeactivates: true,
            initialFocus: () => closeButtonRef.current,
            fallbackFocus: "#mobile-sidebar-content",
          }}
        >
          <div
            id="mobile-sidebar-content"
            role="dialog"
            aria-modal="true"
            className={clsx(
              "fixed top-0 left-0 h-full w-72 z-50 transform transition-transform duration-300",
              isMobileOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <SidebarContext.Provider
              value={{ ...sidebarProviderValue, isCollapsed: false }}
            >
              <InternalSidebarContent
                menuItems={menuItems}
                church={church}
                onCloseMobile={() => setIsMobileOpen(false)}
                closeButtonRef={closeButtonRef}
              />
            </SidebarContext.Provider>
          </div>
        </FocusTrap>
      </div>
    </>
  );
}
