'use client';

import { useState, useEffect } from 'react';

// Props to define the target date from the parent component
interface CountdownProps {
  targetDate: string;
}

// The static initial state is crucial to avoid hydration errors in Next.js
const DYNAMIC_INITIAL_STATE = {
  days: '00',
  hours: '00',
  minutes: '00',
  seconds: '00',
};

// Changed to a default export to fix the build error
export default function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(DYNAMIC_INITIAL_STATE);

  useEffect(() => {
    // This logic only runs on the client side
    const launchDate = new Date(targetDate).getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = launchDate - now;

      if (difference > 0) {
        // Formats numbers to always have two digits (e.g., 09)
        const format = (num: number) => num.toString().padStart(2, '0');
        
        setTimeLeft({
          days: format(Math.floor(difference / (1000 * 60 * 60 * 24))),
          hours: format(Math.floor((difference / (1000 * 60 * 60)) % 24)),
          minutes: format(Math.floor((difference / 1000 / 60) % 60)),
          seconds: format(Math.floor((difference / 1000) % 60)),
        });
      } else {
        // When time is up
        setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' });
        clearInterval(timer);
      }
    }, 1000);

    // Cleanup function to stop the interval when the component is unmounted
    return () => clearInterval(timer);
  }, [targetDate]); // The dependency array ensures the effect restarts if the target date changes

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
