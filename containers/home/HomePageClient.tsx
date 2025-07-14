"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import HeroSection from "@/components/Home/Hero";
import NewsFeedSection from "@/components/Home/NewsFeed";
import FeaturesSection from "@/components/Home/Features";
import FAQSection from "@/components/Home/FAQ";
import { AOSInitializer } from "@/app/AOSInitializer";
const PlansSection = dynamic(() => import("@/components/Home/Plans"), {
  loading: () => (
    <div className="text-center p-12">
      <Loader2 className="animate-spin mx-auto h-8 w-8" />
    </div>
  ),
  ssr: false,
});

export function HomePageClient() {
  return (
    <>
      <AOSInitializer />
      <main className="scroll-smooth font-sans">
        <HeroSection />
        <NewsFeedSection />
        <FeaturesSection />
        <PlansSection />
        <FAQSection />
      </main>
    </>
  );
}
