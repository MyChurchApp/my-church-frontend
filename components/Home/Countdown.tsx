'use client';

import { useState, useEffect } from 'react';

// Props para definir a data alvo a partir do componente pai
interface CountdownProps {
  targetDate: string;
}

// O estado inicial estático é crucial para evitar erros de hidratação no Next.js
const DYNAMIC_INITIAL_STATE = {
  days: '00',
  hours: '00',
  minutes: '00',
  seconds: '00',
};

export function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(DYNAMIC_INITIAL_STATE);

  useEffect(() => {
    // Esta lógica só corre no lado do cliente
    const launchDate = new Date(targetDate).getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = launchDate - now;

      if (difference > 0) {
        // Formata os números para terem sempre dois dígitos (ex: 09)
        const format = (num: number) => num.toString().padStart(2, '0');
        
        setTimeLeft({
          days: format(Math.floor(difference / (1000 * 60 * 60 * 24))),
          hours: format(Math.floor((difference / (1000 * 60 * 60)) % 24)),
          minutes: format(Math.floor((difference / 1000 / 60) % 60)),
          seconds: format(Math.floor((difference / 1000) % 60)),
        });
      } else {
        // Quando o tempo acaba
        setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' });
        clearInterval(timer);
      }
    }, 1000);

    // Função de limpeza para parar o timer quando o componente é desmontado
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
}
