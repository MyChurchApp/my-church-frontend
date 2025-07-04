import { z } from "zod";

// (Opcional) Interface para o retorno
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

// NOVO: Interface para o retorno da API de CEP
export interface CepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

const API_BASE_URL = "https://demoapp.top1soft.com.br/api/Onboarding";

// NOVO: Função para buscar o CEP
export async function searchCep(cep: string): Promise<CepResponse> {
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  if (!response.ok) {
    throw new Error("Erro ao buscar o CEP.");
  }
  return response.json();
}

// IDENTIFICAR MEMBRO
export async function identifyMember({
  identifier,
  churchId,
}: {
  identifier: string;
  churchId: string;
}): Promise<FormState> {
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
  } catch {
    return {
      status: "error",
      message: "Falha na conexão.",
      data: {},
    };
  }
}

// REGISTRAR USUÁRIO

export async function registerUser(form: any): Promise<FormState> {
  const RegisterSchema = z.object({
    churchId: z.string(),
    name: z.string().min(3, "Nome completo é obrigatório"),
    email: z.string().email("Email inválido"),
    phoneNumber: z.string().min(10, "Telefone inválido"),
    cpf: z.string(),
    birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
    maritalStatus: z.string(),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    street: z.string().min(1, "Rua é obrigatória"),
    number: z.string().min(1, "Número é obrigatório"),
    city: z.string().min(1, "Cidade é obrigatória"),
    state: z.string().min(1, "Estado é obrigatório"),
    zipCode: z.string().min(1, "CEP é obrigatório"),
    country: z.string().min(1, "País é obrigatório"),
    neighborhood: z.string().min(1, "Bairro é obrigatório"),
  });

  const parsed = RegisterSchema.safeParse(form);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0].message,
      data: {},
    };
  }

  // Formatar birthDate para padrão ISO completo
  let birthDate = parsed.data.birthDate;
  if (!birthDate.includes("T")) {
    birthDate += "T00:00:00.000Z";
  }

  // Junta a rua e o número para o payload da API
  const streetAddress = `${parsed.data.street}, ${parsed.data.number}`;

  const payload = {
    churchId: Number(parsed.data.churchId),
    name: parsed.data.name,
    email: parsed.data.email,
    phoneNumber: parsed.data.phoneNumber,
    cpf: parsed.data.cpf,
    birthDate,
    maritalStatus: parsed.data.maritalStatus,
    password: parsed.data.password,
    address: {
      street: streetAddress, // Envia rua e número concatenados
      city: parsed.data.city,
      state: parsed.data.state,
      zipCode: parsed.data.zipCode,
      country: parsed.data.country,
      neighborhood: parsed.data.neighborhood,
    },
  };

  try {
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
      const errorMessage =
        errorData.errors?.User?.[0] ||
        errorData.errors?.[Object.keys(errorData.errors)[0]]?.[0] ||
        "Não foi possível realizar o cadastro.";

      return {
        status: "error",
        message: errorMessage,
        data: {},
      };
    }
  } catch {
    return {
      status: "error",
      message: "Falha na conexão.",
      data: {},
    };
  }
}
// VALIDAR DATA DE NASCIMENTO
export async function validateBirthDate({
  identifier,
  birthDate,
}: {
  identifier: string;
  birthDate: string;
}) {
  try {
    const response = await fetch(
      "https://demoapp.top1soft.com.br/api/Onboarding/activate/validate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, birthDate }),
      }
    );
    const data = await response.json();
    if (response.ok) {
      return {
        status: "success_validated",
        message: "",
        data: { activationHash: data.hash ?? "" },
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
export async function createPassword({
  password,
  activationHash,
}: {
  password: string;
  activationHash: string;
}): Promise<FormState> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/activate/password/${activationHash}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
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
  } catch {
    return {
      status: "error",
      message: "Falha na conexão. Tente novamente.",
      data: {},
    };
  }
}
