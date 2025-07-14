"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Church } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from "@tanstack/react-query";
import { createChurchWithAdmin } from "@/services/registration/registration";

// Importando os novos componentes de cada passo
import { StepIndicator } from "../../components/cadastro/StepIndicator/StepIndicator";
import { Step1_PlanoContato } from "../../components/cadastro/Steps/Step1PlanoContato";
import { Step2_InfoIgreja } from "../../components/cadastro/Steps/Step2InfoIgreja";
import { Step3_InfoAdmin } from "../../components/cadastro/Steps/Step3InfoAdmin";
import { Step4_Pagamento } from "../../components/cadastro/Steps/Step4Pagamento";
import { Step5_Confirmacao } from "../../components/cadastro/Steps/Step5Confirmacao";
import { Step6_PixPagamento } from "../../components/cadastro/Steps/Step6PixPagamento";

export type Step =
  | "plano"
  | "igreja"
  | "admin"
  | "pagamento"
  | "confirmacao"
  | "pix";

const queryClient = new QueryClient();

function CadastroPageContent() {
  const searchParams = useSearchParams();
  const planoInicial = searchParams.get("plano");

  const [currentStep, setCurrentStep] = useState<Step>("plano");

  // Lógica de persistência de dados
  const [formData, setFormData] = useState<any>(() => {
    if (typeof window === "undefined") {
      return {
        planId: planoInicial ? Number(planoInicial) : null,
        aceitarTermos: false,
      };
    }
    try {
      const savedData = localStorage.getItem("registrationFormData");
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (planoInicial && parsedData.planId !== Number(planoInicial)) {
          parsedData.planId = Number(planoInicial);
        }
        return parsedData;
      }
    } catch (error) {
      console.error("Falha ao ler dados do localStorage", error);
    }
    return {
      planId: planoInicial ? Number(planoInicial) : null,
      aceitarTermos: false,
    };
  });

  const [error, setError] = useState<string | null>(null);
  const [pixCheckout, setPixCheckout] = useState<any>(null);

  useEffect(() => {
    localStorage.setItem("registrationFormData", JSON.stringify(formData));
  }, [formData]);

  const { mutate: submitRegistration, isPending } = useMutation({
    mutationFn: () => {
      setError(null);
      const payload = {
        name: formData.name,
        description: formData.description,
        document: formData.document,
        phone: formData.phone,
        planId: formData.planId,
        billingType: formData.billingType,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: "Brasil",
          neighborhood: formData.neighborhood,
          number: formData.number,
        },
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        adminPhone: formData.adminPhone,
        adminPassword: formData.adminPassword,
        adminDocuments: [{ type: 1, number: formData.adminCPF }],
        adminAddress: {
          street: formData.adminStreet,
          city: formData.adminCity,
          state: formData.adminState,
          zipCode: formData.adminZipCode,
          country: "Brasil",
          neighborhood: formData.adminNeighborhood,
          number: formData.adminNumber,
        },
        ministry: formData.ministry,
      };
      return createChurchWithAdmin(payload);
    },
    onSuccess: (data: any) => {
      localStorage.removeItem("registrationFormData");
      if (formData.billingType === "PIX" && data?.checkoutUrl) {
        setPixCheckout(data);
        setCurrentStep("pix");
      } else {
        setCurrentStep("confirmacao");
      }
    },
    onError: (err: any) =>
      setError(err?.message || "Erro desconhecido ao processar o cadastro."),
  });

  const nextStep = () => {
    const steps: Step[] = ["plano", "igreja", "admin", "pagamento"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: Step[] = ["plano", "igreja", "admin", "pagamento"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleFinalSubmit = () => {
    setError(null);
    submitRegistration();
  };

  const stepsConfig = [
    { id: "plano", title: "Plano e Contato" },
    { id: "igreja", title: "Endereço" },
    { id: "admin", title: "Administrador" },
    { id: "pagamento", title: "Pagamento" },
  ];

  const renderStep = () => {
    switch (currentStep) {
      case "plano":
        return (
          <Step1_PlanoContato
            formData={formData}
            setFormData={setFormData}
            nextStep={nextStep}
          />
        );
      case "igreja":
        return (
          <Step2_InfoIgreja
            formData={formData}
            setFormData={setFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case "admin":
        return (
          <Step3_InfoAdmin
            formData={formData}
            setFormData={setFormData}
            nextStep={nextStep}
            prevStep={prevStep}
            handleFinalSubmit={handleFinalSubmit}
            isPending={isPending}
          />
        );
      case "pagamento":
        return (
          <Step4_Pagamento
            formData={formData}
            setFormData={setFormData}
            prevStep={prevStep}
            handleFinalSubmit={handleFinalSubmit}
            isPending={isPending}
          />
        );
      case "confirmacao":
        return <Step5_Confirmacao />;
      case "pix":
        return <Step6_PixPagamento pixCheckout={pixCheckout} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <header className="w-full py-4 px-6 flex justify-center border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Church className="h-6 w-6 text-primary" />
          MyChurch
        </Link>
      </header>

      <main className="flex-1 w-full flex flex-col items-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-3xl mx-auto">
          {["plano", "igreja", "admin", "pagamento"].includes(currentStep) && (
            <StepIndicator steps={stepsConfig} currentStepId={currentStep} />
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
          {error && (
            <p className="text-center text-destructive font-medium mt-4">
              {error}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export default function CadastroPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <CadastroPageContent />
    </QueryClientProvider>
  );
}
