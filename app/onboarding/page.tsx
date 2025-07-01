"use client";

import { OnboardingForm } from "@/components/onboarding/onboarding-form";

interface OnboardingPageProps {
  searchParams: {
    church?: string;
  };
}

export default function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const churchId = searchParams.church;

  if (!churchId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">ID da igreja não fornecido.</p>
      </div>
    );
  }

  return <OnboardingForm churchId={churchId} />;
}
