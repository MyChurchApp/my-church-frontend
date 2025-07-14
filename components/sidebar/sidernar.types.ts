import { User } from "@/lib/types";
import type { Church } from "@/services/church.service";

export interface SubItem {
  label: string;
  href: string;
  accessLevel?: "admin" | "member";
}

export interface MenuItem {
  id: string;
  icon: React.ElementType;
  label: string;
  href: string;
  accessLevel: "admin" | "member";
  subItems?: SubItem[];
}

export interface SidebarContextProps {
  isCollapsed: boolean;
  expandedMenus: string[];
  toggleSubMenu: (id: string) => void;
  isActive: (href: string, subs?: SubItem[]) => boolean;
  expandSidebar: () => void;
}

export interface SidebarContentProps {
  menuItems: MenuItem[];
  church: Church | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export interface SidebarProps {
  user: User | null;
  church: Church | null;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
}
