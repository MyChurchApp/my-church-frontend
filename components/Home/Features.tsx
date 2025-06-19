'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { Users, HandHeart, UsersRound, CalendarCheck, PersonStanding, BookOpen, Building } from 'lucide-react';

const featureData = [
  { icon: Users, title: "Gestão de Membros", text: "Organize perfis completos, famílias e aniversariantes.", color: "indigo" },
  { icon: HandHeart, title: "Doações Online", text: "Receba dízimos e ofertas de forma segura e transparente.", color: "pink" },
  { icon: UsersRound, title: "Pequenos Grupos", text: "Acompanhe frequência e relatórios de cada grupo.", color: "orange" },
  { icon: CalendarCheck, title: "Agenda e Eventos", text: "Divulgue cultos, conferências e gira as inscrições.", color: "violet" },
  { icon: PersonStanding, title: "Gestor de Culto", text: "Apresente a Bíblia, hinos e pedidos de oração em tempo real.", color: "rose" },
  { icon: BookOpen, title: "Bíblia Digital", text: "Acesso a diversas versões da Bíblia diretamente no app.", color: "teal" },
  { icon: Building, title: "Gestão de Patrimônio", text: "Controle os ativos da sua igreja de forma organizada.", color: "amber" },
];

export default function FeaturesSection() {
  const colors: { [key: string]: string } = {
    indigo: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300",
    pink: "bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-300",
    orange: "bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-300",
    violet: "bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-300",
    rose: "bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300",
    teal: "bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-300",
    amber: "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300",
  }

  return (
    <section id="features" className="py-20 sm:py-24 bg-background-alt dark:bg-background">
        <div className="container mx-auto px-6">
             <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-extrabold text-primary mb-4" data-aos="fade-up">Funcionalidades Poderosas</h2>
                <p className="text-lg text-secondary max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="100">Do essencial para começar a ferramentas avançadas para crescer.</p>
            </div>
            <div className="swiper-container features-swiper" data-aos="fade-up">
                <div className="swiper-wrapper">
                    {featureData.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <SwiperSlide key={index} className="h-auto">
                                <div className="bg-card p-6 rounded-xl border flex flex-col w-full h-full text-center items-center">
                                    <div className={`${colors[feature.color]} rounded-full w-16 h-16 flex items-center justify-center mb-4`}>
                                        <Icon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-primary mb-2">{feature.title}</h3>
                                    <p className="text-secondary text-sm flex-grow">{feature.text}</p>
                                </div>
                            </SwiperSlide>
                        )
                    })}
                </div>
                <div className="swiper-pagination features-pagination mt-8 relative"></div>
            </div>
        </div>
    </section>
  );
}
