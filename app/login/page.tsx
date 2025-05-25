"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, AlertCircle } from "lucide-react"
// Remover esta linha:
// import { useLanguage } from "@/contexts/language-context"

export default function LoginPage() {
  // Remover esta linha:
  // const { t } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const planoParam = searchParams.get("plano")
  const redirectParam = searchParams.get("redirect")

  const [showPassword, setShowPassword] = useState(false)
  const [cpf, setCpf] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const formatCPF = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, "")

    // Aplica a máscara do CPF
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    }
    return value
  }

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    setCpf(formatted)
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Simular delay de autenticação
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Login fake - CPF: 123456 (admin) e 654321 (membro), senha: 123
      const cleanCpf = cpf.replace(/\D/g, "")

      console.log("Tentativa de login:", { cleanCpf, password }) // Debug

      if ((cleanCpf === "123456" || cleanCpf === "654321") && password === "123") {
        // Criar dados do usuário baseado no CPF
        const userData =
          cleanCpf === "123456"
            ? {
                cpf: "123456",
                name: "Pastor João Silva",
                church: "Igreja Batista Central",
                role: "Pastor Principal",
                accessLevel: "admin" as const,
              }
            : {
                cpf: "654321",
                name: "Maria Santos",
                church: "Igreja Batista Central",
                role: "Membro",
                accessLevel: "member" as const,
              }

        // Salvar dados do usuário no localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(userData))
        }

        // Redirecionar conforme parâmetros ou para dashboard
        if (redirectParam === "checkout" && planoParam) {
          router.push(`/planos/checkout?plano=${planoParam}`)
        } else {
          router.push("/dashboard")
        }
      } else {
        setError("CPF ou senha incorretos. Use CPF: 123456 (admin) ou 654321 (membro) e senha: 123")
      }
    } catch (error) {
      console.error("Erro no login:", error)
      setError("Erro interno. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <header className="w-full py-4 px-6 flex justify-center border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/mychurch-logo.png" alt="MyChurch Logo" width={24} height={24} />
          <span className="text-lg font-medium text-gray-900">MyChurch</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8 sm:p-10">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-medium text-gray-900 mb-2">Entrar no MyChurch</h1>
                <p className="text-gray-500 text-sm">Acesse sua conta para gerenciar sua igreja</p>
              </div>

              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="cpf" className="text-sm font-medium text-gray-700">
                    CPF
                  </Label>
                  <Input
                    id="cpf"
                    type="text"
                    value={cpf}
                    onChange={handleCpfChange}
                    placeholder="000.000.000-00"
                    required
                    maxLength={14}
                    className="h-11 rounded-xl border-gray-300 bg-gray-50 focus:border-gray-500 focus:ring-gray-500 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Senha
                    </Label>
                    <Link
                      href="/recuperar-senha"
                      className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="h-11 rounded-xl border-gray-300 bg-gray-50 focus:border-gray-500 focus:ring-gray-500 transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="flex items-center">
                    <Checkbox
                      id="remember-me"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="h-4 w-4 text-gray-900 focus:ring-gray-500 border-gray-300 rounded"
                    />
                    <Label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Lembrar de mim
                    </Label>
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

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  Não tem uma conta?{" "}
                  <Link href="/cadastro" className="font-medium text-gray-900 hover:text-gray-700 transition-colors">
                    Criar conta
                  </Link>
                </p>
              </div>

              {/* Credenciais de teste */}
              <div className="mt-6 space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-xs text-blue-700 font-medium mb-1">👨‍💼 Administrador:</p>
                  <p className="text-xs text-blue-600">CPF: 123456 | Senha: 123</p>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-xs text-green-700 font-medium mb-1">👤 Membro:</p>
                  <p className="text-xs text-green-600">CPF: 654321 | Senha: 123</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Ao entrar, você concorda com nossos{" "}
              <Link href="/termos" className="text-gray-700 hover:text-gray-900">
                Termos de Serviço
              </Link>{" "}
              e{" "}
              <Link href="/privacidade" className="text-gray-700 hover:text-gray-900">
                Política de Privacidade
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 px-6 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} MyChurch. Todos os direitos reservados.
          </p>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <Link href="/suporte" className="text-xs text-gray-500 hover:text-gray-700">
              Suporte
            </Link>
            <Link href="/privacidade" className="text-xs text-gray-500 hover:text-gray-700">
              Privacidade
            </Link>
            <Link href="/termos" className="text-xs text-gray-500 hover:text-gray-700">
              Termos
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
