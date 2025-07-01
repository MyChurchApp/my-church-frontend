"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

export const StepContainer = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="w-full p-8 bg-white rounded-lg shadow-md">
    <div className="flex flex-col items-center gap-4 mb-6">
      <div className="p-3 rounded-full text-primary bg-primary/10">{icon}</div>
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
    </div>
    {children}
  </div>
);

export const SubmitButton = ({ label }: { label: string }) => {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="button-primary" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : label}
    </button>
  );
};
