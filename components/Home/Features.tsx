"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const featuresData = [
  { 
    icon: "fa-users-viewfinder",
    title: "Gestão de Membros",
    desc: "Organize perfis completos, famílias e aniversariantes.",
    color: "indigo",
  },
  {
    icon: "fa-hand-holding-heart",
    title: "Doações Online",
    desc: "Receba dízimos e ofertas de forma segura e transparente.",
    color: "pink",
  },
  {
    icon: "fa-people-group",
    title: "Pequenos Grupos",
    desc: "Acompanhe frequência e relatórios de cada grupo.",
    color: "orange",
  },
  {
    icon: "fa-calendar-check",
    title: "Agenda e Eventos",
    desc: "Divulgue cultos, conferências e gira as inscrições.",
    color: "violet",
  },
  {
    icon: "fa-person-praying",
    title: "Gestor de Culto",
    desc: "Apresente a Bíblia, hinos e pedidos de oração em tempo real.",
    color: "rose",
  },
  {
    icon: "fa-book-bible",
    title: "Bíblia Digital",
    desc: "Acesso a diversas versões da Bíblia diretamente no app.",
    color: "teal",
  },
  {
    icon: "fa-boxes-stacked",
    title: "Gestão de Patrimônio",
    desc: "Controle os ativos da sua igreja de forma organizada.",
    color: "amber",
  },
];

const Features = () => (
  <section
    id="features"
    className="py-20 sm:py-24 bg-background dark:bg-background-alt"
  >
    <div className="container mx-auto px-6">
      <div className="text-center mb-16">
        <h2
          className="text-3xl md:text-4xl font-extrabold text-text-primary mb-4"
          data-aos="fade-up"
        >
          Funcionalidades Poderosas
        </h2>
        <p
          className="text-lg text-text-secondary max-w-3xl mx-auto"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          Do essencial para começar a ferramentas avançadas para crescer.
        </p>
      </div>
      <div className="features-swiper" data-aos="fade-up">
        {/* CORREÇÃO: Opções do Swiper idênticas ao original */}
        <Swiper
          modules={[Pagination]}
          loop={false}
          slidesPerView={1.5}
          spaceBetween={16}
          pagination={{ el: ".features-pagination", clickable: true }}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 24 },
            768: { slidesPerView: 3, spaceBetween: 24 },
            1024: { slidesPerView: 5, spaceBetween: 32 },
          }}
        >
          <div className="swiper-wrapper">
            {featuresData.map((feature, index) => (
              <SwiperSlide key={index}>
                <div className="bg-card-bg p-6 rounded-xl border border-border-color flex flex-col w-full h-full text-center items-center">
                  <div
                    className={`bg-${feature.color}-100 dark:bg-${feature.color}-900/50 text-${feature.color}-600 dark:text-${feature.color}-300 rounded-full w-16 h-16 flex items-center justify-center mb-4`}
                  >
                    <i className={`fa-solid ${feature.icon} fa-2x`}></i>
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary text-sm">{feature.desc}</p>
                </div>
              </SwiperSlide>
            ))}
          </div>
        </Swiper>
        <div className="swiper-pagination features-pagination mt-8 flex justify-center space-x-2"></div>
      </div>
    </div>
  </section>
);

export default Features;
