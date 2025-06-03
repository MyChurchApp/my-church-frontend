// Função para testar autenticação e debug

export async function testAuthToken() {
  console.log("🧪 === TESTE DE AUTENTICAÇÃO ===")

  // Verificar se o token existe
  const token = localStorage.getItem("authToken")
  console.log("🔑 Token existe?", !!token)
  console.log("🔑 Token length:", token?.length || 0)
  console.log("🔑 Token preview:", token?.substring(0, 20) + "...")

  // Verificar formato do header
  const authHeader = `Bearer ${token}`
  console.log("📋 Authorization header:", authHeader)
  console.log("📋 Header length:", authHeader.length)

  // Testar requisição simples
  try {
    console.log("🔄 Testando requisição para categorias...")

    const response = await fetch("https://demoapp.top1soft.com.br/api/CashFlow/categories", {
      method: "GET",
      headers: {
        Accept: "text/plain",
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    })

    console.log("📊 Status da resposta:", response.status)
    console.log("📋 Headers da resposta:", Object.fromEntries(response.headers.entries()))

    if (response.ok) {
      const data = await response.text()
      console.log("✅ Dados recebidos:", data)

      try {
        const parsed = JSON.parse(data)
        console.log("✅ JSON parseado:", parsed)
        return parsed
      } catch (e) {
        console.log("📝 Resposta em texto:", data)
        return data
      }
    } else {
      const errorText = await response.text()
      console.error("❌ Erro na resposta:", errorText)
      throw new Error(`${response.status}: ${errorText}`)
    }
  } catch (error) {
    console.error("❌ Erro na requisição:", error)
    throw error
  }
}

// Função para verificar se o token está válido
export function validateToken() {
  const token = localStorage.getItem("authToken")

  if (!token) {
    console.error("❌ Token não encontrado")
    return false
  }

  try {
    // Decodificar JWT para verificar expiração
    const payload = JSON.parse(atob(token.split(".")[1]))
    const now = Math.floor(Date.now() / 1000)

    console.log("🕐 Token exp:", payload.exp)
    console.log("🕐 Agora:", now)
    console.log("🕐 Token válido?", payload.exp > now)

    return payload.exp > now
  } catch (error) {
    console.error("❌ Erro ao validar token:", error)
    return false
  }
}
