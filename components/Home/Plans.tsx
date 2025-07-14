"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { Loader2 } from "lucide-react";
import { ApiPlan, getPlans } from "@/services/plans/plans";

// Dados estáticos da UI que não vêm da API
const staticPlanDetails: { [key: string]: any } = {
  Descubra: {
    description: "Ideal para igrejas pequenas ou em fase de testes.",
    features: (plan: ApiPlan) => [
      `Até ${plan.maxMembers} membros`,
      `${plan.maxStorageGB}GB de armazenamento`,
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
  Crescer: {
    description: "Para igrejas em fase de estruturação e expansão digital.",
    features: (plan: ApiPlan) => [
      `Até ${plan.maxMembers} membros`,
      `${plan.maxStorageGB}GB de armazenamento`,
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
  Multiplicar: {
    description: "Para igrejas com múltiplas filiais e foco em engajamento.",
    features: (plan: ApiPlan) => [
      `Até ${plan.maxMembers} membros`,
      `${plan.maxStorageGB}GB de armazenamento`,
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
  Influenciar: {
    description: "Para grandes igrejas com alta demanda de gestão.",
    features: (plan: ApiPlan) => [
      `Até ${plan.maxMembers} membros`,
      `${plan.maxStorageGB}GB de armazenamento`,
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
  "Visão Apostólica": {
    price: "Consulte",
    description: "Para convenções e redes com alta complexidade.",
    features: () => [
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
};

const Plans = () => {
  const {
    data: apiPlans = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["plans"],
    queryFn: getPlans,
    staleTime: 1000 * 60 * 60, // Cache de 1 hora
  });

  const plansData = useMemo(() => {
    // Garante que a mesclagem só ocorra se houver planos da API
    if (!apiPlans || apiPlans.length === 0) return [];
    return apiPlans.map((plan) => ({
      ...plan,
      // Garante que detalhes estáticos existam antes de tentar acessá-los
      ...(staticPlanDetails[plan.name] || {}),
      features: staticPlanDetails[plan.name]?.features(plan) || [],
    }));
  }, [apiPlans]);

  // AQUI ESTÁ A LÓGICA ATUALIZADA
  const getPlanLink = (plan: ApiPlan) => {
    if (plan.name === "Visão Apostólica") {
      return "/contact";
    }
    // Adiciona o ID do plano como um parâmetro de busca na URL
    return `/cadastro?plano=${plan.id}`;
  };

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
          {isLoading && (
            <div className="flex justify-center items-center h-96">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            </div>
          )}

          {isError && (
            <div className="text-center text-red-500">
              Falha ao carregar os planos. Tente novamente mais tarde.
            </div>
          )}

          {!isLoading && !isError && (
            <>
              <Swiper
                modules={[Pagination, Navigation]}
                loop={false}
                slidesPerView={1}
                spaceBetween={24}
                pagination={{ el: ".plans-pagination", clickable: true }}
                navigation={true}
                breakpoints={{
                  640: { slidesPerView: 1 },
                  768: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                  1280: { slidesPerView: 4 },
                }}
              >
                {plansData.map((plan, index) => (
                  <SwiperSlide key={index} className="pb-12 h-auto">
                    <div
                      className={`bg-card-bg p-8 rounded-xl border-2 ${plan.borderColor} flex flex-col w-full h-full relative`}
                    >
                      {plan.badge && (
                        <div
                          className={`absolute top-5 right-8 -translate-y-1/2 px-3 py-1 text-sm font-bold text-white rounded-full ${plan.badge.class}`}
                        >
                          {plan.badge.text}
                        </div>
                      )}
                      <div className="flex-grow">
                        <h3 className="text-xl font-bold text-text-primary">
                          {plan.name}
                        </h3>
                        <p className="text-4xl font-extrabold text-text-primary my-4">
                          {plan.price === "Consulte"
                            ? plan.price
                            : `R$ ${plan.price}`}
                          {plan.price !== "Consulte" && (
                            <span className="text-lg font-medium text-text-secondary">
                              {" "}
                              /mês
                            </span>
                          )}
                        </p>
                        <p className="text-text-secondary mb-6 text-sm">
                          {plan.description}
                        </p>
                        <ul className="space-y-3 text-sm text-text-secondary">
                          {plan.features.map(
                            (feature: string, fIndex: number) => (
                              <li key={fIndex} className="flex items-start">
                                <i
                                  className={`fa-solid ${plan.featureIcon} mr-3 mt-1`}
                                ></i>
                                <span>{feature}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                      <a
                        href={getPlanLink(plan)}
                        className={`mt-8 block w-full text-center text-white font-bold py-3 rounded-lg transition duration-300 ${plan.buttonClass}`}
                      >
                        {plan.buttonText}
                      </a>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <div className="swiper-pagination plans-pagination mt-8 flex justify-center space-x-2"></div>
            </>
          )}
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
