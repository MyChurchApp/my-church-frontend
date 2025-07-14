import Image from "next/image";

const NewsFeed = () => {
  const feedItems = [
    {
      img: "https://placehold.co/80x80/8B5CF6/FFFFFF?text=Evento",
      alt: "Evento",
      title: "Jantar de Casais",
      desc: "Inscrições abertas para a nossa noite especial. Vagas limitadas!",
    },
    {
      img: "https://placehold.co/80x80/F97316/FFFFFF?text=Culto",
      alt: "Culto",
      title: "Culto de Domingo",
      desc: "Junte-se a nós este domingo para uma mensagem poderosa.",
    },
    {
      img: "https://placehold.co/80x80/10B981/FFFFFF?text=Aviso",
      alt: "Aviso",
      title: "Novo Estudo Bíblico",
      desc: "Vamos começar a estudar o livro de Romanos. Todas as quartas!",
    },
  ];

  return (
    <section
      id="feed"
      className="py-20 sm:py-24"
      style={{ backgroundColor: "var(--mc-background-alt)" }}
    >
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div data-aos="fade-right">
            <h2
              className="text-3xl md:text-4xl font-extrabold mb-4"
              style={{ color: "var(--mc-text-primary)" }}
            >
              Mantenha a sua Comunidade Informada
            </h2>
            <p
              className="text-lg mb-6"
              style={{ color: "var(--mc-text-secondary)" }}
            >
              Com o nosso feed de notícias integrado, pode partilhar os últimos
              anúncios, eventos, estudos bíblicos e inspirações diárias, tudo
              num só lugar. Mantenha os seus membros conectados e engajados como
              nunca antes.
            </p>
            <a
              href="#plans"
              className="font-bold text-blue-600 hover:underline"
            >
              Veja os planos com esta funcionalidade{" "}
              <i className="fas fa-arrow-right ml-1"></i>
            </a>
          </div>
          <div className="flex justify-center" data-aos="fade-left">
            <div
              className="w-full max-w-md p-4 rounded-2xl shadow-xl"
              style={{
                backgroundColor: "var(--mc-card-bg)",
                border: "1px solid var(--mc-border-color)",
              }}
            >
              <div className="space-y-4">
                {feedItems.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg flex space-x-4"
                    style={{ backgroundColor: "var(--mc-background-alt)" }}
                  >
                    <Image
                      src={item.img}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-lg object-cover"
                      alt={item.alt}
                    />
                    <div>
                      <h4
                        className="font-bold"
                        style={{ color: "var(--mc-text-primary)" }}
                      >
                        {item.title}
                      </h4>
                      <p
                        className="text-sm"
                        style={{ color: "var(--mc-text-secondary)" }}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default NewsFeed;
