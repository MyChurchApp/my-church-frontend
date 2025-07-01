"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { Church } from "lucide-react";
import { useMemo } from "react";
import { LoginPageProps } from "./login.types";

export default function LoginComponent({
  identifier,
  password,
  showPassword,
  isLoading,
  error,
  togglePasswordVisibility,
  handleIdentifierChange,
  handlePasswordChange,
  handleSubmit,
}: LoginPageProps) {
  function AppHeader() {
    return (
      <header className="w-full py-4 px-6 flex justify-center border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2">
          <Church className="mr-2 h-6 w-6" />
          MyChurch
        </Link>
      </header>
    );
  }

  function AppFooter() {
    return (
      <footer className="w-full py-4 px-6 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} MyChurch. Todos os direitos
            reservados.
          </p>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <Link
              href="/suporte"
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Suporte
            </Link>
            <Link
              href="/privacidade"
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Privacidade
            </Link>
            <Link
              href="/termos"
              className="text-xs text-gray-500 hover:text-gray-900"
            >
              Termos
            </Link>
          </div>
        </div>
      </footer>
    );
  }

  const authError = useMemo(() => {
    return (
      error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )
    );
  }, [error]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      <AppHeader />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8 sm:p-10">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-medium text-gray-900 mb-2">
                  Entrar no MyChurch
                </h1>
                <p className="text-gray-500 text-sm">
                  Acesse sua conta para gerenciar sua igreja
                </p>
              </div>
              {authError}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="identifier"
                    className="text-sm font-medium text-gray-700"
                  >
                    CPF ou Email
                  </Label>
                  <Input
                    id="identifier"
                    type="text"
                    value={identifier}
                    onChange={handleIdentifierChange}
                    placeholder="000.000.000-00 ou email@exemplo.com"
                    required
                    className="h-11 rounded-xl border-gray-300 bg-gray-50 focus:border-gray-500 focus:ring-gray-500 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-700"
                    >
                      Senha
                    </Label>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder="••••••••"
                      required
                      className="h-11 rounded-xl border-gray-300 bg-gray-50 focus:border-gray-500 focus:ring-gray-500 transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 rounded-xl bg-gray-900 hover:bg-black text-white transition-colors disabled:opacity-50"
                  >
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>
                </div>
              </form>

              <div className="flex flex-col mt-8 text-center">
                <p className="text-sm text-gray-600">
                  Não tem uma conta?{" "}
                  <Link
                    href="/cadastro"
                    className="font-medium text-gray-900 hover:text-gray-700 transition-colors"
                  >
                    Criar conta
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Ao entrar, você concorda com nossos{" "}
              <Link
                href="/termos"
                className="text-gray-700 hover:text-gray-900"
              >
                Termos de Serviço
              </Link>{" "}
              e{" "}
              <Link
                href="/privacidade"
                className="text-gray-700 hover:text-gray-900"
              >
                Política de Privacidade
              </Link>
            </p>
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
