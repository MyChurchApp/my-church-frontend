"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "pt-BR" | "en"

type Translations = {
  [key in Language]: {
    [key: string]: string
  }
}

// Define all translatable text here
const translations: Translations = {
  "pt-BR": {
    // Navigation
    "nav.features": "Funcionalidades",
    "nav.details": "Detalhes",
    "nav.churches": "Para Igrejas",
    "nav.implementation": "Implementação",
    "nav.plans": "Planos",

    // Hero Section
    "hero.badge": "Software de Gestão para Igrejas",
    "hero.title": "Transforme a gestão da sua igreja",
    "hero.subtitle":
      "Uma solução digital completa e integrada para atender às necessidades administrativas de igrejas de todos os tamanhos.",
    "hero.demo": "Agendar Demonstração",
    "hero.plans": "Ver Planos",
    "hero.trial": "Teste Grátis 14 dias",
    "hero.nocard": "Sem necessidade de cartão",

    // Buttons and common elements
    "btn.getStarted": "Começar Agora",
    "btn.login": "Entrar",
    "btn.contactUs": "Fale Conosco",

    // Features section
    "features.title": "Tudo que sua igreja precisa em um só lugar",
    "features.subtitle": "O MyChurch reúne todas as ferramentas necessárias para uma gestão eficiente da sua igreja.",

    // Feature cards
    "feature.members.title": "Gestão de Membros",
    "feature.members.subtitle": "Cadastro completo e organizado",
    "feature.members.description":
      "Registre todos os dados relevantes dos membros, incluindo informações de contato, familiares e áreas de atuação.",

    "feature.events.title": "Eventos e Cultos",
    "feature.events.subtitle": "Organização simplificada",
    "feature.events.description":
      "Crie e gerencie eventos, envie notificações automáticas e acompanhe a participação da comunidade.",

    "feature.finance.title": "Gestão Financeira",
    "feature.finance.subtitle": "Controle transparente",
    "feature.finance.description":
      "Registre doações, ofereça pagamentos digitais e acesse relatórios financeiros detalhados.",

    "feature.reports.title": "Relatórios",
    "feature.reports.subtitle": "Análises personalizadas",
    "feature.reports.description":
      "Crie relatórios personalizados com filtragem avançada e obtenha insights valiosos para decisões estratégicas.",

    "feature.communication.title": "Comunicação",
    "feature.communication.subtitle": "Integração completa",
    "feature.communication.description":
      "Envie mensagens por e-mail ou WhatsApp diretamente da plataforma para grupos específicos.",

    "feature.security.title": "Segurança",
    "feature.security.subtitle": "Dados protegidos",
    "feature.security.description":
      "Controle de permissões, backups automáticos e criptografia para proteger informações sensíveis.",

    // Footer
    "footer.product": "Produto",
    "footer.company": "Empresa",
    "footer.resources": "Recursos",
    "footer.contact": "Contato",
    "footer.copyright": "Todos os direitos reservados.",
    "footer.privacy": "Política de Privacidade",
    "footer.terms": "Termos de Uso",
  },
  en: {
    // Navigation
    "nav.features": "Features",
    "nav.details": "Details",
    "nav.churches": "For Churches",
    "nav.implementation": "Implementation",
    "nav.plans": "Plans",

    // Hero Section
    "hero.badge": "Church Management Software",
    "hero.title": "Transform your church management",
    "hero.subtitle":
      "A complete and integrated digital solution to meet the administrative needs of churches of all sizes.",
    "hero.demo": "Schedule Demo",
    "hero.plans": "View Plans",
    "hero.trial": "14-day Free Trial",
    "hero.nocard": "No credit card required",

    // Buttons and common elements
    "btn.getStarted": "Get Started",
    "btn.login": "Log In",
    "btn.contactUs": "Contact Us",

    // Features section
    "features.title": "Everything your church needs in one place",
    "features.subtitle": "MyChurch brings together all the tools necessary for efficient church management.",

    // Feature cards
    "feature.members.title": "Member Management",
    "feature.members.subtitle": "Complete and organized registration",
    "feature.members.description":
      "Record all relevant data of members, including contact information, family members, and areas of activity.",

    "feature.events.title": "Events and Services",
    "feature.events.subtitle": "Simplified organization",
    "feature.events.description":
      "Create and manage events, send automatic notifications, and track community participation.",

    "feature.finance.title": "Financial Management",
    "feature.finance.subtitle": "Transparent control",
    "feature.finance.description": "Record donations, offer digital payments, and access detailed financial reports.",

    "feature.reports.title": "Reports",
    "feature.reports.subtitle": "Custom analytics",
    "feature.reports.description":
      "Create custom reports with advanced filtering and gain valuable insights for strategic decisions.",

    "feature.communication.title": "Communication",
    "feature.communication.subtitle": "Complete integration",
    "feature.communication.description":
      "Send messages via email or WhatsApp directly from the platform to specific groups.",

    "feature.security.title": "Security",
    "feature.security.subtitle": "Protected data",
    "feature.security.description":
      "Permission control, automatic backups, and encryption to protect sensitive information.",

    // Footer
    "footer.product": "Product",
    "footer.company": "Company",
    "footer.resources": "Resources",
    "footer.contact": "Contact",
    "footer.copyright": "All rights reserved.",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Use",
  },
}

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("pt-BR")

  // Load saved language preference from localStorage (client-side only)
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "pt-BR" || savedLanguage === "en")) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("language", language)
  }, [language])

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

// Hook to use the language context
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
