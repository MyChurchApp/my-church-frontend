"use server";

import { z } from "zod";

export interface FormState {
  status:
    | "idle"
    | "success_found"
    | "success_not_found"
    | "success_registered"
    | "success_validated"
    | "success_password_set"
    | "error";
  message: string;
  data: {
    identifier?: string;
    maskedName?: string;
    activationHash?: string;
  };
}

const API_BASE_URL = "https://demoapp.top1soft.com.br/api/Onboarding";

// Função utilitária para sempre retornar um JSON
const toJson = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
};

// IDENTIFICAR MEMBRO
export async function identifyMember(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const identifier = formData.get("identifier") as string;
  const churchId = formData.get("churchId") as string;

  try {
    const response = await fetch(`${API_BASE_URL}/identify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, churchId }),
    });

    const data = await response.json();

    if (response.ok && data.status !== "NotFound" && data.maskedName) {
      return {
        status: "success_found",
        message: "",
        data: { maskedName: data.maskedName },
      };
    } else {
      return {
        status: "success_not_found",
        message: "CPF não encontrado.",
        data: { identifier },
      };
    }
  } catch (error) {
    return {
      status: "error",
      message: "Falha na conexão.",
      data: {},
    };
  }
}

// REGISTRAR USUÁRIO
export async function registerUser(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const RegisterSchema = z.object({
    churchId: z.string().transform(Number),
    name: z.string().min(3, "Nome completo é obrigatório"),
    email: z.string().email("Email inválido"),
    phoneNumber: z.string().min(10, "Telefone inválido"),
    cpf: z.string(),
    birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    street: z.string().min(1, "Rua é obrigatória"),
    city: z.string().min(1, "Cidade é obrigatória"),
    state: z.string().min(1, "Estado é obrigatório"),
    zipCode: z.string().min(1, "CEP é obrigatório"),
    country: z.string().min(1, "País é obrigatório"),
    neighborhood: z.string().min(1, "Bairro é obrigatório"),
  });

  const parsed = RegisterSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0].message,
      data: {},
    };
  }

  try {
    const { street, city, state, zipCode, country, neighborhood, ...rest } =
      parsed.data;
    const payload = {
      ...rest,
      address: { street, city, state, zipCode, country, neighborhood },
    };

    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return {
        status: "success_registered",
        message: "Cadastro realizado!",
        data: {},
      };
    } else {
      const errorData = await response.json();
      return {
        status: "error",
        message: errorData.errors || "Não foi possível realizar o cadastro.",
        data: {},
      };
    }
  } catch (error) {
    return {
      status: "error",
      message: "Falha na conexão.",
      data: {},
    };
  }
}

// VALIDAR DATA DE NASCIMENTO
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
      data: {},
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
        status: "success_validated",
        message: "",
        data: {
          activationHash: data.hash ?? "",
        },
      };
    } else {
      return {
        status: "error",
        message: data.errors?.Member?.[0] || "Data de nascimento inválida.",
        data: {},
      };
    }
  } catch (error) {
    return {
      status: "error",
      message: "Falha na conexão. Tente novamente.",
      data: {},
    };
  }
}

// CRIAR SENHA
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
      data: {},
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
        status: "success_password_set",
        message: "Senha definida!",
        data: {},
      };
    } else {
      return {
        status: "error",
        message: "Não foi possível definir a senha.",
        data: {},
      };
    }
  } catch (error) {
    return {
      status: "error",
      message: "Falha na conexão. Tente novamente.",
      data: {},
    };
  }
}
