"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowRight } from "lucide-react"

// Definição dos planos
const plans = {
  congregacao: {
    name: "Plano Congregação",
    price: 149,
  },
  comunidade: {
    name: "Plano Comunidade",
    price: 249,
  },
  rede: {
    name: "Plano Rede",
    price: 499,
  },
}

export default function ConfirmacaoPage() {
  const searchParams = useSearchParams()
  const planId = searchParams.get("plano") || "comunidade"
  const plan = plans[planId as keyof typeof plans] || plans.comunidade

  // Calcular a data da próxima cobrança (14 dias a partir de hoje)
  const nextBillingDate = new Date()
  nextBillingDate.setDate(nextBillingDate.getDate() + 14)
  const formattedDate = nextBillingDate.toLocaleDateString("pt-BR")

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-sm border-b sticky top-0 z-[9999]">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Logo size="md" />
        </div>
      </header>

      <main className="flex-1 container py-12 px-4 md:px-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Assinatura confirmada!</CardTitle>
            <CardDescription>Obrigado por escolher o MyChurch para gerenciar sua igreja.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-muted p-4">
              <p className="text-sm">
                Enviamos um email com os detalhes da sua assinatura e instruções para acessar sua conta. Você receberá
                acesso ao sistema em até 24 horas.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Plano</span>
                <span>{plan.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Valor mensal</span>
                <span>R$ {plan.price},00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Período de teste</span>
                <span>14 dias</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Próxima cobrança</span>
                <span>{formattedDate}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button asChild className="w-full">
              <Link href="/dashboard">
                Acessar dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">Voltar para página inicial</Link>
            </Button>
          </CardFooter>
        </Card>
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
