"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

// NOVO: Componente de Indicador de Progresso
export const ProgressIndicator = ({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) => {
  const progressPercentage = (currentStep / totalSteps) * 100;
  return (
    <div className="w-full bg-gray-200 rounded-full h-2 mb-6 shadow-inner">
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
        style={{ width: `${progressPercentage}%` }}
      ></div>
    </div>
  );
};

// ATUALIZADO: StepContainer com mais espaçamento e sombra mais suave
export const StepContainer = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="w-full p-8 bg-white rounded-xl shadow-lg">
    <div className="flex flex-col items-center gap-3 mb-6">
      <div className="p-4 bg-blue-100 rounded-full text-blue-600">{icon}</div>
      <h1 className="text-3xl font-bold text-gray-800 text-center">{title}</h1>
    </div>
    {children}
  </div>
);

// SubmitButton permanece o mesmo
export const SubmitButton = ({
  label,
  className,
}: {
  label: string;
  className?: string;
}) => {
  const { pending } = useFormStatus();

  const defaultClasses =
    "w-full flex items-center justify-center py-3 px-4 font-semibold rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:cursor-not-allowed";

  return (
    <button
      type="submit"
      className={`${defaultClasses} ${className || "button-primary"}`.trim()}
      disabled={pending}
    >
      {pending ? <Loader2 className="animate-spin" /> : label}
    </button>
  );
};
