"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getToken, getUser, isAuthenticated } from "@/lib/auth-utils"
import { getChurchData } from "@/services/church.service"
import { authFetch } from "@/lib/auth-fetch"

export function AuthTest() {
  const [testResults, setTestResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runAuthTests = async () => {
    setIsLoading(true)
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: {},
    }

    try {
      // Teste 1: Verificar se está autenticado
      results.tests.isAuthenticated = {
        result: isAuthenticated(),
        status: isAuthenticated() ? "✅ PASS" : "❌ FAIL",
      }

      // Teste 2: Verificar token
      const token = getToken()
      results.tests.tokenExists = {
        result: !!token,
        tokenLength: token?.length || 0,
        status: token ? "✅ PASS" : "❌ FAIL",
      }

      // Teste 3: Decodificar token
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]))
          results.tests.tokenDecode = {
            result: payload,
            churchId: payload.churchId,
            userId: payload.nameid || payload.sub,
            exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : null,
            status: "✅ PASS",
          }
        } catch (error) {
          results.tests.tokenDecode = {
            error: error.message,
            status: "❌ FAIL",
          }
        }
      }

      // Teste 4: Verificar usuário
      const user = getUser()
      results.tests.userData = {
        result: user,
        status: user ? "✅ PASS" : "❌ FAIL",
      }

      // Teste 5: Testar requisição simples
      try {
        const response = await authFetch("https://demoapp.top1soft.com.br/api/Church/29")
        results.tests.apiRequest = {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          result: response.status === 200 ? "✅ PASS" : `❌ FAIL (${response.status})`,
        }

        if (response.ok) {
          const data = await response.json()
          results.tests.apiData = {
            churchName: data.name,
            membersCount: data.members?.length || 0,
            status: "✅ PASS",
          }
        }
      } catch (error) {
        results.tests.apiRequest = {
          error: error.message,
          status: "❌ FAIL",
        }
      }

      // Teste 6: Testar service
      try {
        const churchData = await getChurchData()
        results.tests.churchService = {
          churchName: churchData.name,
          churchId: churchData.id,
          membersCount: churchData.members?.length || 0,
          status: "✅ PASS",
        }
      } catch (error) {
        results.tests.churchService = {
          error: error.message,
          status: "❌ FAIL",
        }
      }
    } catch (error) {
      results.error = error.message
    }

    setTestResults(results)
    setIsLoading(false)
  }

  const clearStorage = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userRole")
    localStorage.removeItem("user")
    setTestResults(null)
    alert("Storage limpo! Faça login novamente.")
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔐 Teste de Autenticação
          <Badge variant={isAuthenticated() ? "default" : "destructive"}>
            {isAuthenticated() ? "Autenticado" : "Não Autenticado"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runAuthTests} disabled={isLoading}>
            {isLoading ? "Testando..." : "Executar Testes"}
          </Button>
          <Button variant="outline" onClick={clearStorage}>
            Limpar Storage
          </Button>
        </div>

        {testResults && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(testResults.tests).map(([testName, testData]: [string, any]) => (
                <Card key={testName} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{testName}</h4>
                    <Badge variant={testData.status.includes("✅") ? "default" : "destructive"}>
                      {testData.status}
                    </Badge>
                  </div>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(testData, null, 2)}
                  </pre>
                </Card>
              ))}
            </div>

            <Card className="p-4">
              <h4 className="font-medium mb-2">Resultado Completo</h4>
              <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-64">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
