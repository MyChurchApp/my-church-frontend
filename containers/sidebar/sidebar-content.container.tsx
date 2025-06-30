"use client";

import { useState, useEffect } from "react";
import { SidebarContent } from "../../components/sidebar/sidebar-content";

import { getUser } from "@/lib/auth-utils";

export function SidebarContentContainer() {
  const [churchName, setChurchName] = useState("");
  const [churchLogo, setChurchLogo] = useState("");
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Obter o papel do usuário
        const role = getUser();
        setUserRole(role);
      } catch (error) {
        console.error("Erro ao carregar dados para o sidebar:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <SidebarContent
      churchName={churchName}
      churchLogo={churchLogo}
      userRole={userRole}
      loading={loading}
    />
  );
}
