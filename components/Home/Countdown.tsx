'use client';

import { useState, useEffect } from 'react';

interface CountdownProps {
  targetDate: string;
}

export function Countdown({ targetDate }: CountdownProps) {
    const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });
    
    useEffect(() => {
        const interval = setInterval(() => {
            const launchDate = new Date(targetDate).getTime();
            const now = new Date().getTime();
            const distance = launchDate - now;

            if (distance < 0) {
                clearInterval(interval);
                setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' });
                // You could add a "Launched!" state here
                return;
            }

            const format = (num: number) => String(num).padStart(2, '0');
            setTimeLeft({
                days: format(Math.floor(distance / (1000 * 60 * 60 * 24))),
                hours: format(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))),
                minutes: format(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))),
                seconds: format(Math.floor((distance % (1000 * 60)) / 1000)),
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [targetDate]);

    return (
        <div className="grid grid-cols-4 gap-2 sm:gap-4 my-8" data-aos="fade-up" data-aos-delay="200">
            <div><span className="countdown-number text-4xl sm:text-6xl font-bold tracking-tighter">{timeLeft.days}</span><span className="block text-xs text-blue-300 mt-1 uppercase tracking-widest">Dias</span></div>
            <div><span className="countdown-number text-4xl sm:text-6xl font-bold tracking-tighter">{timeLeft.hours}</span><span className="block text-xs text-blue-300 mt-1 uppercase tracking-widest">Horas</span></div>
            <div><span className="countdown-number text-4xl sm:text-6xl font-bold tracking-tighter">{timeLeft.minutes}</span><span className="block text-xs text-blue-300 mt-1 uppercase tracking-widest">Min</span></div>
            <div><span className="countdown-number text-4xl sm:text-6xl font-bold tracking-tighter">{timeLeft.seconds}</span><span className="block text-xs text-blue-300 mt-1 uppercase tracking-widest">Seg</span></div>
        </div>
    );
}
