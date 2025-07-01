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

export const SubmitButton = ({
  label,
  className,
  disabled,
}: {
  label: string;
  className?: string;
  disabled?: boolean;
}) => {
  const { pending } = useFormStatus();

  const isDisabled = pending || disabled;
  const defaultClasses =
    "w-full flex items-center justify-center py-3 px-4 font-semibold rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed";

  // Classes para o botão ativo e desabilitado
  const enabledClasses =
    "text-white shadow-lg bg-[linear-gradient(45deg,rgba(30,64,175,.95),rgba(59,130,246,.95))] hover:brightness-110 transform hover:-translate-y-1 transition-all duration-300";
  const disabledClasses =
    "bg-gray-300 text-gray-500 shadow-none pointer-events-none";

  return (
    <button
      type="submit"
      className={`${defaultClasses} ${
        isDisabled ? disabledClasses : enabledClasses
      } ${className || ""}`.trim()}
      disabled={isDisabled}
    >
      {pending ? <Loader2 className="animate-spin" /> : label}
    </button>
  );
};
