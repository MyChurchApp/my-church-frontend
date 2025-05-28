"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MessageCircle, Mail, Send, ArrowLeft, Copy, Check } from "lucide-react"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function ContatoPage() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    igreja: "",
    cargo: "",
    plano: "",
    mensagem: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [copied, setCopied] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simular envio do email
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Aqui você integraria com um serviço de email real
      console.log("Dados do formulário:", formData)

      setSubmitStatus("success")
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        igreja: "",
        cargo: "",
        plano: "",
        mensagem: "",
      })
    } catch (error) {
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleWhatsAppClick = () => {
    // Aqui você colocará o link do WhatsApp quando tiver
    const message = encodeURIComponent("Olá! Gostaria de saber mais sobre os planos do MyChurch.")
    const whatsappUrl = `https://wa.me/5511999999999?text=${message}` // Substitua pelo número real
    window.open(whatsappUrl, "_blank")
  }

  const copyEmail = () => {
    navigator.clipboard.writeText("comercial@mychurchlab.net").then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Fale Conosco</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Como podemos ajudar?</h2>
            <p className="text-gray-600">Escolha a forma de contato que preferir</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* WhatsApp */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleWhatsAppClick}>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">WhatsApp</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">Fale conosco diretamente pelo WhatsApp</p>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Abrir WhatsApp
                </Button>
              </CardContent>
            </Card>

            {/* Email Direto */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Email Direto</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">Copie nosso email comercial</p>
                <TooltipProvider>
                  <Tooltip open={copied}>
                    <TooltipTrigger asChild>
                      <Button variant="outline" className="w-full" onClick={copyEmail}>
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 mr-2 text-green-500" />
                            <span className="text-green-500">Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            comercial@mychurchlab.net
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Email copiado!</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardContent>
            </Card>

            {/* Formulário */}
            <Card className="md:col-span-1">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Send className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Formulário</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">Preencha o formulário abaixo</p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    document.getElementById("formulario")?.scrollIntoView({ behavior: "smooth" })
                  }}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Preencher Formulário
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Formulário de Contato */}
          <Card id="formulario" className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Formulário de Contato</CardTitle>
              <p className="text-center text-gray-600">Preencha os campos abaixo e entraremos em contato</p>
            </CardHeader>
            <CardContent>
              {submitStatus === "success" && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-center">
                    ✅ Mensagem enviada com sucesso! Entraremos em contato em breve.
                  </p>
                </div>
              )}

              {submitStatus === "error" && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-center">
                    ❌ Erro ao enviar mensagem. Tente novamente ou use outro meio de contato.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleInputChange}
                      required
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleInputChange}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div>
                    <Label htmlFor="igreja">Nome da Igreja</Label>
                    <Input
                      id="igreja"
                      name="igreja"
                      value={formData.igreja}
                      onChange={handleInputChange}
                      placeholder="Nome da sua igreja"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cargo">Cargo/Função</Label>
                    <Input
                      id="cargo"
                      name="cargo"
                      value={formData.cargo}
                      onChange={handleInputChange}
                      placeholder="Pastor, Líder, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="plano">Plano de Interesse</Label>
                    <select
                      id="plano"
                      name="plano"
                      value={formData.plano}
                      onChange={(e) => handleInputChange(e as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione um plano</option>
                      <option value="descubra">Plano Descubra (Gratuito)</option>
                      <option value="crescer">Plano Crescer (R$ 69/mês)</option>
                      <option value="multiplicar">Plano Multiplicar (R$ 149/mês)</option>
                      <option value="influenciar">Plano Influenciar (R$ 279/mês)</option>
                      <option value="visao-apostolica">Plano Visão Apostólica (Personalizado)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="mensagem">Mensagem *</Label>
                  <Textarea
                    id="mensagem"
                    name="mensagem"
                    value={formData.mensagem}
                    onChange={handleInputChange}
                    required
                    placeholder="Conte-nos como podemos ajudar..."
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Mensagem
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
