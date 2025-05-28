"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AccountCheckModal } from "@/components/account-check-modal"
import { Check } from "lucide-react"

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
        <div className="mx-auto grid gap-6 py-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {/* Plano Gratuito - Descubra */}
          <Card className="border-none shadow-md flex flex-col">
            <CardHeader>
              <Badge className="self-start mb-2 bg-gray-200 text-gray-700 hover:bg-gray-300">Gratuito</Badge>
              <CardTitle>Plano Descubra</CardTitle>
              <div className="mt-4 flex items-baseline justify-center">
                <span className="text-3xl font-bold">R$ 0</span>
                <span className="ml-1 text-muted-foreground">/mês</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground mb-4">Ideal para igrejas pequenas ou em fase de testes.</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>Até 50 membros</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>1 filial</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>Gestão básica de membros e financeiro</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>Doações via link externo</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>Agenda da igreja (cadastro manual)</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>Relatórios básicos</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>Suporte via FAQ</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => handlePlanClick("descubra")}>
                Começar Grátis
              </Button>
            </CardFooter>
          </Card>

          {/* Plano Essencial - Crescer */}
          <Card className="border-none shadow-md flex flex-col">
            <CardHeader>
              <Badge className="self-start mb-2 bg-blue-100 text-blue-700 hover:bg-blue-200">Essencial</Badge>
              <CardTitle>Plano Crescer</CardTitle>
              <div className="mt-4 flex items-baseline justify-center">
                <span className="text-3xl font-bold">R$ 69</span>
                <span className="ml-1 text-muted-foreground">/mês</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground mb-4">
                Para igrejas em fase de estruturação e expansão digital.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>Até 500 membros</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>2 filiais</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>Gestão completa de membros e financeiro</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>Gateway de pagamento integrado</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>Agenda com avisos simples</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>Integração com e-mail e WhatsApp</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>Suporte via e-mail</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => handlePlanClick("crescer")}>
                Assinar Agora
              </Button>
            </CardFooter>
          </Card>

          {/* Plano Avançado - Multiplicar */}
          <Card className="border-none shadow-xl relative flex flex-col">
            <div className="absolute top-0 right-0 left-0">
              <Badge className="absolute top-0 right-0 m-4 bg-primary">Popular</Badge>
            </div>
            <CardHeader>
              <Badge className="self-start mb-2 bg-green-100 text-green-700 hover:bg-green-200">Avançado</Badge>
              <CardTitle>Plano Multiplicar</CardTitle>
              <div className="mt-4 flex items-baseline justify-center">
                <span className="text-3xl font-bold">R$ 149</span>
                <span className="ml-1 text-muted-foreground">/mês</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground mb-4">
                Ideal para igrejas com múltiplas filiais e foco em engajamento ao vivo.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>Até 3.000 membros</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>5 filiais</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>Gestor de Culto Ao Vivo</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>Exibição de leitura bíblica em tempo real</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>Doações ao vivo durante o culto</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>Integração com WhatsApp Business</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>Suporte prioritário</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => handlePlanClick("multiplicar")}>
                Assinar Agora
              </Button>
            </CardFooter>
          </Card>

          {/* Plano Premium - Influenciar */}
          <Card className="border-none shadow-md flex flex-col">
            <CardHeader>
              <Badge className="self-start mb-2 bg-purple-100 text-purple-700 hover:bg-purple-200">Premium</Badge>
              <CardTitle>Plano Influenciar</CardTitle>
              <div className="mt-4 flex items-baseline justify-center">
                <span className="text-3xl font-bold">R$ 279</span>
                <span className="ml-1 text-muted-foreground">/mês</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground mb-4">
                Para grandes igrejas com alta demanda de gestão e integração.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>Até 10.000 membros</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>Filiais ilimitadas</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>Automação administrativa</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>Dashboards com KPIs</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>Presença via QR Code ou geolocalização</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>App com ícone e nome da igreja nas lojas</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>Suporte via WhatsApp dedicado</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => handlePlanClick("influenciar")}>
                Assinar Agora
              </Button>
            </CardFooter>
          </Card>

          {/* Plano Negociado - Visão Apostólica */}
          <Card className="border-none shadow-md flex flex-col">
            <CardHeader>
              <Badge className="self-start mb-2 bg-amber-100 text-amber-700 hover:bg-amber-200">Personalizado</Badge>
              <CardTitle>Visão Apostólica</CardTitle>
              <div className="mt-4 flex items-baseline justify-center">
                <span className="text-3xl font-bold">Consulte</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground mb-4">
                Para convenções, redes e igrejas com alta complexidade.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>Membros e filiais ilimitados</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>Infraestrutura dedicada</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>Funcionalidades sob demanda</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>App 100% personalizado</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>Suporte presencial ou remoto</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>Treinamento e onboarding completo</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  <span>Contrato e SLA sob medida</span>
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
