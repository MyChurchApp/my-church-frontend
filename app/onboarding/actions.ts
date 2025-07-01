"use server";

import { z } from "zod";

// Tipagem para o estado do formulário, que será compartilhado entre servidor e cliente.
interface FormState {
  status: "idle" | "success" | "error";
  message: string;
  data: {
    maskedName: string; // sempre string, nunca undefined
    activationHash: string; // sempre string, nunca undefined
  };
}

const API_BASE_URL = "https://demoapp.top1soft.com.br/api/Onboarding";

// Ação para o Passo 1: Identificação
export async function identifyMember(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const schema = z.object({
    identifier: z.string().min(1, "Identificador é obrigatório"),
    churchId: z.string().min(1),
  });

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Dados inválidos.",
      data: { maskedName: "", activationHash: "" },
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/identify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    const data = await response.json();

    if (response.ok && data.status !== "NotFound") {
      return {
        status: "success",
        message: "",
        data: {
          maskedName: data.maskedName ?? "",
          activationHash: "", // só existe no passo 2
        },
      };
    } else {
      return {
        status: "error",
        message: "CPF ou identificador não encontrado.",
        data: { maskedName: "", activationHash: "" },
      };
    }
  } catch (error) {
    return {
      status: "error",
      message: "Falha na conexão. Tente novamente.",
      data: { maskedName: "", activationHash: "" },
    };
  }
}

// Ação para o Passo 2: Validação da Data de Nascimento
export async function validateBirthDate(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const schema = z.object({
    maskedName: z.string().min(1),
    birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  });

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Dados inválidos.",
      data: { maskedName: "", activationHash: "" },
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/activate/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: parsed.data.maskedName,
        birthDate: parsed.data.birthDate,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        status: "success",
        message: "",
        data: {
          maskedName: "",
          activationHash: data.hash ?? "",
        },
      };
    } else {
      return {
        status: "error",
        message: data.errors?.Member?.[0] || "Data de nascimento inválida.",
        data: { maskedName: "", activationHash: "" },
      };
    }
  } catch (error) {
    return {
      status: "error",
      message: "Falha na conexão. Tente novamente.",
      data: { maskedName: "", activationHash: "" },
    };
  }
}

// Ação para o Passo 3: Criação da Senha
export async function createPassword(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const schema = z.object({
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
    activationHash: z.string().min(1),
  });

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0].message,
      data: { maskedName: "", activationHash: "" },
    };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/activate/password/${parsed.data.activationHash}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: parsed.data.password }),
      }
    );

    if (response.ok) {
      return {
        status: "success",
        message: "Cadastro finalizado!",
        data: { maskedName: "", activationHash: "" },
      };
    } else {
      return {
        status: "error",
        message: "Não foi possível definir a senha.",
        data: { maskedName: "", activationHash: "" },
      };
    }
  } catch (error) {
    return {
      status: "error",
      message: "Falha na conexão. Tente novamente.",
      data: { maskedName: "", activationHash: "" },
    };
  }
}
