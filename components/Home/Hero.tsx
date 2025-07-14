// app/components/Hero.tsx
const Hero = () => {
  return (
    <section className="hero-bg flex items-center justify-center text-white relative min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6 text-center relative z-10">
        <h1
          className="text-4xl md:text-6xl font-black leading-tight mb-4"
          data-aos="fade-up"
        >
          A Revolução na Gestão de Igrejas Começou.
        </h1>
        <p
          className="text-lg md:text-xl text-blue-100 mb-8 max-w-3xl mx-auto"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          Experimente uma gestão simplificada com uma plataforma poderosa e
          intuitiva. O MyChurch já está disponível com um plano gratuito para
          sempre.
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
};

export default Hero;
