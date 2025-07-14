// components/sidebar/sidernar.types.ts

// --- Tipos para o Usuário e Igreja (a serem adaptados conforme sua necessidade) ---
export interface User {
  id: string;
  name: string;
  email: string;
  accessLevel: "admin" | "member"; // Exemplo
}

export interface Church {
  id: string;
  name: string;
}

// --- Tipos para os Itens do Menu ---
export interface SubItem {
  label: string;
  href: string;
  accessLevel?: "admin" | "member";
}

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  accessLevel: "admin" | "member";
  subItems?: SubItem[];
}

// --- Tipos para as Props dos Componentes da Sidebar ---

export interface SidebarProps {
  user: User | null;
  church: Church | null;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
}

export interface SidebarContentProps {
  menuItems: MenuItem[];
  church: Church | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

// Interface do Contexto da Sidebar (COM A CORREÇÃO)
export interface SidebarContextProps {
  isCollapsed: boolean;
  expandedMenus: string[];
  toggleSubMenu: (id: string) => void;
  isActive: (href: string, subs?: SubItem[]) => boolean;
  expandSidebar: () => void; // <--- PROPRIEDADE ADICIONADA AQUI
}
