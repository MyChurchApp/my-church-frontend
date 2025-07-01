"use client";

import { useActionState, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  createPassword,
  identifyMember,
  registerUser,
  validateBirthDate,
  type FormState,
} from "@/app/onboarding/actions";
import { ProgressIndicator } from "./ui-components";
import {
  Step1_Identify,
  Step_Register,
  Step2_Validate,
  Step3_Password,
  Step4_Success,
} from "./onboarding-steps";

const initialState: FormState = {
  status: "idle",
  message: "",
  data: {},
};

export function OnboardingForm({ churchId }: { churchId: string }) {
  const [step, setStep] = useState<
    "identify" | "register" | "validate" | "password" | "success"
  >("identify");
  const [contextData, setContextData] = useState<{
    identifier: string;
    maskedName: string;
    activationHash: string;
  }>({
    identifier: "",
    maskedName: "",
    activationHash: "",
  });

  const [identifyState, identifyAction] = useActionState(
    identifyMember,
    initialState
  );
  const [registerState, registerAction] = useActionState(
    registerUser,
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
    if (
      identifyState.status === "success_found" &&
      identifyState.data &&
      identifyState.data.maskedName
    ) {
      setContextData((prev) => ({
        ...prev,
        maskedName: identifyState.data.maskedName || "",
      }));
      setStep("validate");
    }
    if (
      identifyState.status === "success_not_found" &&
      identifyState.data &&
      identifyState.data.identifier
    ) {
      setContextData((prev) => ({
        ...prev,
        identifier: identifyState.data.identifier || "",
      }));
      setStep("register");
    }
  }, [identifyState]);

  useEffect(() => {
    if (registerState.status === "success_registered") {
      setStep("success");
    }
  }, [registerState]);

  useEffect(() => {
    if (
      validateState.status === "success_validated" &&
      validateState.data &&
      validateState.data.activationHash
    ) {
      setContextData((prev) => ({
        ...prev,
        activationHash: validateState.data.activationHash || "",
      }));
      setStep("password");
    }
  }, [validateState]);

  useEffect(() => {
    if (passwordState.status === "success_password_set") {
      setStep("success");
    }
  }, [passwordState]);

  const stepFlows: Record<string, { current: number; total: number }> = {
    identify: { current: 1, total: 2 },
    register: { current: 2, total: 2 },
    validate: { current: 2, total: 3 },
    password: { current: 3, total: 3 },
    success: { current: 99, total: 99 },
  };
  const progress = stepFlows[step] || { current: 0, total: 0 };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4 font-sans">
      <div className="w-full max-w-md">
        {progress.current <= progress.total && (
          <ProgressIndicator
            currentStep={progress.current}
            totalSteps={progress.total}
          />
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {step === "identify" && (
              <Step1_Identify
                action={identifyAction}
                state={identifyState}
                churchId={churchId}
              />
            )}
            {step === "register" && (
              <Step_Register
                action={registerAction}
                state={registerState}
                churchId={churchId}
                cpf={contextData.identifier}
              />
            )}
            {step === "validate" && (
              <Step2_Validate
                action={validateAction}
                state={validateState}
                maskedName={contextData.maskedName}
              />
            )}
            {step === "password" && (
              <Step3_Password
                action={passwordAction}
                state={passwordState}
                activationHash={contextData.activationHash}
              />
            )}
            {step === "success" && <Step4_Success />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
