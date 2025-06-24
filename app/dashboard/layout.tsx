"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  getToken,
  getUserData,
  getChurchInfo,
  getUser,
} from "@/lib/auth-utils";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Menu } from "lucide-react";
import SidebarMenu from "@/components/sidebar/SidebarMenu";

const useLocalStorage = (key: string, initialValue: boolean) => {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: boolean | ((val: boolean) => boolean)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };
  return [storedValue, setValue] as const;
};

const getPageTitle = (pathname: string): string => {
  const titleMap: { [key: string]: string } = {
    "/dashboard": "Dashboard",
    "/dashboard/membros": "Membros",
    "/dashboard/eventos": "Agenda de Eventos",
    "/dashboard/culto": "Acompanhar Culto",
    "/dashboard/culto/gestao": "Gestão de Cultos",
    "/dashboard/doacoes": "Faça a Diferença Hoje",
    "/dashboard/doacoes/historico": "Histórico de Ofertas",
    "/dashboard/ativos": "Ativos da Igreja",
  };

  if (titleMap[pathname]) {
    return titleMap[pathname];
  }

  const lastSegment = pathname.split("/").pop() || "Página";
  const formattedTitle = lastSegment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return formattedTitle;
};

const getPageSubtitle = (pathname: string): string => {
  const subtitleMap: { [key: string]: string } = {
    "/dashboard": "Visão geral da sua igreja.",
    "/dashboard/membros": "Gerencie os membros da sua organização.",
    "/dashboard/eventos": "Crie e administre os eventos da sua comunidade.",
    "/dashboard/culto": "Detalhes e planejamento dos próximos cultos.",
    "/dashboard/doacoes": "Acompanhe as contribuições e apoie esta obra.",
  };

  return subtitleMap[pathname] || "";
};

const getInitials = (name: string) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

export const DashboardHeader = ({ user, onMenuClick }: any) => {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const pageSubtitle = getPageSubtitle(pathname);
  const router = useRouter();

  useEffect(() => {
    // Verificar se o usuário é admin
    const user = getUser();
    if (!user || user.accessLevel !== "admin") {
      router.push("/dashboard");
      return;
    }
  }, [router]);

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex-shrink-0 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        {/* Lado Esquerdo: Alterna entre Botão e Título */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            aria-label="Abrir menu"
          >
            <Menu className="h-6 w-6 text-gray-700" />
          </Button>
          <div className="">
            <h1 className="text-xl font-semibold text-gray-800">{pageTitle}</h1>
            {pageSubtitle && (
              <p className="text-sm text-gray-500 mt-0.5">{pageSubtitle}</p>
            )}
          </div>
        </div>

        {/* Lado Direito: Informações do Usuário */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right">
            <p className="font-medium text-gray-900 text-sm">{user.name}</p>
            <p className="text-xs text-gray-500 capitalize">
              {user.accessLevel || "Membro"}
            </p>
          </div>
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 font-bold">
              {getInitials(user.name)}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [church, setChurch] = useState<any>(null);

  const [isCollapsed, setIsCollapsed] = useLocalStorage(
    "sidebar-collapsed",
    false
  );
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const initializeDashboard = () => {
      try {
        const token = getToken();
        if (!token) {
          router.push("/login");
          return;
        }
        const userData = getUserData();
        const churchData = getChurchInfo();
        if (!userData) {
          setError("Erro ao carregar dados do usuário");
          return;
        }
        setUser(userData);
        setChurch(churchData);
      } catch (error) {
        console.error("❌ Erro ao inicializar dashboard:", error);
        setError("Erro ao inicializar dashboard");
      } finally {
        setIsLoading(false);
      }
    };
    initializeDashboard();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white shadow-md rounded-lg">
          <p className="text-red-600 mb-4 font-semibold">
            {error || "Erro ao carregar dados"}
          </p>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  const mainContentClass = "";

  return (
    <div className="min-h-screen bg-gray-100">
      <SidebarMenu
        user={user}
        church={church}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      <div
        className={clsx(
          "flex flex-col h-screen transition-[margin-left] duration-300 ease-in-out",
          isCollapsed ? "md:ml-20" : "md:ml-64"
        )}
      >
        <DashboardHeader
          user={user}
          onMenuClick={() => setIsMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
