// Funções de debug para testar a API

import { getAuthToken } from "@/lib/auth-utils"

const API_BASE_URL = "https://demoapp.top1soft.com.br/api"

/**
 * Testa a criação de categoria com diferentes payloads
 */
export async function testCategoryCreation(): Promise<void> {
  const token = getAuthToken()
  if (!token) {
    console.error("❌ Token não encontrado")
    return
  }

  console.log("🧪 Testando criação de categoria com diferentes payloads...")

  // Teste 1: Payload básico
  const payload1 = {
    name: "Teste API 1",
    description: "Categoria de teste 1",
    type: 0,
  }

  // Teste 2: Payload com churchId
  const payload2 = {
    name: "Teste API 2",
    description: "Categoria de teste 2",
    type: 0,
    churchId: 0,
  }

  // Teste 3: Payload com type como string
  const payload3 = {
    name: "Teste API 3",
    description: "Categoria de teste 3",
    type: "0",
  }

  // Executar os testes
  await testPayload("Teste 1", payload1)
  await testPayload("Teste 2", payload2)
  await testPayload("Teste 3", payload3)
}

/**
 * Testa um payload específico
 */
async function testPayload(testName: string, payload: any): Promise<void> {
  console.log(`🧪 ${testName}: Enviando payload:`, payload)

  try {
    const response = await fetch(`${API_BASE_URL}/CashFlow/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(payload),
    })

    console.log(`🧪 ${testName}: Status: ${response.status}`)

    if (response.ok) {
      const data = await response.json()
      console.log(`✅ ${testName}: Sucesso!`, data)
    } else {
      let errorText = ""
      try {
        const errorData = await response.json()
        errorText = JSON.stringify(errorData)
        console.error(`❌ ${testName}: Erro detalhado:`, errorData)
      } catch (e) {
        errorText = await response.text()
        console.error(`❌ ${testName}: Texto do erro:`, errorText)
      }
      console.error(`❌ ${testName}: Falha - ${response.status} - ${errorText}`)
    }
  } catch (error) {
    console.error(`❌ ${testName}: Exceção:`, error)
  }
}

/**
 * Obtém detalhes da API para entender a estrutura esperada
 */
export async function getApiDetails(): Promise<void> {
  const token = getAuthToken()
  if (!token) {
    console.error("❌ Token não encontrado")
    return
  }

  console.log("🔍 Obtendo detalhes da API...")

  try {
    // Buscar categorias existentes
    const response = await fetch(`${API_BASE_URL}/CashFlow/categories`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      const categories = await response.json()
      console.log("✅ Categorias existentes:", categories)

      if (categories.length > 0) {
        console.log("📋 Estrutura de uma categoria:", categories[0])
        console.log("🔑 Propriedades:", Object.keys(categories[0]))
      }
    } else {
      console.error("❌ Erro ao buscar categorias:", response.status)
    }

    // Buscar detalhes da API
    const swaggerResponse = await fetch(`${API_BASE_URL}/swagger/v1/swagger.json`, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (swaggerResponse.ok) {
      const swagger = await swaggerResponse.json()
      console.log("✅ Swagger da API:", swagger)

      // Buscar definições de modelos
      if (swagger.definitions && swagger.definitions["CreateCategoryCommand"]) {
        console.log("📋 Definição de CreateCategoryCommand:", swagger.definitions["CreateCategoryCommand"])
      }
    } else {
      console.error("❌ Erro ao buscar swagger:", swaggerResponse.status)
    }
  } catch (error) {
    console.error("❌ Erro ao obter detalhes da API:", error)
  }
}
