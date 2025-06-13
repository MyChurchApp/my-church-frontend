"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import {
  getUser,
  getChurchData,
  type User,
  type ChurchData,
} from "@/lib/fake-api";

// Função helper para verificar se o usuário está logado via API real
const isRealUser = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("authToken");
};

// Função para obter dados do usuário real
const getRealUser = (): User | null => {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("userRole");
  const memberData = localStorage.getItem("user");

  if (!token) return null;

  if (memberData) {
    try {
      const member = JSON.parse(memberData);

      const userData: User = {
        id: member.id?.toString() || "1",
        name: member.name || "Usuário",
        email: member.email || "",
        role: role || "Membro",
        accessLevel: role === "Admin" ? "admin" : "member",
        phone: member.phone || "",
        birthDate: member.birthDate ? member.birthDate.split("T")[0] : "",
        isBaptized: member.isBaptized || false,
        baptizedDate: member.baptizedDate
          ? member.baptizedDate.split("T")[0]
          : "",
        isTither: member.isTither || false,
        photo: member.photo || "",
        notes: member.notes || "",
        documents: member.document || [],
        memberSince: member.memberSince ? member.memberSince.split("T")[0] : "",
        maritalStatus: member.maritalStatus || "",
        ministry: member.ministry || "",
        isActive: member.isActive !== undefined ? member.isActive : true,
      };

      return userData;
    } catch (error) {
      console.error("❌ Erro ao parsear dados do member:", error);
    }
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      id: payload.nameid || "1",
      name: payload.name || payload.email || "Usuário",
      email: payload.email || "",
      role: role || "Membro",
      accessLevel: role === "Admin" ? "admin" : "member",
      phone: "",
      documents: [],
    };
  } catch (error) {
    console.error("❌ Erro ao decodificar token:", error);
    return null;
  }
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [churchData, setChurchData] = useState<ChurchData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeDashboard = () => {
      let userData: User | null = null;

      if (isRealUser()) {
        userData = getRealUser();
      } else {
        userData = getUser();
      }

      if (!userData) {
        router.push("/login");
        return;
      }

      setUser(userData);
      setChurchData(getChurchData());
      setIsLoading(false);
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

  if (!user || !churchData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Erro ao carregar dados do usuário</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <h2 className="text-lg font-semibold text-gray-900">
                  {churchData.name}
                </h2>
                <p className="text-sm text-gray-600">
                  Sistema de Gestão Eclesiástica
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-600">{user.role}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
