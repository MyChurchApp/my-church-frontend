// Função para testar autenticação e debug

export async function testAuthToken() {
  // Verificar se o token existe
  const token = localStorage.getItem("authToken");

  // Verificar formato do header
  const authHeader = `Bearer ${token}`;

  // Testar requisição simples
  try {
    const response = await fetch(
      "https://demoapp.top1soft.com.br/api/CashFlow/categories",
      {
        method: "GET",
        headers: {
          Accept: "text/plain",
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.text();

      try {
        const parsed = JSON.parse(data);

        return parsed;
      } catch (e) {
        return data;
      }
    } else {
      const errorText = await response.text();
      console.error("❌ Erro na resposta:", errorText);
      throw new Error(`${response.status}: ${errorText}`);
    }
  } catch (error) {
    console.error("❌ Erro na requisição:", error);
    throw error;
  }
}

// Função para verificar se o token está válido
export function validateToken() {
  const token = localStorage.getItem("authToken");

  if (!token) {
    console.error("❌ Token não encontrado");
    return false;
  }

  try {
    // Decodificar JWT para verificar expiração
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Math.floor(Date.now() / 1000);

    return payload.exp > now;
  } catch (error) {
    console.error("❌ Erro ao validar token:", error);
    return false;
  }
}
