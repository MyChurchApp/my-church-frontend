"use client";

import { useEffect } from "react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "aos/dist/aos.css";
import AOS from "aos";
import HeroSection from "@/components/Home/Hero";
import CountdownSection from "@/components/Home/Launch";
import NewsFeedSection from "@/components/Home/NewsFeed";
import FeaturesSection from "@/components/Home/Features";
import PlansSection from "@/components/Home/Plans";
import FAQSection from "@/components/Home/FAQ";
import PWAInstall from "@/components/pwa-install";
import Header from "@/components/Home/Header";

export default function HomePage() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 50,
    });
  }, []);
// É crucial inicializar o Swiper aqui no useEffect para garantir que o DOM está pronto
    new Swiper('.features-swiper', {
        modules: [Pagination],
        loop: false,
        slidesPerView: 1.5,
        spaceBetween: 16,
        pagination: { el: '.features-pagination', clickable: true },
        breakpoints: {
            640: { slidesPerView: 2, spaceBetween: 24 },
            768: { slidesPerView: 3, spaceBetween: 24 },
            1024: { slidesPerView: 5, spaceBetween: 32 },
        },
    });
    
    // Adicionada a inicialização do carrossel de planos para garantir que também funciona
    new Swiper('.plans-swiper', {
        modules: [Navigation, Pagination],
        loop: false,
        slidesPerView: 1,
        spaceBetween: 24,
        pagination: { el: '.plans-pagination', clickable: true },
        navigation: { nextEl: '.plans-swiper .swiper-button-next', prevEl: '.plans-swiper .swiper-button-prev' },
        breakpoints: {
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
        },
    });

  }, []);
  return (
    <div className="min-h-screen bg-background text-text-primary dark:bg-background dark:text-text-primary">
      <PWAInstall />
      <Header />
      <main className="scroll-smooth font-sans">
        <HeroSection />
        <CountdownSection />
        <NewsFeedSection />
        <FeaturesSection />
        <PlansSection />
        <FAQSection />
      </main>
    </div>
  );
}
