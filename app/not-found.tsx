"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth-utils";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();

    if (token) {
      console.log(
        "Usuário logado encontrado em página 404. Redirecionando para /dashboard..."
      );
      router.replace("/dashboard");
    } else {
      console.log(
        "Usuário deslogado encontrado em página 404. Redirecionando para /..."
      );
      router.replace("/");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1d5991] mx-auto mb-6"></div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Página não encontrada
        </h1>
        <p className="text-gray-600">Você será redirecionado em breve...</p>
      </div>
    </div>
  );
}
