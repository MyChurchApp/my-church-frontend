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

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planoParam = searchParams.get("plano")
  const redirectParam = searchParams.get("redirect")

  const [showPassword, setShowPassword] = useState(false)
  const [identifier, setIdentifier] = useState("")
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

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Se contém @ ou parece email (tem letras e pontos), não formata
    if (value.includes("@") || /[a-zA-Z]/.test(value) || value.includes(".")) {
      setIdentifier(value)
    } else {
      // Se só tem números, trata como CPF e formata
      const formatted = formatCPF(value)
      setIdentifier(formatted)
    }

    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Login real com a API
      const response = await fetch("https://demoapp.top1soft.com.br/api/Auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
        },
        body: JSON.stringify({
          identifier: identifier,
          password: password,
        }),
      })

      if (response.ok) {
        const data = await response.json()

        // Salvar token no localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("authToken", data.token.token)
          localStorage.setItem("userRole", data.token.role)

          // Também salvar um objeto de usuário com informações básicas
          const userData = {
            identifier: identifier,
            role: data.token.role,
            accessLevel: data.token.role === "Admin" ? "admin" : "member",
          }
          localStorage.setItem("user", JSON.stringify(userData))

          // Aguardar um pouco para garantir que o localStorage foi atualizado
          await new Promise((resolve) => setTimeout(resolve, 100))
        }

        // Redirecionar conforme parâmetros ou para dashboard
        if (redirectParam === "checkout" && planoParam) {
          router.push(`/planos/checkout?plano=${planoParam}`)
        } else {
          router.push("/dashboard")
        }
      } else {
        // Se o login falhar, mostrar erro
        try {
          const errorData = await response.json()
          setError(`Erro no login: ${errorData.message || "Credenciais inválidas"}`)
        } catch (e) {
          setError("Credenciais inválidas. Verifique seu CPF/Email e senha.")
        }
      }
    } catch (error) {
      console.error("Erro no login:", error)
      setError("Erro de conexão. Verifique sua internet e tente novamente.")
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
                  <Label htmlFor="identifier" className="text-sm font-medium text-gray-700">
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
