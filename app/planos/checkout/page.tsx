"use client";

import type React from "react";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  CreditCard,
  Landmark,
  Barcode,
  CheckCircle,
  Info,
  Lock,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

// Vamos melhorar a lógica para garantir que a página funcione corretamente para ambos os planos

// Atualize a definição dos planos para incluir mais detalhes
const plans = {
  congregacao: {
    name: "Plano Congregação",
    price: 149,
    members: "Até 200",
    modules: "Básicos",
    branches: "1",
    support: "E-mail",
    description: "Ideal para igrejas pequenas e congregações em crescimento",
  },
  comunidade: {
    name: "Plano Comunidade",
    price: 249,
    members: "Até 1.000",
    modules: "Completos",
    branches: "2-3",
    support: "E-mail e Chat",
    popular: true,
    description:
      "Perfeito para igrejas de médio porte com necessidades mais complexas",
  },
  rede: {
    name: "Plano Rede",
    price: 499,
    members: "Ilimitado",
    modules: "Avançados",
    branches: "Ilimitadas",
    support: "Prioritário",
    description: "Solução completa para redes de igrejas com múltiplas filiais",
  },
};

export default function CheckoutPage() {
  // Melhore a lógica de detecção do plano
  const searchParams = useSearchParams();
  const planId = searchParams.get("plano") || "comunidade";
  const plan = plans[planId as keyof typeof plans] || plans.comunidade;

  const { t } = useLanguage();
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    document: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvv: "",
    agreeTerms: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, agreeTerms: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você implementaria a lógica de processamento do pagamento
    // Redirecionar para página de sucesso ou mostrar mensagem
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-sm border-b sticky top-0 z-[9999]">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            <Link
              href="/#planos"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar para planos</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">
              Finalizar assinatura
            </h1>
            <p className="text-muted-foreground mt-2">
              Complete as informações abaixo para assinar o {plan.name}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Formulário de checkout */}
            <div className="md:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Informações pessoais */}
                <div className="bg-background rounded-lg border p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">
                    Informações pessoais
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome completo</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Digite seu nome completo"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="(00) 00000-0000"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="document">CPF/CNPJ</Label>
                      <Input
                        id="document"
                        name="document"
                        value={formData.document}
                        onChange={handleInputChange}
                        placeholder="000.000.000-00"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Endereço de cobrança */}
                <div className="bg-background rounded-lg border p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">
                    Endereço de cobrança
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2 space-y-2">
                      <Label htmlFor="address">Endereço completo</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Rua, número, complemento"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Sua cidade"
                        required
                      />
                    </div>
                    <div className="grid gap-4 grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="state">Estado</Label>
                        <Input
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          placeholder="UF"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">CEP</Label>
                        <Input
                          id="zipCode"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          placeholder="00000-000"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Método de pagamento */}
                <div className="bg-background rounded-lg border p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">
                    Método de pagamento
                  </h2>

                  <Tabs
                    defaultValue="credit-card"
                    onValueChange={setPaymentMethod}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger
                        value="credit-card"
                        className="flex items-center gap-2"
                      >
                        <CreditCard className="h-4 w-4" />
                        <span>Cartão</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="bank-transfer"
                        className="flex items-center gap-2"
                      >
                        <Landmark className="h-4 w-4" />
                        <span>Transferência</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="boleto"
                        className="flex items-center gap-2"
                      >
                        <Barcode className="h-4 w-4" />
                        <span>Boleto</span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="credit-card" className="mt-4 space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2 space-y-2">
                          <Label htmlFor="cardNumber">Número do cartão</Label>
                          <Input
                            id="cardNumber"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                            placeholder="0000 0000 0000 0000"
                            required={paymentMethod === "credit-card"}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cardName">Nome no cartão</Label>
                          <Input
                            id="cardName"
                            name="cardName"
                            value={formData.cardName}
                            onChange={handleInputChange}
                            placeholder="Nome como está no cartão"
                            required={paymentMethod === "credit-card"}
                          />
                        </div>
                        <div className="grid gap-4 grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="cardExpiry">Validade</Label>
                            <Input
                              id="cardExpiry"
                              name="cardExpiry"
                              value={formData.cardExpiry}
                              onChange={handleInputChange}
                              placeholder="MM/AA"
                              required={paymentMethod === "credit-card"}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cardCvv">CVV</Label>
                            <Input
                              id="cardCvv"
                              name="cardCvv"
                              value={formData.cardCvv}
                              onChange={handleInputChange}
                              placeholder="000"
                              required={paymentMethod === "credit-card"}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Lock className="h-4 w-4" />
                        <span>Seus dados estão seguros e criptografados</span>
                      </div>
                    </TabsContent>

                    <TabsContent value="bank-transfer" className="mt-4">
                      <div className="rounded-md bg-muted p-4">
                        <div className="flex items-start gap-3">
                          <Info className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">
                              Instruções para transferência bancária
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Após finalizar sua assinatura, você receberá os
                              dados bancários para realizar a transferência. Sua
                              assinatura será ativada assim que confirmarmos o
                              pagamento.
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="boleto" className="mt-4">
                      <div className="rounded-md bg-muted p-4">
                        <div className="flex items-start gap-3">
                          <Info className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">Pagamento via boleto</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              O boleto será gerado após a finalização da
                              assinatura e enviado para seu email. Sua
                              assinatura será ativada em até 3 dias úteis após o
                              pagamento.
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Termos e condições */}
                <div className="bg-background rounded-lg border p-6 shadow-sm">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="agreeTerms"
                      checked={formData.agreeTerms}
                      onCheckedChange={handleCheckboxChange}
                      required
                    />
                    <div>
                      <Label htmlFor="agreeTerms" className="font-medium">
                        Concordo com os termos e condições
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Ao assinar, você concorda com nossos{" "}
                        <Link
                          href="/termos"
                          className="text-primary hover:underline"
                        >
                          Termos de Serviço
                        </Link>{" "}
                        e{" "}
                        <Link
                          href="/privacidade"
                          className="text-primary hover:underline"
                        >
                          Política de Privacidade
                        </Link>
                        .
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={!formData.agreeTerms}
                >
                  Finalizar assinatura
                </Button>
              </form>
            </div>

            {/* Resumo da compra */}
            <div className="md:col-span-1">
              <div className="bg-background rounded-lg border shadow-sm sticky top-24">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Resumo da assinatura
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-primary" />
                      </div>
                      {/* Adicione uma mensagem personalizada baseada no plano selecionado */}
                      <div>
                        <h3 className="font-medium">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {plan.description}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Membros</span>
                        <span>{plan.members}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Módulos</span>
                        <span>{plan.modules}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Filiais</span>
                        <span>{plan.branches}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Suporte</span>
                        <span>{plan.support}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total mensal</span>
                      <span className="text-xl font-bold">
                        R$ {plan.price},00
                      </span>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <p>Cobrado mensalmente. Cancele a qualquer momento.</p>
                    </div>

                    <div className="rounded-md bg-primary/10 p-3">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span>Teste grátis por 14 dias</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t p-6 bg-muted/30">
                  <div className="flex items-center justify-between text-sm">
                    <span>Precisa de ajuda?</span>
                    <Link
                      href="/contato"
                      className="text-primary hover:underline"
                    >
                      Fale conosco
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container py-6 px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Logo size="sm" />
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} MyChurch. Todos os direitos
                reservados.
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/suporte"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Suporte
              </Link>
              <Link
                href="/privacidade"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Privacidade
              </Link>
              <Link
                href="/termos"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Termos
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
