'use client';
import { useState, useEffect } from "react";

// O estado inicial estático é crucial para evitar erros de hidratação no Next.js
const INITIAL_TIME = {
  days: '00',
  hours: '00',
  minutes: '00',
  seconds: '00',
};

// As Props permitem que a data seja passada de fora, tornando o componente reutilizável
interface CountdownProps {
  targetDate: string;
}

// Exportação padrão para garantir compatibilidade com o Next.js
export default function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);

  useEffect(() => {
    // A lógica da contagem só corre no lado do cliente, que é a prática correta
    const launchDate = new Date(targetDate).getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = launchDate - now;

      if (difference > 0) {
        // Função para formatar os números para terem sempre dois dígitos (ex: 07)
        const format = (num: number) => num.toString().padStart(2, '0');
        
        setTimeLeft({
          days: format(Math.floor(difference / (1000 * 60 * 60 * 24))),
          hours: format(Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))),
          minutes: format(Math.floor((difference / 1000 / 60) % 60)),
          seconds: format(Math.floor((difference / 1000) % 60)),
        });
      } else {
        // Zera o tempo e para o timer quando a contagem acaba
        setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' });
        clearInterval(timer);
      }
    }, 1000);

    // Função de limpeza para parar o timer de forma segura
    return () => clearInterval(timer);
  }, [targetDate]); // A dependência garante que o efeito reinicia se a data alvo mudar

  return (
    <div
      id="countdown"
      className="grid grid-cols-4 gap-2 sm:gap-4 my-8"
      data-aos="fade-up"
      data-aos-delay="200"
    >
      <div>
        <span className="countdown-number text-4xl sm:text-6xl font-bold tracking-tighter">
          {timeLeft.days}
        </span>
        <span className="block text-xs text-blue-300 mt-1 uppercase tracking-widest">
          Dias
        </span>
      </div>
      <div>
        <span className="countdown-number text-4xl sm:text-6xl font-bold tracking-tighter">
          {timeLeft.hours}
        </span>
        <span className="block text-xs text-blue-300 mt-1 uppercase tracking-widest">
          Horas
        </span>
      </div>
      <div>
        <span className="countdown-number text-4xl sm:text-6xl font-bold tracking-tighter">
          {timeLeft.minutes}
        </span>
        <span className="block text-xs text-blue-300 mt-1 uppercase tracking-widest">
          Min
        </span>
      </div>
      <div>
        <span className="countdown-number text-4xl sm:text-6xl font-bold tracking-tighter">
          {timeLeft.seconds}
        </span>
        <span className="block text-xs text-blue-300 mt-1 uppercase tracking-widest">
          Seg
        </span>
      </div>
    </div>
  );
};
