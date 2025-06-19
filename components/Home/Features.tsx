'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { Users, HandHeart, UsersRound, CalendarCheck, PersonStanding, BookOpen, Building } from 'lucide-react';

// Dados das funcionalidades com os ícones corretos do Lucide
const featureData = [
  { icon: Users, title: "Gestão de Membros", desc: "Organize perfis completos, famílias e aniversariantes.", color: "indigo" },
  { icon: HandHeart, title: "Doações Online", desc: "Receba dízimos e ofertas de forma segura e transparente.", color: "pink" },
  { icon: UsersRound, title: "Pequenos Grupos", desc: "Acompanhe frequência e relatórios de cada grupo.", color: "orange" },
  { icon: CalendarCheck, title: "Agenda e Eventos", desc: "Divulgue cultos, conferências e gira as inscrições.", color: "violet" },
  { icon: PersonStanding, title: "Gestor de Culto", desc: "Apresente a Bíblia, hinos e pedidos de oração em tempo real.", color: "rose" },
  { icon: BookOpen, title: "Bíblia Digital", desc: "Acesso a diversas versões da Bíblia diretamente no app.", color: "teal" },
  { icon: Building, title: "Gestão de Patrimônio", desc: "Controle os ativos da sua igreja de forma organizada.", color: "amber" },
];

// Mapeamento de cores para as classes do Tailwind para evitar purga de CSS
const colorClasses: { [key: string]: string } = {
  indigo: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300",
  pink: "bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-300",
  orange: "bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-300",
  violet: "bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-300",
  rose: "bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300",
  teal: "bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-300",
  amber: "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300",
};

// Componente agora exportado como default, como é a convenção
export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-24 bg-background-alt dark:bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-primary mb-4" data-aos="fade-up">
            Funcionalidades Poderosas
          </h2>
          <p className="text-lg text-secondary max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="100">
            Do essencial para começar a ferramentas avançadas para crescer.
          </p>
        </div>
        <div className="relative" data-aos="fade-up">
          {/* O componente Swiper agora envolve diretamente os SwiperSlides */}
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
            className="!pb-12" // Adiciona padding-bottom para a paginação
          >
            {featureData.map((feature) => {
              const Icon = feature.icon;
              return (
                // A classe `self-stretch` força o slide a esticar para a altura do maior slide na linha
                <SwiperSlide key={feature.title} className="self-stretch">
                  {/* h-full força o card a ocupar toda a altura do slide esticado */}
                  <div className="bg-card p-6 rounded-xl border flex flex-col w-full h-full text-center items-center transition-transform duration-300 hover:scale-105 hover:shadow-lg">
                    <div className={`${colorClasses[feature.color]} rounded-full w-16 h-16 flex items-center justify-center mb-4 flex-shrink-0`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-primary mb-2">{feature.title}</h3>
                    {/* Cor do texto de descrição alterada para melhor contraste */}
                    <p className="text-muted-foreground text-sm flex-grow">{feature.desc}</p>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
          {/* A paginação é colocada fora do componente Swiper para um controlo adequado */}
          <div className="swiper-pagination features-pagination mt-4 text-center"></div>
        </div>
      </div>
    </section>
  );
}
