'use client';
import { useEffect } from 'react';
import AOS from 'aos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Countdown from './Countdown';

// Removido 'export function Launch()' e adicionado export default
// para corresponder à forma como está a ser importado em `app/page.tsx`
export default function CountdownSection() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 50,
    });
  }, []);

  return (
    <section id="launch" className="py-20 sm:py-24 text-white overflow-hidden">
      <div className="container mx-auto px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-2" data-aos="fade-up">A Revolução Começa Em...</h2>
          <p className="text-lg text-blue-200 mb-10" data-aos="fade-up" data-aos-delay="100">
            Lançamento Oficial: 15 de Julho de 2025
          </p>
          
          <Countdown targetDate="2025-07-15T00:00:00" />
          
          <p className="text-blue-200 mb-4 mt-12" data-aos="fade-up" data-aos-delay="300">
            Seja o primeiro a saber. Inscreva-se para receber uma notificação exclusiva.
          </p>
          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3" data-aos="fade-up" data-aos-delay="400">
            <Input 
              type="email" 
              placeholder="O seu melhor e-mail" 
              className="bg-white/10 text-white placeholder:text-blue-200 border-0 focus-visible:ring-white" 
              required 
            />
            <Button type="submit" className="bg-white text-blue-600 hover:bg-blue-100 whitespace-nowrap">
              Notifique-me!
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
