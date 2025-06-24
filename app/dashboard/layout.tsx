"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, getUserData, getChurchInfo } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import clsx from "clsx";
import { Sidebar } from "@/components/sidebar";

// Hook para salvar o estado de recolhimento no localStorage
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

const DashboardHeader = ({ onMenuClick, user }: any) => {
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4"></div>
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right">
            <p className="font-medium text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-600">{user.role}</p>
          </div>
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-medium">
              {user.name
                ?.split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2) || "U"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

// COMPONENTE PRINCIPAL DO LAYOUT
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
      <Sidebar
        user={user}
        church={church}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <div
        className={clsx(
          "flex flex-col transition-[margin-left] duration-300 ease-in-out",
          isCollapsed ? "md:ml-20" : "md:ml-64"
        )}
      >
        <DashboardHeader
          onMenuClick={() => setIsMobileOpen(true)}
          user={user}
        />

        <main className={mainContentClass}>
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
