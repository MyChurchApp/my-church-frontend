import FAQ from "@/components/Home/FAQ";
import Features from "@/components/Home/Features";
import Header from "@/components/Home/Header";
import Hero from "@/components/Home/Hero";
import Launch from "@/components/Home/Launch";
import NewsFeed from "@/components/Home/NewsFeed";
import Plans from "@/components/Home/Plans";
import { Video } from "lucide-react";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Launch />
        <Video />
        <NewsFeed />
        <Features />
        <Plans />
        <FAQ />
      </main>
    </>
  );
}
