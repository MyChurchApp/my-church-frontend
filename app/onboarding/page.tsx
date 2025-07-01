import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import React from "react";

interface OnboardingPageProps {
  searchParams?: Promise<{
    church?: string | string[];
  }>;
}

export default async function OnboardingPage({
  searchParams,
}: OnboardingPageProps) {
  const params = await searchParams;
  const churchId = params?.church;

  if (!churchId || Array.isArray(churchId)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <div className="p-8 text-center bg-white rounded-lg shadow-md max-w-sm">
          <h1 className="text-xl font-bold text-red-600">Link Inválido</h1>
          <p className="mt-2 text-gray-700">
            O link de convite que você usou é inválido ou não contém as
            informações necessárias. Por favor, verifique o link e tente
            novamente.
          </p>
        </div>
      </div>
    );
  }

  return <OnboardingForm churchId={churchId} />;
}
