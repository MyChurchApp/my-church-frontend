// app/page.tsx

import type { Metadata } from "next";

// Importando os componentes da sua homepage
import HeroSection from "@/components/Home/Hero";
import NewsFeedSection from "@/components/Home/NewsFeed";
import FeaturesSection from "@/components/Home/Features";
import PlansSection from "@/components/Home/Plans";
import FAQSection from "@/components/Home/FAQ";
import Header from "@/components/Home/Header";
import { AOSInitializer } from "./AOSInitializer";
import PWAInstall from "@/components/ui/pwa-install";

export const metadata: Metadata = {
  title: "MyChurch | Software Completo para Gestão de Igrejas",
  description:
    "A plataforma MyChurch Lab (MyChurch) simplifica a gestão de membros, finanças, eventos e comunicação da sua igreja. Comece com nosso plano gratuito para sempre.",
  keywords: [
    "mychurchlab",
    "mychurch",
    "my church lab",
    "my church",
    "gestão de igrejas",
    "software para igreja",
    "aplicativo para igreja",
    "sistema para igreja",
  ],
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-text-primary dark:bg-background dark:text-text-primary">
      <AOSInitializer />
      <PWAInstall />
      <Header />
      <main className="scroll-smooth font-sans">
        <HeroSection />
        <NewsFeedSection />
        <FeaturesSection />
        <PlansSection />
        <FAQSection />
      </main>
    </div>
  );
}
