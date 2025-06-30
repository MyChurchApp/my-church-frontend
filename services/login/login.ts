interface LoginPayload {
  identifier: string;
  password: string;
}

interface AuthResponse {
  token: {
    token: string;
    role: string;
    member?: {
      id?: string;
      name?: string;
      email?: string;
      phone?: string;
      photo?: string;
      churchId?: string;
      isBaptized?: boolean;
      isTither?: boolean;
      isActive?: boolean;
    };
  };
  message?: string;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await fetch(
    "https://demoapp.top1soft.com.br/api/Auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      throw new Error(
        "Credenciais inválidas. Verifique seu CPF/Email e senha."
      );
    }
    throw new Error(
      errorData.message || "Erro no login: Credenciais inválidas."
    );
  }

  return response.json();
}
