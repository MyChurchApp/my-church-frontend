// app/components/Plans.tsx
"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";

// Importando os estilos do Swiper
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// Array de dados completo e sem omissões para os planos
const plansData = [
  {
    name: "Plano Descubra",
    price: "R$ 0",
    period: "/mês",
    description: "Ideal para igrejas pequenas ou em fase de testes.",
    features: [
      "Até 50 membros",
      "1 filial",
      "Gestão básica de membros e financeiro",
      "Dízimos via link externo",
      "Agenda da igreja (cadastro manual)",
      "Suporte via FAQ",
    ],
    buttonText: "Começar Grátis",
    buttonClass: "bg-emerald-500 hover:bg-emerald-600",
    borderColor: "border-emerald-500",
    badge: null,
    featureIcon: "fa-check text-green-500",
  },
  {
    name: "Plano Crescer",
    price: "R$ 69",
    period: "/mês",
    description: "Para igrejas em fase de estruturação e expansão digital.",
    features: [
      "Até 500 membros",
      "2 filiais",
      "Gestão completa de membros e financeiro",
      "Gateway de pagamento integrado",
      "Filtragem por e-mail e WhatsApp",
      "Suporte via e-mail",
    ],
    buttonText: "Assinar Agora",
    buttonClass: "bg-blue-600 hover:bg-blue-700",
    borderColor: "border-border-color",
    badge: null,
    featureIcon: "fa-check text-green-500",
  },
  {
    name: "Plano Multiplicar",
    price: "R$ 149",
    period: "/mês",
    description: "Para igrejas com múltiplas filiais e foco em engajamento.",
    features: [
      "Até 2.500 membros",
      "10 filiais",
      "Gestor de Culto Ao Vivo",
      "Integração com WhatsApp Business",
      "Suporte prioritário",
    ],
    buttonText: "Assinar Agora",
    buttonClass:
      "bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600",
    borderColor: "border-border-color",
    badge: { text: "Popular", class: "bg-blue-600" },
    featureIcon: "fa-check text-green-500",
  },
  {
    name: "Plano Influenciar",
    price: "R$ 279",
    period: "/mês",
    description: "Para grandes igrejas com alta demanda de gestão.",
    features: [
      "Até 10.000 membros",
      "Filiais ilimitadas",
      "Automação administrativa",
      "Dashboard com KPIs",
      "App com ícone e nome da igreja",
      "Suporte via WhatsApp dedicado",
    ],
    buttonText: "Assinar Agora",
    buttonClass:
      "bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600",
    borderColor: "border-border-color",
    badge: null,
    featureIcon: "fa-check text-green-500",
  },
  {
    name: "Visão Apostólica",
    price: "Consulte",
    period: "",
    description: "Para convenções e redes com alta complexidade.",
    features: [
      "Membros e filiais ilimitados",
      "Infraestrutura dedicada",
      "Funcionalidades sob demanda",
      "App 100% personalizado",
      "Suporte pessoal por contrato",
      "Treinamento e onboarding",
    ],
    buttonText: "Fale Conosco",
    buttonClass: "bg-violet-600 hover:bg-violet-700",
    borderColor: "border-border-color",
    badge: { text: "Personalizado", class: "bg-violet-600" },
    featureIcon: "fa-star text-yellow-500",
  },
];

const Plans = () => {
  return (
    <section id="plans" className="py-20 sm:py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl font-extrabold text-text-primary mb-4"
            data-aos="fade-up"
          >
            Planos e Preços
          </h2>
          <p
            className="text-lg text-text-secondary max-w-3xl mx-auto"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Escolha o plano que melhor se adapta às necessidades da sua igreja.
          </p>
        </div>
        <div className="plans-swiper relative" data-aos="fade-up">
          <Swiper
            modules={[Pagination, Navigation]}
            loop={false}
            slidesPerView={1}
            spaceBetween={24}
            pagination={{ el: ".plans-pagination", clickable: true }}
            navigation={true}
            breakpoints={{
              640: { slidesPerView: 1, spaceBetween: 24 },
              768: { slidesPerView: 2, spaceBetween: 24 },
              1024: { slidesPerView: 3, spaceBetween: 32 },
              1280: { slidesPerView: 4, spaceBetween: 32 },
            }}
          >
            {plansData.map((plan, index) => (
              <SwiperSlide key={index} className="pb-12">
                <div
                  className={`bg-card-bg p-8 rounded-xl border-2 ${plan.borderColor} flex flex-col w-full h-full relative`}
                >
                  {plan.badge && (
                    <div className={`plan-badge ${plan.badge.class}`}>
                      {plan.badge.text}
                    </div>
                  )}
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-text-primary">
                      {plan.name}
                    </h3>
                    <p className="text-4xl font-extrabold text-text-primary my-4">
                      {plan.price}
                      {plan.period && (
                        <span className="text-lg font-medium text-text-secondary">
                          {" "}
                          {plan.period}
                        </span>
                      )}
                    </p>
                    <p className="text-text-secondary mb-6 text-sm">
                      {plan.description}
                    </p>
                    <ul className="space-y-3 text-sm text-text-secondary">
                      {plan.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-start">
                          <i
                            className={`fa-solid ${plan.featureIcon} mr-3 mt-1`}
                          ></i>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <a
                    href="#"
                    className={`mt-8 block w-full text-center text-white font-bold py-3 rounded-lg transition duration-300 ${plan.buttonClass}`}
                  >
                    {plan.buttonText}
                  </a>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="swiper-pagination plans-pagination mt-8 flex justify-center space-x-2"></div>
        </div>
        <p
          className="text-center mt-12 text-text-secondary text-sm"
          data-aos="fade-up"
        >
          Todos os planos incluem atualizações contínuas e garantia de
          satisfação de 30 dias.
        </p>
      </div>
    </section>
  );
};

export default Plans;
