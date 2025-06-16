// app/components/Launch.tsx
import Countdown from "./Countdown";

const Launch = () => {
  return (
    <section id="launch" className="py-20 sm:py-24 text-white overflow-hidden">
      <div className="container mx-auto px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-4xl md:text-5xl font-black mb-2"
            data-aos="fade-up"
          >
            A Revolução Começa Em...
          </h2>
          <p
            className="text-lg text-blue-200 mb-10"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Lançamento Oficial: 15 de Julho de 2025
          </p>
          <Countdown />
          <p
            className="text-blue-200 mb-4 mt-12"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            Seja o primeiro a saber. Inscreva-se para receber uma notificação
            exclusiva.
          </p>
          <form
            className="max-w-md mx-auto flex flex-col sm:flex-row gap-3"
            data-aos="fade-up"
            data-aos-delay="400"
          >
            <input
              type="email"
              placeholder="O seu melhor e-mail"
              className="w-full px-4 py-3 rounded-lg border-none bg-white/10 text-white placeholder-blue-200 focus:ring-2 focus:ring-white focus:outline-none"
              required
            />
            <button
              type="submit"
              className="bg-white text-blue-600 font-bold py-3 px-6 rounded-lg hover:bg-blue-100 transition duration-300 whitespace-nowrap"
            >
              Notifique-me!
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Launch;
