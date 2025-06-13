"use client"; // Adicionar "use client" pois importa client components

import type React from "react";
import { Sidebar } from "@/components/sidebar";

export default function CultoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-800">
      <Sidebar />
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <main>
          {/* Adiciona um container para o conteúdo principal, similar a outros dashboards */}
          <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
