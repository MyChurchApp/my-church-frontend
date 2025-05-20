"use client"

import type React from "react"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react"
import { Logo } from "@/components/logo"
import { useLanguage } from "@/contexts/language-context"

export default function CadastroPage() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const planoParam = searchParams.get("plano")

  const [currentStep, setCurrentStep] = useState<"igreja" | "administrador" | "confirmacao">("igreja")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Dados da igreja
  const [dadosIgreja, setDadosIgreja] = useState({
    nome: "",
    denominacao: "",
    cnpj: "",
    telefone: "",
    email: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    tamanho: "",
    plano: planoParam || "",
  })

  // Dados do administrador
  const [dadosAdmin, setDadosAdmin] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    cargo: "",
    senha: "",
    confirmarSenha: "",
    aceitarTermos: false,
  })

  const handleIgrejaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setDadosIgreja((prev) => ({ ...prev, [name]: value }))
  }

  const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setDadosAdmin((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setDadosAdmin((prev) => ({ ...prev, aceitarTermos: checked }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setDadosIgreja((prev) => ({ ...prev, [name]: value }))
  }

  const handleIgrejaSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentStep("administrador")
  }

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aqui você implementaria a lógica de envio do formulário
    console.log("Dados da Igreja:", dadosIgreja)
    console.log("Dados do Administrador:", dadosAdmin)
    setCurrentStep("confirmacao")
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-sm border-b sticky top-0 z-[9999]">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar para página inicial</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8 px-4 md:px-6">
        {currentStep === "igreja" && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold tracking-tight">Cadastre sua igreja</h1>
              <p className="text-muted-foreground mt-2">
                Preencha os dados da sua igreja para começar a usar o MyChurch
              </p>
            </div>

            <div className="flex justify-center mb-8">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium">
                  1
                </div>
                <div className="mx-2 h-1 w-16 bg-primary"></div>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-medium">
                  2
                </div>
                <div className="mx-2 h-1 w-16 bg-muted"></div>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-medium">
                  3
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Informações da Igreja</CardTitle>
                <CardDescription>Preencha os dados básicos da sua igreja ou organização religiosa</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleIgrejaSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="nome">Nome da Igreja *</Label>
                        <Input
                          id="nome"
                          name="nome"
                          value={dadosIgreja.nome}
                          onChange={handleIgrejaChange}
                          placeholder="Nome completo da igreja"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="denominacao">Denominação</Label>
                        <Input
                          id="denominacao"
                          name="denominacao"
                          value={dadosIgreja.denominacao}
                          onChange={handleIgrejaChange}
                          placeholder="Ex: Batista, Católica, etc."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="cnpj">CNPJ</Label>
                        <Input
                          id="cnpj"
                          name="cnpj"
                          value={dadosIgreja.cnpj}
                          onChange={handleIgrejaChange}
                          placeholder="00.000.000/0000-00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telefone">Telefone *</Label>
                        <Input
                          id="telefone"
                          name="telefone"
                          value={dadosIgreja.telefone}
                          onChange={handleIgrejaChange}
                          placeholder="(00) 00000-0000"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email da Igreja *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={dadosIgreja.email}
                        onChange={handleIgrejaChange}
                        placeholder="igreja@exemplo.com"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="cep">CEP *</Label>
                        <Input
                          id="cep"
                          name="cep"
                          value={dadosIgreja.cep}
                          onChange={handleIgrejaChange}
                          placeholder="00000-000"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estado">Estado *</Label>
                        <Select
                          value={dadosIgreja.estado}
                          onValueChange={(value) => handleSelectChange("estado", value)}
                        >
                          <SelectTrigger id="estado">
                            <SelectValue placeholder="Selecione o estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AC">Acre</SelectItem>
                            <SelectItem value="AL">Alagoas</SelectItem>
                            <SelectItem value="AP">Amapá</SelectItem>
                            <SelectItem value="AM">Amazonas</SelectItem>
                            <SelectItem value="BA">Bahia</SelectItem>
                            <SelectItem value="CE">Ceará</SelectItem>
                            <SelectItem value="DF">Distrito Federal</SelectItem>
                            <SelectItem value="ES">Espírito Santo</SelectItem>
                            <SelectItem value="GO">Goiás</SelectItem>
                            <SelectItem value="MA">Maranhão</SelectItem>
                            <SelectItem value="MT">Mato Grosso</SelectItem>
                            <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                            <SelectItem value="MG">Minas Gerais</SelectItem>
                            <SelectItem value="PA">Pará</SelectItem>
                            <SelectItem value="PB">Paraíba</SelectItem>
                            <SelectItem value="PR">Paraná</SelectItem>
                            <SelectItem value="PE">Pernambuco</SelectItem>
                            <SelectItem value="PI">Piauí</SelectItem>
                            <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                            <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                            <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                            <SelectItem value="RO">Rondônia</SelectItem>
                            <SelectItem value="RR">Roraima</SelectItem>
                            <SelectItem value="SC">Santa Catarina</SelectItem>
                            <SelectItem value="SP">São Paulo</SelectItem>
                            <SelectItem value="SE">Sergipe</SelectItem>
                            <SelectItem value="TO">Tocantins</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="cidade">Cidade *</Label>
                        <Input
                          id="cidade"
                          name="cidade"
                          value={dadosIgreja.cidade}
                          onChange={handleIgrejaChange}
                          placeholder="Nome da cidade"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bairro">Bairro *</Label>
                        <Input
                          id="bairro"
                          name="bairro"
                          value={dadosIgreja.bairro}
                          onChange={handleIgrejaChange}
                          placeholder="Nome do bairro"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="sm:col-span-2 space-y-2">
                        <Label htmlFor="endereco">Endereço *</Label>
                        <Input
                          id="endereco"
                          name="endereco"
                          value={dadosIgreja.endereco}
                          onChange={handleIgrejaChange}
                          placeholder="Rua, Avenida, etc."
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="numero">Número *</Label>
                        <Input
                          id="numero"
                          name="numero"
                          value={dadosIgreja.numero}
                          onChange={handleIgrejaChange}
                          placeholder="Nº"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="complemento">Complemento</Label>
                      <Input
                        id="complemento"
                        name="complemento"
                        value={dadosIgreja.complemento}
                        onChange={handleIgrejaChange}
                        placeholder="Sala, Andar, etc."
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="tamanho">Tamanho da Igreja *</Label>
                        <Select
                          value={dadosIgreja.tamanho}
                          onValueChange={(value) => handleSelectChange("tamanho", value)}
                        >
                          <SelectTrigger id="tamanho">
                            <SelectValue placeholder="Selecione o tamanho" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pequena">Pequena (até 100 membros)</SelectItem>
                            <SelectItem value="media">Média (101 a 500 membros)</SelectItem>
                            <SelectItem value="grande">Grande (501 a 1000 membros)</SelectItem>
                            <SelectItem value="mega">Mega (mais de 1000 membros)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="plano">Plano Escolhido *</Label>
                        <Select value={dadosIgreja.plano} onValueChange={(value) => handleSelectChange("plano", value)}>
                          <SelectTrigger id="plano">
                            <SelectValue placeholder="Selecione o plano" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="congregacao">Plano Congregação</SelectItem>
                            <SelectItem value="comunidade">Plano Comunidade</SelectItem>
                            <SelectItem value="rede">Plano Rede</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit">Próximo: Dados do Administrador</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === "administrador" && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold tracking-tight">Cadastre o administrador</h1>
              <p className="text-muted-foreground mt-2">
                Preencha os dados do administrador principal que terá acesso ao sistema
              </p>
            </div>

            <div className="flex justify-center mb-8">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium">
                  ✓
                </div>
                <div className="mx-2 h-1 w-16 bg-primary"></div>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium">
                  2
                </div>
                <div className="mx-2 h-1 w-16 bg-muted"></div>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-medium">
                  3
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Informações do Administrador</CardTitle>
                <CardDescription>Preencha os dados do responsável que administrará o sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdminSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="admin-nome">Nome Completo *</Label>
                        <Input
                          id="admin-nome"
                          name="nome"
                          value={dadosAdmin.nome}
                          onChange={handleAdminChange}
                          placeholder="Nome completo"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="admin-cpf">CPF *</Label>
                        <Input
                          id="admin-cpf"
                          name="cpf"
                          value={dadosAdmin.cpf}
                          onChange={handleAdminChange}
                          placeholder="000.000.000-00"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="admin-email">Email *</Label>
                        <Input
                          id="admin-email"
                          name="email"
                          type="email"
                          value={dadosAdmin.email}
                          onChange={handleAdminChange}
                          placeholder="seu@email.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="admin-telefone">Telefone *</Label>
                        <Input
                          id="admin-telefone"
                          name="telefone"
                          value={dadosAdmin.telefone}
                          onChange={handleAdminChange}
                          placeholder="(00) 00000-0000"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="admin-cargo">Cargo na Igreja *</Label>
                      <Input
                        id="admin-cargo"
                        name="cargo"
                        value={dadosAdmin.cargo}
                        onChange={handleAdminChange}
                        placeholder="Ex: Pastor, Secretário, Tesoureiro, etc."
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="admin-senha">Senha *</Label>
                        <div className="relative">
                          <Input
                            id="admin-senha"
                            name="senha"
                            type={showPassword ? "text" : "password"}
                            value={dadosAdmin.senha}
                            onChange={handleAdminChange}
                            placeholder="••••••••"
                            required
                            className="pr-10"
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
                      <div className="space-y-2">
                        <Label htmlFor="admin-confirmar-senha">Confirmar Senha *</Label>
                        <div className="relative">
                          <Input
                            id="admin-confirmar-senha"
                            name="confirmarSenha"
                            type={showConfirmPassword ? "text" : "password"}
                            value={dadosAdmin.confirmarSenha}
                            onChange={handleAdminChange}
                            placeholder="••••••••"
                            required
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={toggleConfirmPasswordVisibility}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 pt-4">
                      <Checkbox
                        id="aceitar-termos"
                        checked={dadosAdmin.aceitarTermos}
                        onCheckedChange={handleCheckboxChange}
                        required
                      />
                      <div>
                        <Label htmlFor="aceitar-termos" className="font-medium">
                          Concordo com os termos e condições
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Ao criar uma conta, você concorda com nossos{" "}
                          <Link href="/termos" className="text-primary hover:underline">
                            Termos de Serviço
                          </Link>{" "}
                          e{" "}
                          <Link href="/privacidade" className="text-primary hover:underline">
                            Política de Privacidade
                          </Link>
                          .
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep("igreja")}>
                      Voltar
                    </Button>
                    <Button type="submit" disabled={!dadosAdmin.aceitarTermos}>
                      Finalizar Cadastro
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === "confirmacao" && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold tracking-tight">Cadastro Realizado com Sucesso!</h1>
              <p className="text-muted-foreground mt-2">
                Seu cadastro foi concluído e você receberá um email com as instruções para acessar o sistema.
              </p>
            </div>

            <div className="flex justify-center mb-8">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium">
                  ✓
                </div>
                <div className="mx-2 h-1 w-16 bg-primary"></div>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium">
                  ✓
                </div>
                <div className="mx-2 h-1 w-16 bg-primary"></div>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium">
                  ✓
                </div>
              </div>
            </div>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Bem-vindo ao MyChurch!</CardTitle>
                <CardDescription>
                  Estamos muito felizes em ter você conosco. Sua conta está sendo configurada.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md bg-muted p-4 text-left">
                  <p className="text-sm">
                    <strong>Próximos passos:</strong>
                  </p>
                  <ul className="text-sm mt-2 space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      <span>
                        Enviamos um email de confirmação para <strong>{dadosAdmin.email}</strong>. Por favor, verifique
                        sua caixa de entrada e confirme seu email.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      <span>
                        Nossa equipe entrará em contato em até 24 horas para auxiliar na configuração inicial do seu
                        sistema.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      <span>
                        Você terá acesso ao sistema em até 24 horas e poderá começar a usar todas as funcionalidades do
                        plano{" "}
                        {dadosIgreja.plano === "congregacao"
                          ? "Congregação"
                          : dadosIgreja.plano === "comunidade"
                            ? "Comunidade"
                            : "Rede"}
                        .
                      </span>
                    </li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button asChild className="w-full">
                  <Link href="/login">Ir para página de login</Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/">Voltar para página inicial</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container py-6 px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Logo size="sm" />
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} MyChurch. Todos os direitos reservados.
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="/suporte" className="text-sm text-muted-foreground hover:text-foreground">
                Suporte
              </Link>
              <Link href="/privacidade" className="text-sm text-muted-foreground hover:text-foreground">
                Privacidade
              </Link>
              <Link href="/termos" className="text-sm text-muted-foreground hover:text-foreground">
                Termos
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
