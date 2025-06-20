"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation"; // ⬅️ 1. pegue a rota atual
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Home,
  Users,
  Calendar,
  DollarSign,
  Settings,
  MessageSquare,
  BookOpen,
  BarChart,
  FileText,
  Bell,
  LogOut,
} from "lucide-react";

interface SidebarContentProps {
  churchName: string;
  churchLogo: string;
  userRole: string;
  loading: boolean;
}

export function SidebarContent({
  churchName,
  churchLogo,
  userRole,
  loading,
}: SidebarContentProps) {
  const pathname = usePathname(); // ⬅️ 2. rota ativa

  const hasPermission = (required: string) =>
    userRole === "Admin" ||
    (userRole === "Pastor" && required !== "Admin") ||
    (userRole === "Leader" &&
      (required === "Leader" || required === "Member")) ||
    (userRole === "Member" && required === "Member");

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  // ⬇️ 3. função para checar se o link está ativo
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const linkBase =
    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors";

  const active = "bg-gray-100 text-gray-900 font-medium";
  const inactive = "text-gray-700 hover:bg-gray-100 hover:text-gray-900";

  return (
    <div className="flex h-full flex-col">
      {/* Logo / nome */}
      <div className="flex items-center gap-2 px-4 py-3">
        {loading ? (
          <>
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </>
        ) : (
          <>
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full">
              {churchLogo ? (
                <Image
                  src={churchLogo}
                  alt={churchName}
                  width={32}
                  height={32}
                />
              ) : (
                <div className="bg-primary text-primary-foreground flex h-full w-full items-center justify-center rounded-full text-lg font-semibold">
                  {churchName.charAt(0)}
                </div>
              )}
            </div>
            <span className="font-medium">{churchName}</span>
          </>
        )}
      </div>

      {/* Navegação */}
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          <Link
            href="/dashboard"
            className={cn(linkBase, isActive("/dashboard") ? active : inactive)}
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>

          {hasPermission("Member") && (
            <Link
              href="/dashboard/membros"
              className={cn(
                linkBase,
                isActive("/dashboard/membros") ? active : inactive
              )}
            >
              <Users className="h-4 w-4" />
              Membros
            </Link>
          )}

          {hasPermission("Member") && (
            <Link
              href="/dashboard/eventos"
              className={cn(
                linkBase,
                isActive("/dashboard/eventos") ? active : inactive
              )}
            >
              <Calendar className="h-4 w-4" />
              Eventos
            </Link>
          )}

          {hasPermission("Leader") && (
            <Link
              href="/dashboard/financeiro"
              className={cn(
                linkBase,
                isActive("/dashboard/financeiro") ? active : inactive
              )}
            >
              <DollarSign className="h-4 w-4" />
              Financeiro
            </Link>
          )}

          {hasPermission("Leader") && (
            <Link
              href="/dashboard/doacoes"
              className={cn(
                linkBase,
                isActive("/dashboard/doacoes") ? active : inactive
              )}
            >
              <DollarSign className="h-4 w-4" />
              Doações
            </Link>
          )}

          {hasPermission("Member") && (
            <Link
              href="/dashboard/comunicacao"
              className={cn(
                linkBase,
                isActive("/dashboard/comunicacao") ? active : inactive
              )}
            >
              <MessageSquare className="h-4 w-4" />
              Comunicação
            </Link>
          )}

          {hasPermission("Member") && (
            <Link
              href="/dashboard/culto"
              className={cn(
                linkBase,
                isActive("/dashboard/culto") ? active : inactive
              )}
            >
              <BookOpen className="h-4 w-4" />
              Culto
            </Link>
          )}

          {hasPermission("Leader") && (
            <Link
              href="/dashboard/relatorios"
              className={cn(
                linkBase,
                isActive("/dashboard/relatorios") ? active : inactive
              )}
            >
              <BarChart className="h-4 w-4" />
              Relatórios
            </Link>
          )}

          {hasPermission("Member") && (
            <Link
              href="/dashboard/documentos"
              className={cn(
                linkBase,
                isActive("/dashboard/documentos") ? active : inactive
              )}
            >
              <FileText className="h-4 w-4" />
              Documentos
            </Link>
          )}

          {hasPermission("Member") && (
            <Link
              href="/dashboard/notificacoes"
              className={cn(
                linkBase,
                isActive("/dashboard/notificacoes") ? active : inactive
              )}
            >
              <Bell className="h-4 w-4" />
              Notificações
            </Link>
          )}

          {hasPermission("Admin") && (
            <Link
              href="/dashboard/configuracoes"
              className={cn(
                linkBase,
                isActive("/dashboard/configuracoes") ? active : inactive
              )}
            >
              <Settings className="h-4 w-4" />
              Configurações
            </Link>
          )}
        </nav>
      </div>

      {/* Logout */}
      <div className="mt-auto border-t p-2">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </div>
  );
}
