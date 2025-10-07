
"use client";

import SearchBox from "../SearchBox/SearchBox";


export default function Hero() {
  return (
    <section className="hero-bg flex items-center justify-center text-white min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6 text-center ">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4" data-aos="fade-up">
          Qual igreja está procurando?
        </h2>
        <div data-aos="fade-up" data-aos-delay="100" className="mb-10 relative z-[20]">
          <SearchBox />
        </div>

        <h1 className="text-4xl md:text-6xl font-black leading-tight mb-4" data-aos="fade-up">
          A Revolução na Gestão de Igrejas Começou.
        </h1>
        <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="200">
          Experimente uma gestão simplificada com uma plataforma poderosa e intuitiva. O MyChurch já está disponível com um plano gratuito para sempre.
        </p>
        <div data-aos="fade-up" data-aos-delay="400">
          <a
            href="/cadastro?plano=1"
            className="bg-white text-blue-600 font-bold py-4 px-10 rounded-full text-lg hover:bg-blue-100 transition duration-300 transform hover:scale-105 shadow-2xl"
          >
            Começar Gratuitamente
          </a>
        </div>
      </div>
    </section>
  );
}
