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
