import Image from "next/image";

const Video = () => (
  <section
    id="video"
    className="py-20 sm:py-24"
    style={{ backgroundColor: "var(--mc-background)" }}
  >
    <div className="container mx-auto px-6">
      <div className="text-center mb-12">
        <h2
          className="text-3xl md:text-4xl font-extrabold mb-4"
          style={{ color: "var(--mc-text-primary)" }}
          data-aos="fade-up"
        >
          Veja o MyChurch em Ação
        </h2>
        <p
          className="text-lg max-w-3xl mx-auto"
          style={{ color: "var(--mc-text-secondary)" }}
          data-aos="fade-up"
          data-aos-delay="100"
        >
          Menos conversa, mais ação. Veja como a nossa plataforma é intuitiva,
          poderosa e bonita.
        </p>
      </div>
      <div
        className="max-w-4xl mx-auto"
        data-aos="fade-up"
        data-aos-delay="200"
      >
        <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden relative group">
          <Image
            src="https://placehold.co/1280x720/3B82F6/FFFFFF?text=MyChurch+Demo"
            alt="Demonstração do MyChurch"
            layout="fill"
            objectFit="cover"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <button className="w-20 h-20 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transform group-hover:scale-110 transition-transform duration-300">
              <i className="fas fa-play text-4xl ml-2"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
);
export default Video;
