"use client";

import React from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

// Define as propriedades que o botão aceitará
interface PulsingBorderButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive: boolean;
}

/**
 * Um botão de oferta estilizado que usa classes diretas do Tailwind
 * para aplicar um efeito de pulso e borda quando a prop 'isActive' for verdadeira.
 */
const PulsingBorderButton = React.forwardRef<
  HTMLButtonElement,
  PulsingBorderButtonProps
>(({ className, isActive, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        // Estilos base do botão
        "w-full h-14 bg-gradient-to-r from-green-600 to-emerald-700",
        "text-white font-bold text-lg shadow-xl rounded-lg",
        "transition-all duration-300 ease-in-out",
        "flex items-center justify-center",

        // Lógica condicional
        isActive
          ? "animate-pulse scale-105 border-4 border-yellow-400 dark:border-yellow-300 duration-[10s]" // ✅ CONTROLE DE TEMPO AQUI
          : "hover:scale-105 hover:from-green-700 hover:to-emerald-800",

        className
      )}
      {...props}
    >
      <Heart className="mr-2 h-6 w-6" />
      <span>Ofertar no Culto</span>
    </button>
  );
});

PulsingBorderButton.displayName = "PulsingBorderButton";

export { PulsingBorderButton };
