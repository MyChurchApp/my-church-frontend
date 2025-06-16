"use client";
import { useState, useRef } from "react";

// ... (código do array `faqData` continua o mesmo)
const faqData = [
  {
    q: "O plano gratuito é grátis para sempre?",
    a: "Sim! O nosso plano 'Descubra' é totalmente gratuito, para sempre. É a nossa forma de apoiar igrejas que estão a começar, oferecendo as ferramentas essenciais sem qualquer custo.",
  },
  {
    q: "Posso mudar de plano mais tarde?",
    a: "Claro! Pode fazer o upgrade (ou downgrade) do seu plano em qualquer altura, diretamente na plataforma. O sistema adapta-se ao crescimento da sua igreja.",
  },
  {
    q: "Os dados da minha igreja estão seguros?",
    a: "A segurança é a nossa prioridade máxima. Utilizamos encriptação de ponta, servidores seguros e as melhores práticas de segurança de dados para garantir que as informações da sua igreja estão sempre protegidas.",
  },
  {
    q: "Oferecem suporte para a configuração inicial?",
    a: "Sim. Para além dos nossos tutoriais e da secção de ajuda, os planos pagos incluem diferentes níveis de suporte para o ajudar a importar os seus dados e a configurar a plataforma para as necessidades específicas da sua igreja.",
  },
];

const FaqItem = ({
  item,
  isActive,
  onToggle,
}: {
  item: { q: string; a: string };
  isActive: boolean;
  onToggle: () => void;
}) => {
  const answerEl = useRef<HTMLDivElement>(null);

  return (
    <div
      className={`faq-item rounded-lg overflow-hidden ${
        isActive ? "active" : ""
      }`}
      style={{ border: "1px solid var(--mc-border-color)" }}
    >
      <div
        className="faq-question flex justify-between items-center p-6 cursor-pointer"
        onClick={onToggle}
      >
        <h3 className="font-bold" style={{ color: "var(--mc-text-primary)" }}>
          {item.q}
        </h3>
        <i
          className="fas fa-chevron-down"
          style={{ color: "var(--mc-text-primary)" }}
        ></i>
      </div>
      <div
        ref={answerEl}
        className="faq-answer"
        style={
          isActive ? { maxHeight: answerEl.current?.scrollHeight + "px" } : {}
        }
      >
        <p
          className="px-6 pb-6 pt-0"
          style={{ color: "var(--mc-text-secondary)" }}
        >
          {item.a}
        </p>
      </div>
    </div>
  );
};

const FAQ = () => {
  // ... (lógica do componente continua a mesma)
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="py-20 sm:py-24"
      style={{ backgroundColor: "var(--mc-background-alt)" }}
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl font-extrabold mb-4"
            data-aos="fade-up"
            style={{ color: "var(--mc-text-primary)" }}
          >
            Perguntas Frequentes
          </h2>
          <p
            className="text-lg max-w-3xl mx-auto"
            data-aos="fade-up"
            data-aos-delay="100"
            style={{ color: "var(--mc-text-secondary)" }}
          >
            Tudo o que precisa de saber antes de começar.
          </p>
        </div>
        <div className="max-w-3xl mx-auto space-y-4" data-aos="fade-up">
          {faqData.map((item, index) => (
            <FaqItem
              key={index}
              item={item}
              isActive={activeIndex === index}
              onToggle={() =>
                setActiveIndex(activeIndex === index ? null : index)
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
