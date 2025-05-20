"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AccountCheckModal } from "@/components/account-check-modal"

export function PricingSection() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string>("")

  const handlePlanClick = (planoId: string) => {
    setSelectedPlan(planoId)
    setIsModalOpen(true)
  }

  return (
    <section id="planos" className="w-full py-12 md:py-16 lg:py-20 scroll-mt-20">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Planos e Preços</h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground">
              Escolha o plano que melhor se adapta às necessidades da sua igreja.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-4xl gap-6 py-8 md:grid-cols-3">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Plano Congregação</CardTitle>
              <div className="mt-4 flex items-baseline justify-center">
                <span className="text-3xl font-bold">R$ 149</span>
                <span className="ml-1 text-muted-foreground">/mês</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center justify-between">
                  <span>Membros</span>
                  <span className="font-medium">Até 200</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Módulos</span>
                  <span className="font-medium">Básicos</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Filiais</span>
                  <span className="font-medium">1</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Suporte</span>
                  <span className="font-medium">E-mail</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => handlePlanClick("congregacao")}>
                Começar Agora
              </Button>
            </CardFooter>
          </Card>
          <Card className="border-none shadow-xl relative">
            <div className="absolute top-0 right-0 left-0">
              <Badge className="absolute top-0 right-0 m-4 bg-primary">Popular</Badge>
            </div>
            <CardHeader>
              <CardTitle>Plano Comunidade</CardTitle>
              <div className="mt-4 flex items-baseline justify-center">
                <span className="text-3xl font-bold">R$ 249</span>
                <span className="ml-1 text-muted-foreground">/mês</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center justify-between">
                  <span>Membros</span>
                  <span className="font-medium">Até 1.000</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Módulos</span>
                  <span className="font-medium">Completos</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Filiais</span>
                  <span className="font-medium">2-3</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Suporte</span>
                  <span className="font-medium">E-mail e Chat</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => handlePlanClick("comunidade")}>
                Começar Agora
              </Button>
            </CardFooter>
          </Card>
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Plano Rede</CardTitle>
              <div className="mt-4 flex items-baseline justify-center">
                <span className="text-3xl font-bold">Consulte</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center justify-between">
                  <span>Membros</span>
                  <span className="font-medium">Ilimitado</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Módulos</span>
                  <span className="font-medium">Avançados</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Filiais</span>
                  <span className="font-medium">Ilimitadas</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Suporte</span>
                  <span className="font-medium">Prioritário</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/contato">Fale Conosco</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
        <div className="text-center mt-6 max-w-3xl mx-auto">
          <p className="text-muted-foreground">
            Todos os planos incluem atualizações contínuas e garantia de satisfação de 30 dias.
          </p>
        </div>
      </div>

      <AccountCheckModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} planoId={selectedPlan} />
    </section>
  )
}
