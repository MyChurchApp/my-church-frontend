import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  DollarSign,
  Calendar,
  BarChart3,
  Shield,
  Smartphone,
  ArrowRight,
  Clock,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react"
import PricingSection from "@/components/pricing-section"
import PWAInstall from "@/components/pwa-install"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <PWAInstall />

      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MC</span>
              </div>
              <span className="text-xl font-bold text-gray-900">MyChurch</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#recursos" className="text-gray-600 hover:text-primary transition-colors">
                Recursos
              </a>
              <a href="#planos" className="text-gray-600 hover:text-primary transition-colors">
                Planos
              </a>
              <a href="#contato" className="text-gray-600 hover:text-primary transition-colors">
                Contato
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/cadastro" className="hidden md:block">
                <Button size="sm">Começar Agora</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Transforme a gestão da sua igreja
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Software de Gestão
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent"> Completo</span>
              <br />
              para Igrejas
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Gerencie membros, finanças, eventos e comunicação em uma plataforma integrada e fácil de usar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto">
                  Login
                </Button>
              </Link>
              <Link href="/contato">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Fale Conosco
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Veja como será o seu dashboard</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Interface moderna e intuitiva, desenvolvida especialmente para facilitar a gestão da sua igreja.
            </p>
          </div>
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="aspect-video overflow-hidden rounded-xl shadow-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-100 relative">
              {/* Elementos decorativos de fundo */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-xl"></div>
                <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-200/30 rounded-full blur-xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-200/20 rounded-full blur-2xl"></div>
              </div>

              <div className="relative flex flex-col items-center justify-center h-full text-center p-8 z-10">
                <div className="mb-8">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white animate-pulse" />
                    </div>
                  </div>
                  <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
                    <Zap className="w-4 h-4 mr-2" />
                    Em Desenvolvimento
                  </div>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  Lançamento em Breve
                </h3>
                <p className="text-gray-600 text-lg mb-8 max-w-md">
                  Estamos finalizando os últimos detalhes para oferecer a melhor experiência de gestão para sua igreja.
                </p>

                {/* Barra de progresso */}
                <div className="w-full max-w-xs mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progresso</span>
                    <span>95%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                      style={{ width: "95%" }}
                    ></div>
                  </div>
                </div>

                {/* Badges informativos */}
                <div className="flex flex-wrap gap-3 justify-center">
                  <div className="flex items-center px-3 py-1 bg-white/60 backdrop-blur-sm rounded-full text-sm">
                    <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                    <span className="text-gray-700">Dashboard Intuitivo</span>
                  </div>
                  <div className="flex items-center px-3 py-1 bg-white/60 backdrop-blur-sm rounded-full text-sm">
                    <Shield className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="text-gray-700">Dados Seguros</span>
                  </div>
                  <div className="flex items-center px-3 py-1 bg-white/60 backdrop-blur-sm rounded-full text-sm">
                    <Smartphone className="w-4 h-4 mr-2 text-purple-600" />
                    <span className="text-gray-700">Mobile First</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Recursos Completos para sua Igreja</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Tudo que você precisa para modernizar e otimizar a gestão da sua comunidade religiosa.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Gestão de Membros</h3>
                <p className="text-gray-600">
                  Cadastre e organize informações completas dos membros, histórico de participação e dados familiares.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Controle Financeiro</h3>
                <p className="text-gray-600">
                  Gerencie dízimos, ofertas, despesas e receitas com relatórios detalhados e transparentes.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Agenda de Eventos</h3>
                <p className="text-gray-600">
                  Organize cultos, reuniões, eventos especiais e mantenha todos informados automaticamente.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Relatórios Inteligentes</h3>
                <p className="text-gray-600">
                  Dashboards com métricas importantes, gráficos de crescimento e análises de participação.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Segurança Total</h3>
                <p className="text-gray-600">
                  Dados protegidos com criptografia, backups automáticos e controle de acesso por níveis.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Smartphone className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Acesso Mobile</h3>
                <p className="text-gray-600">
                  Interface responsiva que funciona perfeitamente em computadores, tablets e smartphones.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="py-20 px-4">
        <PricingSection />
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Pronto para Transformar sua Igreja?</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Junte-se a centenas de igrejas que já modernizaram sua gestão com o MyChurch.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cadastro">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Começar Gratuitamente
              </Button>
            </Link>
            <Link href="/contato">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary"
              >
                Falar com Especialista
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">MC</span>
                </div>
                <span className="text-xl font-bold">MyChurch</span>
              </div>
              <p className="text-gray-400">Transformando a gestão de igrejas com tecnologia moderna e segura.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#recursos" className="hover:text-white transition-colors">
                    Recursos
                  </a>
                </li>
                <li>
                  <a href="#planos" className="hover:text-white transition-colors">
                    Planos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Segurança
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="/contato" className="hover:text-white transition-colors">
                    Contato
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentação
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Sobre
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacidade
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MyChurch. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
