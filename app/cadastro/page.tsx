"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Church, User, Mail, Lock, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CadastroPage() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    nomeIgreja: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // Validações básicas
    if (!formData.nome || !formData.email || !formData.senha) {
      setMessage({ type: "error", text: "Por favor, preencha todos os campos obrigatórios" })
      setLoading(false)
      return
    }

    if (formData.senha !== formData.confirmarSenha) {
      setMessage({ type: "error", text: "As senhas não coincidem" })
      setLoading(false)
      return
    }

    try {
      const cadastroData = {
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        // Se nomeIgreja estiver vazio, o usuário não será vinculado a uma igreja
        nomeIgreja: formData.nomeIgreja || null,
        vinculadoIgreja: formData.nomeIgreja ? true : false,
      }

      console.log("[v0] Dados do cadastro:", cadastroData)

      // Aqui você faria a chamada para sua API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cadastroData),
      })

      if (response.ok) {
        setMessage({
          type: "success",
          text: formData.nomeIgreja
            ? `Cadastro realizado com sucesso! Você foi vinculado à ${formData.nomeIgreja}.`
            : "Cadastro realizado com sucesso! Você não está vinculado a nenhuma igreja.",
        })

        // Limpa o formulário
        setFormData({
          nome: "",
          email: "",
          senha: "",
          confirmarSenha: "",
          nomeIgreja: "",
        })
      } else {
        setMessage({ type: "error", text: "Erro ao realizar cadastro. Tente novamente." })
      }
    } catch (error) {
      console.error("[v0] Erro no cadastro:", error)
      setMessage({ type: "error", text: "Erro ao conectar com o servidor" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="container mx-auto max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Home
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Cadastro</CardTitle>
            <CardDescription>Crie sua conta para acessar o MyChurchApp</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nome Completo *
                </Label>
                <Input
                  id="nome"
                  name="nome"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Senha *
                </Label>
                <Input
                  id="senha"
                  name="senha"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.senha}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarSenha" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Confirmar Senha *
                </Label>
                <Input
                  id="confirmarSenha"
                  name="confirmarSenha"
                  type="password"
                  placeholder="Digite a senha novamente"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2">
                  <Label htmlFor="nomeIgreja" className="flex items-center gap-2">
                    <Church className="h-4 w-4" />
                    Nome da Igreja (Opcional)
                  </Label>
                  <Input
                    id="nomeIgreja"
                    name="nomeIgreja"
                    type="text"
                    placeholder="Deixe em branco se não pertence a uma igreja"
                    value={formData.nomeIgreja}
                    onChange={handleChange}
                  />
                  <p className="text-sm text-muted-foreground">
                    Se você não preencher este campo, não será vinculado a nenhuma igreja
                  </p>
                </div>
              </div>

              {message && (
                <Alert variant={message.type === "error" ? "destructive" : "default"}>
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Cadastrando..." : "Criar Conta"}
              </Button>

              <p className="text-sm text-center text-muted-foreground">* Campos obrigatórios</p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
