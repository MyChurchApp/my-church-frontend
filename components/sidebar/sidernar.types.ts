export type Role = "admin" | "member";
export interface User {
  name: string;
  accessLevel: Role;
}
export interface Church {
  name: string;
}
export interface SubItem {
  label: string;
  href: string;
  accessLevel?: Role;
}
export interface MenuItem {
  id: string;
  icon: React.ElementType;
  label: string;
  href: string;
  accessLevel: Role;
  subItems?: SubItem[];
}

export interface SidebarContextProps {
  isCollapsed: boolean;
  expandedMenus: string[];
  toggleSubMenu: (id: string) => void;
  isActive: (href: string, subs?: SubItem[]) => boolean;
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
