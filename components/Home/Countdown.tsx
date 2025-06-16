// app/components/Countdown.tsx
"use client";
import { useState, useEffect } from "react";

// Valores iniciais estáticos para garantir que o servidor e o cliente renderizem a mesma coisa
const INITIAL_TIME = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
};

const Countdown = () => {
  // 1. Comece com um estado inicial estático (não dinâmico)
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);

  useEffect(() => {
    // A data de lançamento
    const launchDate = +new Date("2025-07-15T00:00:00");

    // 2. O `setInterval` só será criado no cliente, após a primeira renderização
    const timer = setInterval(() => {
      const difference = launchDate - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        // Se a contagem acabou, zera o tempo e para o timer
        setTimeLeft(INITIAL_TIME);
        clearInterval(timer);
      }
    }, 1000);

    // 3. Função de limpeza: É crucial para parar o `setInterval` quando o componente for desmontado
    return () => {
      clearInterval(timer);
    };
  }, []); // O array vazio `[]` garante que este efeito rode apenas uma vez, no lado do cliente

  const formatTime = (time: number) => time.toString().padStart(2, "0");

  return (
    <div
      id="countdown"
      className="grid grid-cols-4 gap-2 sm:gap-4 my-8"
      data-aos="fade-up"
      data-aos-delay="200"
    >
      <div>
        <span className="countdown-number text-4xl sm:text-6xl font-bold tracking-tighter">
          {formatTime(timeLeft.days)}
        </span>
        <span className="block text-xs text-blue-300 mt-1 uppercase tracking-widest">
          Dias
        </span>
      </div>
      <div>
        <span className="countdown-number text-4xl sm:text-6xl font-bold tracking-tighter">
          {formatTime(timeLeft.hours)}
        </span>
        <span className="block text-xs text-blue-300 mt-1 uppercase tracking-widest">
          Horas
        </span>
      </div>
      <div>
        <span className="countdown-number text-4xl sm:text-6xl font-bold tracking-tighter">
          {formatTime(timeLeft.minutes)}
        </span>
        <span className="block text-xs text-blue-300 mt-1 uppercase tracking-widest">
          Min
        </span>
      </div>
      <div>
        <span className="countdown-number text-4xl sm:text-6xl font-bold tracking-tighter">
          {formatTime(timeLeft.seconds)}
        </span>
        <span className="block text-xs text-blue-300 mt-1 uppercase tracking-widest">
          Seg
        </span>
      </div>
    </div>
  );
};

export default Countdown;
