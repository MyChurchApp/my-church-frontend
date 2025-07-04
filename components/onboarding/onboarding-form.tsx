"use client";

import { useState } from "react";

import { ProgressIndicator } from "./ui-components";
import {
  Step1_Identify,
  Step_Register,
  Step2_Validate,
  Step3_Password,
  Step4_Success,
} from "./onboarding-steps";
import {
  createPassword,
  identifyMember,
  registerUser,
  validateBirthDate,
} from "@/app/onboarding/actions";
import { ArrowLeft } from "lucide-react";

export function OnboardingForm({ churchId }: { churchId: string }) {
  const [step, setStep] = useState<
    "identify" | "register" | "validate" | "password" | "success"
  >("identify");
  const [contextData, setContextData] = useState({
    identifier: "",
    maskedName: "",
    activationHash: "",
  });

  const [loading, setLoading] = useState(false);
  const [identifyState, setIdentifyState] = useState<any | null>(null);
  const [registerState, setRegisterState] = useState<any | null>(null);
  const [validateState, setValidateState] = useState<any | null>(null);
  const [passwordState, setPasswordState] = useState<any | null>(null);

  // 1. Identificar membro
  async function handleIdentify(values: { identifier: string }) {
    setLoading(true);
    const res = await identifyMember({
      identifier: values.identifier,
      churchId,
    });
    setIdentifyState(res);
    setLoading(false);

    if (res.status === "success_found" && res.data?.maskedName) {
      setContextData((prev) => ({
        ...prev,
        identifier: values.identifier,
        maskedName: res.data.maskedName ?? "",
      }));
      setStep("validate");
    } else if (res.status === "success_not_found" && res.data?.identifier) {
      setContextData((prev) => ({
        ...prev,
        identifier: res.data.identifier ?? "",
      }));
      setStep("register");
    }
  }

  // 2. Cadastro completo
  async function handleRegister(form: any) {
    setLoading(true);
    const res = await registerUser(form);
    setRegisterState(res);
    setLoading(false);
    if (res.status === "success_registered") setStep("success");
  }

  // 3. Validar nascimento
  async function handleValidate(values: { birthDate: string }) {
    setLoading(true);
    const res = await validateBirthDate({
      identifier: contextData.identifier,
      birthDate: values.birthDate,
    });
    setValidateState(res);
    setLoading(false);
    if (res.status === "success_validated" && res.data?.activationHash) {
      setContextData((prev) => ({
        ...prev,
        activationHash: res.data.activationHash ?? "",
      }));
      setStep("password");
    }
  }

  // 4. Senha
  async function handlePassword(values: { password: string }) {
    setLoading(true);
    const res = await createPassword({
      activationHash: contextData.activationHash,
      password: values.password,
    });
    setPasswordState(res);
    setLoading(false);
    if (res.status === "success_password_set") setStep("success");
  }

  // Progresso
  const stepFlows: Record<string, { current: number; total: number }> = {
    identify: { current: 1, total: 2 },
    register: { current: 2, total: 2 },
    validate: { current: 2, total: 3 },
    password: { current: 3, total: 3 },
    success: { current: 99, total: 99 },
  };
  const progress = stepFlows[step] || { current: 0, total: 0 };
  const stepsOrder: Array<
    "identify" | "register" | "validate" | "password" | "success"
  > = ["identify", "register", "validate", "password", "success"];
  function handleBackStep() {
    const currentIdx = stepsOrder.indexOf(step);
    if (currentIdx > 0) setStep(stepsOrder[currentIdx - 1]);
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4 font-sans">
      <div className="w-full max-w-md">
        {step !== "identify" && step !== "success" && (
          <button
            onClick={handleBackStep}
            type="button"
            className="mb-4 flex items-center gap-2 text-blue-700 hover:underline"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
        )}
        {progress.current <= progress.total && (
          <ProgressIndicator
            currentStep={progress.current}
            totalSteps={progress.total}
          />
        )}
        {/* Render Step */}
        {step === "identify" && (
          <Step1_Identify
            onSubmit={handleIdentify}
            state={identifyState}
            churchId={churchId}
            loading={loading}
          />
        )}
        {step === "register" && (
          <Step_Register
            onSubmit={handleRegister}
            state={registerState}
            churchId={churchId}
            cpf={contextData.identifier}
            loading={loading}
          />
        )}
        {step === "validate" && (
          <Step2_Validate
            onSubmit={handleValidate}
            state={validateState}
            identifier={contextData.identifier}
            loading={loading}
          />
        )}
        {step === "password" && (
          <Step3_Password
            onSubmit={handlePassword}
            state={passwordState}
            activationHash={contextData.activationHash}
            loading={loading}
          />
        )}
        {step === "success" && <Step4_Success />}
      </div>
    </div>
  );
}
