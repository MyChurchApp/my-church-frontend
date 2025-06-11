"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { DashboardHeaderContainer } from "./containers/header/dashboard-header.container";
import { StatsCardsContainer } from "./containers/stats/stats-cards.container";
import { FeedSectionContainer } from "./containers/feed/feed-section.container";
import { SidebarContentContainer } from "./containers/sidebar/sidebar-content.container";
import {
  getUser,
  getChurchData,
  type User,
  type ChurchData,
} from "@/lib/fake-api";
import { useSignalR } from "./useSignalR";

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

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [churchData, setChurchData] = useState<ChurchData | null>(null);

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
    };

    initializeDashboard();
  }, [router]);

  // Inicia SignalR passando ID do culto (troque "1" se precisar)
  useSignalR(1);

  if (!user || !churchData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeaderContainer
          user={user}
          churchData={churchData}
          onUserUpdate={setUser}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6">
            {user.accessLevel === "admin" && (
              <StatsCardsContainer churchData={churchData} />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
              <FeedSectionContainer user={user} />
              <SidebarContentContainer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
