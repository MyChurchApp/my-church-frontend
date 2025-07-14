"use client";

import { useEffect } from "react";
import { BookCover } from "../../components/livraria/BookCover/BookCover";
import AOS from "aos";
import "aos/dist/aos.css";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const libraryBooks = [
  {
    id: "bible",
    href: "livraria/biblia",
    imageUrl: "/capas/biblia.png",
    title: "Bíblia Sagrada",
    author: "Diversas Versões",
  },
];

export default function LibraryPage() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 50,
    });
  }, []);
  const router = useRouter();
  return (
    <div className="min-h-screen bg-background text-text-primary dark:bg-background dark:text-text-primary">
      <div className="bg-background-alt dark:bg-background ">
        <div className="w-11 flex-shrink-0 top-0 fixed">
          <Button
            variant="ghost"
            size="lg-icon"
            onClick={() => router.back()}
            title="Voltar"
          >
            <ArrowLeft size={22} />
          </Button>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Cabeçalho da Página */}
          <header className="mb-12 text-center" data-aos="fade-down">
            <h1 className="text-4xl md:text-5xl font-extrabold text-primary">
              Livraria Digital
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Seus recursos espirituais, todos em um só lugar. Acesse a Bíblia,
              hinários e outros materiais de estudo.
            </p>
          </header>

          {/* Estante de Livros */}
          <main>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
              {libraryBooks.map((book, index) => (
                <div key={book.id} data-aos-delay={`${index * 100}`}>
                  <BookCover
                    href={book.href}
                    imageUrl={book.imageUrl}
                    title={book.title}
                    author={book.author}
                  />
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
