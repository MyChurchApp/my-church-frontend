import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  Users,
  Calendar,
  PieChart,
  BarChart4,
  CreditCard,
  Shield,
  Clock,
  Zap,
  Building,
  Church,
  MessageSquare,
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Image src="/mychurch-logo.png" alt="MyChurch Logo" width={32} height={32} />
            <span className="text-xl">MyChurch</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="font-medium text-primary">
              Início
            </Link>
            <Link href="/funcionalidades" className="font-medium text-muted-foreground hover:text-primary">
              Funcionalidades
            </Link>
            <Link href="/planos" className="font-medium text-muted-foreground hover:text-primary">
              Planos
            </Link>
            <Link href="/sobre" className="font-medium text-muted-foreground hover:text-primary">
              Sobre
            </Link>
            <Link href="/contato" className="font-medium text-muted-foreground hover:text-primary">
              Contato
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild className="hidden md:flex">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/cadastro">Começar Agora</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-purple-50 to-blue-50 relative overflow-hidden">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <Badge className="mb-2">Software de Gestão para Igrejas</Badge>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                  Transforme a gestão da sua igreja
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Uma solução digital completa e integrada para atender às necessidades administrativas de igrejas de
                  todos os tamanhos.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" asChild>
                    <Link href="/demonstracao">Agendar Demonstração</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/planos">Ver Planos</Link>
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Teste Grátis 14 dias</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Sem necessidade de cartão</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-video overflow-hidden rounded-xl shadow-xl">
                  <Image
                    src="/dashboard-preview.png"
                    alt="Dashboard do MyChurch"
                    width={600}
                    height={400}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Overview */}
        <section className="w-full py-12 md:py-16 lg:py-20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Tudo que sua igreja precisa em um só lugar
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground">
                  O MyChurch reúne todas as ferramentas necessárias para uma gestão eficiente da sua igreja.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Gestão de Membros</CardTitle>
                  <CardDescription>Cadastro completo e organizado</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Registre todos os dados relevantes dos membros, incluindo informações de contato, familiares e áreas
                    de atuação.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <Calendar className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Eventos e Cultos</CardTitle>
                  <CardDescription>Organização simplificada</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Crie e gerencie eventos, envie notificações automáticas e acompanhe a participação da comunidade.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <CreditCard className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Gestão Financeira</CardTitle>
                  <CardDescription>Controle transparente</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Registre doações, ofereça pagamentos digitais e acesse relatórios financeiros detalhados.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <BarChart4 className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Relatórios</CardTitle>
                  <CardDescription>Análises personalizadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Crie relatórios personalizados com filtragem avançada e obtenha insights valiosos para decisões
                    estratégicas.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <MessageSquare className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Comunicação</CardTitle>
                  <CardDescription>Integração completa</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Envie mensagens por e-mail ou WhatsApp diretamente da plataforma para grupos específicos.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <Shield className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Segurança</CardTitle>
                  <CardDescription>Dados protegidos</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Controle de permissões, backups automáticos e criptografia para proteger informações sensíveis.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Feature Details */}
        <section className="w-full py-12 md:py-16 lg:py-20 bg-muted">
          <div className="container px-4 md:px-6">
            <Tabs defaultValue="membros" className="w-full max-w-4xl mx-auto">
              <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Funcionalidades Detalhadas</h2>
                  <p className="mx-auto max-w-[700px] text-muted-foreground">
                    Conheça em detalhes como o MyChurch pode transformar a gestão da sua igreja.
                  </p>
                </div>
                <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full max-w-2xl">
                  <TabsTrigger value="membros">Membros</TabsTrigger>
                  <TabsTrigger value="eventos">Eventos</TabsTrigger>
                  <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
                  <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="membros" className="space-y-4">
                <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold">Gestão de Membros Simplificada</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <span className="font-medium">Cadastro Completo</span>
                          <p className="text-muted-foreground">
                            Registre todos os dados relevantes dos membros da sua igreja.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <span className="font-medium">Atualizações Fáceis</span>
                          <p className="text-muted-foreground">
                            Mantenha a base de dados sempre atualizada com ferramentas intuitivas.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <span className="font-medium">Controle de Aniversários</span>
                          <p className="text-muted-foreground">Receba notificações automáticas de aniversariantes.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <span className="font-medium">Autogestão de Perfil</span>
                          <p className="text-muted-foreground">
                            Permita que os próprios membros atualizem suas informações.
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className="aspect-video overflow-hidden rounded-xl shadow-lg">
                    <Image
                      src="/membros-screenshot.png"
                      alt="Gestão de Membros"
                      width={600}
                      height={400}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="eventos" className="space-y-4">
                <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold">Eventos e Cultos Organizados</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <span className="font-medium">Agendamento</span>
                          <p className="text-muted-foreground">
                            Crie e organize eventos recorrentes ou especiais com todos os detalhes necessários.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <span className="font-medium">Notificação</span>
                          <p className="text-muted-foreground">
                            Envie lembretes automáticos por e-mail ou WhatsApp para aumentar a participação.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <span className="font-medium">Confirmação</span>
                          <p className="text-muted-foreground">
                            Receba confirmações de presença para melhor organização do espaço e recursos.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <span className="font-medium">Análise</span>
                          <p className="text-muted-foreground">
                            Acompanhe métricas de participação para avaliar o engajamento da comunidade.
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className="aspect-video overflow-hidden rounded-xl shadow-lg">
                    <Image
                      src="/eventos-screenshot.png"
                      alt="Gestão de Eventos"
                      width={600}
                      height={400}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="financeiro" className="space-y-4">
                <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold">Gestão Financeira Transparente</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <span className="font-medium">Registro Simplificado</span>
                          <p className="text-muted-foreground">
                            Cadastre doações com poucos cliques, mantendo o controle completo das entradas.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <span className="font-medium">Pagamentos Digitais</span>
                          <p className="text-muted-foreground">
                            Ofereça múltiplas opções de contribuição online: Pix, boleto e cartões de crédito.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <span className="font-medium">Relatórios Detalhados</span>
                          <p className="text-muted-foreground">
                            Acesse relatórios financeiros completos com gráficos e análises comparativas.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <span className="font-medium">Exportação de Dados</span>
                          <p className="text-muted-foreground">
                            Exporte em formatos compatíveis com sistemas contábeis para prestação de contas.
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className="aspect-video overflow-hidden rounded-xl shadow-lg">
                    <Image
                      src="/financeiro-screenshot.png"
                      alt="Gestão Financeira"
                      width={600}
                      height={400}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="relatorios" className="space-y-4">
                <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold">Relatórios Personalizados</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <span className="font-medium">Filtragem Avançada</span>
                          <p className="text-muted-foreground">Selecione os parâmetros exatos para sua análise.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <span className="font-medium">Exportação Versátil</span>
                          <p className="text-muted-foreground">Exporte em PDF, Excel ou compartilhe links.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <span className="font-medium">Agendamento Automático</span>
                          <p className="text-muted-foreground">Programe relatórios recorrentes para sua equipe.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <span className="font-medium">Visualizações Claras</span>
                          <p className="text-muted-foreground">
                            Obtenha insights valiosos com gráficos e tabelas intuitivas.
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className="aspect-video overflow-hidden rounded-xl shadow-lg">
                    <Image
                      src="/relatorios-screenshot.png"
                      alt="Relatórios Personalizados"
                      width={600}
                      height={400}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Church Sizes */}
        <section className="w-full py-12 md:py-16 lg:py-20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Para Igrejas de Todos os Tamanhos</h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground">
                  O MyChurch se adapta às necessidades específicas da sua congregação, independente do tamanho.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-8 md:grid-cols-3">
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <Church className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Congregações Pequenas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Interface simplificada</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Planos acessíveis</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Configuração assistida</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Crescimento conforme necessidade</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <Building className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Igrejas Médias</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Funcionalidades intermediárias</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Automação de processos</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Gestão financeira avançada</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Ferramentas de comunicação</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <Building className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Redes com Múltiplas Filiais</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Gestão hierárquica de permissões</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Consolidação de dados</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Relatórios comparativos</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Sistema completo e personalizado</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Implementation */}
        <section className="w-full py-12 md:py-16 lg:py-20 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Implementação Simples e Segura</h2>
                <p className="text-muted-foreground">
                  Nossa equipe está pronta para garantir uma transição tranquila para o MyChurch, com suporte completo
                  em todas as etapas.
                </p>
                <ul className="space-y-4 mt-6">
                  <li className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Configuração Inicial</h3>
                      <p className="text-muted-foreground">
                        Nossa equipe configura o sistema com seus dados básicos e personalização visual com a identidade
                        da sua igreja.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Treinamento da Equipe</h3>
                      <p className="text-muted-foreground">
                        Realizamos sessões de treinamento para que sua equipe administrativa aproveite ao máximo os
                        recursos disponíveis.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <PieChart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Importação de Dados</h3>
                      <p className="text-muted-foreground">
                        Importamos seus cadastros existentes de planilhas ou outros sistemas para que você comece com
                        todos os dados organizados.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Suporte Contínuo</h3>
                      <p className="text-muted-foreground">
                        Oferecemos atendimento especializado para resolver dúvidas e orientar sobre as melhores práticas
                        de utilização.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="aspect-video overflow-hidden rounded-xl shadow-lg">
                <Image
                  src="/implementacao-screenshot.png"
                  alt="Implementação do MyChurch"
                  width={600}
                  height={400}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="w-full py-12 md:py-16 lg:py-20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Planos e Preços</h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground">
                  Escolha o plano que melhor se adapta às necessidades da sua igreja.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-8 md:grid-cols-3">
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
                  <Button className="w-full" asChild>
                    <Link href="/cadastro?plano=congregacao">Começar Agora</Link>
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
                  <Button className="w-full" asChild>
                    <Link href="/cadastro?plano=comunidade">Começar Agora</Link>
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
            <div className="text-center mt-6">
              <p className="text-muted-foreground">
                Todos os planos incluem atualizações contínuas e garantia de satisfação de 30 dias.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="w-full py-12 md:py-16 lg:py-20 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Transforme a gestão da sua igreja hoje
                </h2>
                <p className="mx-auto max-w-[700px] opacity-90">
                  Entre em contato conosco para uma demonstração personalizada e descubra como o MyChurch pode ajudar
                  sua igreja a crescer com organização e eficiência.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/demonstracao">Agendar Demonstração</Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent" asChild>
                  <Link href="/contato">Fale Conosco</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/40">
        <div className="container flex flex-col gap-6 py-8 md:py-12 px-4 md:px-6">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Produto</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/funcionalidades" className="text-muted-foreground hover:text-foreground">
                    Funcionalidades
                  </Link>
                </li>
                <li>
                  <Link href="/planos" className="text-muted-foreground hover:text-foreground">
                    Planos e Preços
                  </Link>
                </li>
                <li>
                  <Link href="/demonstracao" className="text-muted-foreground hover:text-foreground">
                    Demonstração
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Empresa</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/sobre" className="text-muted-foreground hover:text-foreground">
                    Sobre Nós
                  </Link>
                </li>
                <li>
                  <Link href="/clientes" className="text-muted-foreground hover:text-foreground">
                    Clientes
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-muted-foreground hover:text-foreground">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Recursos</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/suporte" className="text-muted-foreground hover:text-foreground">
                    Central de Ajuda
                  </Link>
                </li>
                <li>
                  <Link href="/documentacao" className="text-muted-foreground hover:text-foreground">
                    Documentação
                  </Link>
                </li>
                <li>
                  <Link href="/tutoriais" className="text-muted-foreground hover:text-foreground">
                    Tutoriais
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Contato</h3>
              <ul className="space-y-2">
                <li className="text-muted-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="inline mr-1"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>{" "}
                  (11) 1234-5678
                </li>
                <li className="text-muted-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="inline mr-1"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>{" "}
                  contato@mychurch.com.br
                </li>
                <li className="flex gap-4 mt-4">
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                    <span className="sr-only">Facebook</span>
                  </Link>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                    <span className="sr-only">Instagram</span>
                  </Link>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                    </svg>
                    <span className="sr-only">Twitter</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row items-center justify-between">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} MyChurch. Todos os direitos reservados.
            </p>
            <div className="flex gap-4">
              <Link href="/privacidade" className="text-sm text-muted-foreground hover:text-foreground">
                Política de Privacidade
              </Link>
              <Link href="/termos" className="text-sm text-muted-foreground hover:text-foreground">
                Termos de Uso
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
