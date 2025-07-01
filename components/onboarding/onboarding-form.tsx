"use client";

import { KeyRound, PartyPopper, UserCheck } from "lucide-react";
import { StepContainer, SubmitButton } from "./ui-components";
import { useActionState, useEffect, useState } from "react";
import {
  createPassword,
  identifyMember,
  validateBirthDate,
} from "@/app/onboarding/actions";

interface FormState {
  status: "idle" | "success" | "error";
  message: string;
  data: {
    maskedName: string;
    activationHash: string;
  };
}

const initialState: FormState = {
  status: "idle",
  message: "",
  data: {
    maskedName: "",
    activationHash: "",
  },
};

export function OnboardingForm({ churchId }: { churchId: string }) {
  const [step, setStep] = useState(1);
  const [contextData, setContextData] = useState<{
    maskedName: string;
    activationHash: string;
  }>({
    maskedName: "",
    activationHash: "",
  });

  const [identifyState, identifyAction] = useActionState(
    identifyMember,
    initialState
  );
  const [validateState, validateAction] = useActionState(
    validateBirthDate,
    initialState
  );
  const [passwordState, passwordAction] = useActionState(
    createPassword,
    initialState
  );

  useEffect(() => {
    if (identifyState.status === "success" && identifyState.data) {
      setContextData((prev) => ({
        ...prev,
        maskedName: identifyState.data.maskedName,
      }));
      setStep(2);
    }
  }, [identifyState]);

  useEffect(() => {
    if (validateState.status === "success" && validateState.data) {
      setContextData((prev) => ({
        ...prev,
        activationHash: validateState.data.activationHash,
      }));
      setStep(3);
    }
  }, [validateState]);

  useEffect(() => {
    if (passwordState.status === "success") {
      setStep(4);
    }
  }, [passwordState]);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <StepContainer title="Identificação" icon={<UserCheck />}>
            <p className="mb-6 text-center text-gray-600">
              Digite seu CPF para iniciar o cadastro.
            </p>
            <form action={identifyAction} className="space-y-4">
              <input type="hidden" name="churchId" value={churchId} />
              <input
                type="text"
                name="identifier"
                placeholder="Seu CPF"
                className="input-style"
                required
              />
              <SubmitButton label="Continuar" />
              {identifyState.status === "error" && (
                <p className="error-message">{identifyState.message}</p>
              )}
            </form>
          </StepContainer>
        );
      case 2:
        return (
          <StepContainer
            title={`Olá, ${contextData.maskedName}!`}
            icon={<UserCheck />}
          >
            <p className="mb-6 text-center text-gray-600">
              Para confirmar, informe sua data de nascimento.
            </p>
            <form action={validateAction} className="space-y-4">
              <input
                type="hidden"
                name="maskedName"
                value={contextData.maskedName}
              />
              <input
                type="date"
                name="birthDate"
                className="input-style"
                required
              />
              <SubmitButton label="Validar" />
              {validateState.status === "error" && (
                <p className="error-message">{validateState.message}</p>
              )}
            </form>
          </StepContainer>
        );
      case 3:
        return (
          <StepContainer title="Crie sua Senha" icon={<KeyRound />}>
            <p className="mb-6 text-center text-gray-600">
              Escolha uma senha segura para o aplicativo.
            </p>
            <form action={passwordAction} className="space-y-4">
              <input
                type="hidden"
                name="activationHash"
                value={contextData.activationHash}
              />
              <input
                type="password"
                name="password"
                placeholder="Senha"
                className="input-style"
                required
              />
              <SubmitButton label="Finalizar Cadastro" />
              {passwordState.status === "error" && (
                <p className="error-message">{passwordState.message}</p>
              )}
            </form>
          </StepContainer>
        );
      case 4:
        return (
          <StepContainer
            title="Cadastro Concluído!"
            icon={<PartyPopper className="text-green-500" />}
          >
            <p className="mb-6 text-center text-gray-600">
              Seja bem-vindo(a)! Seu acesso foi liberado.
            </p>
            <button
              onClick={() => {
                window.location.href = "/login";
              }}
              className="button-primary"
            >
              Ir para o Login
            </button>
          </StepContainer>
        );
      default:
        return <p>Página não encontrada.</p>;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md">{renderStep()}</div>
    </div>
  );
}
