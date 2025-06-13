"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getToken } from "@/lib/auth-utils"

export function BearerTokenTest() {
  const [testToken, setTestToken] = useState("")
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testBearerFormat = async () => {
    setIsLoading(true)

    const token = testToken || getToken()
    if (!token) {
      setTestResult({
        error: "Nenhum token fornecido ou encontrado no localStorage",
        status: "❌ FAIL",
      })
      setIsLoading(false)
      return
    }

    // Testar diferentes formatos
    const tests = {
      originalToken: token,
      hasBearer: token.toLowerCase().startsWith("bearer "),
      correctFormat: token.startsWith("Bearer "),
      tokenLength: token.length,
    }

    // Formatar corretamente
    let formattedToken: string
    const cleanToken = token.trim()

    if (cleanToken.toLowerCase().startsWith("bearer ")) {
      formattedToken = cleanToken
    } else {
      formattedToken = `Bearer ${cleanToken}`
    }

    tests.formattedToken = formattedToken
    tests.finalFormat = formattedToken.startsWith("Bearer ")

    // Testar a requisição real
    try {
      const response = await fetch("https://demoapp.top1soft.com.br/api/Church/29", {
        method: "GET",
        headers: {
          Authorization: formattedToken,
          "Content-Type": "application/json",
          Accept: "*/*",
        },
      })

      tests.apiResponse = {
        status: response.status,
        statusText: response.statusText,
        success: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      }

      if (response.ok) {
        const data = await response.json()
        tests.apiData = {
          churchName: data.name,
          churchId: data.id,
          membersCount: data.members?.length || 0,
        }
      } else {
        const errorText = await response.text()
        tests.apiError = errorText
      }
    } catch (error) {
      tests.apiResponse = {
        error: error.message,
        success: false,
      }
    }

    setTestResult(tests)
    setIsLoading(false)
  }

  const currentToken = getToken()

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔐 Teste Bearer Token Format
          <Badge variant={currentToken ? "default" : "destructive"}>
            {currentToken ? "Token Presente" : "Sem Token"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-token">Token para Teste (deixe vazio para usar o do localStorage)</Label>
          <Input
            id="test-token"
            value={testToken}
            onChange={(e) => setTestToken(e.target.value)}
            placeholder="Cole seu token aqui ou deixe vazio"
            type="password"
          />
        </div>

        <div className="space-y-2">
          <Label>Token Atual no localStorage:</Label>
          <div className="p-2 bg-gray-100 rounded text-sm font-mono">
            {currentToken ? `${currentToken.substring(0, 50)}...` : "Nenhum token encontrado"}
          </div>
        </div>

        <Button onClick={testBearerFormat} disabled={isLoading}>
          {isLoading ? "Testando..." : "Testar Formato Bearer"}
        </Button>

        {testResult && (
          <div className="space-y-4">
            <Card className="p-4">
              <h4 className="font-medium mb-2">Análise do Token</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Token Original:</span>
                  <Badge variant={testResult.originalToken ? "default" : "destructive"}>
                    {testResult.originalToken ? "✅ Presente" : "❌ Ausente"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Tem "bearer" (case insensitive):</span>
                  <Badge variant={testResult.hasBearer ? "default" : "secondary"}>
                    {testResult.hasBearer ? "✅ Sim" : "❌ Não"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Formato correto "Bearer ":</span>
                  <Badge variant={testResult.correctFormat ? "default" : "secondary"}>
                    {testResult.correctFormat ? "✅ Sim" : "❌ Não"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Tamanho do token:</span>
                  <span>{testResult.tokenLength} caracteres</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="font-medium mb-2">Token Formatado</h4>
              <div className="p-2 bg-gray-100 rounded text-sm font-mono break-all">{testResult.formattedToken}</div>
              <div className="mt-2">
                <Badge variant={testResult.finalFormat ? "default" : "destructive"}>
                  {testResult.finalFormat ? "✅ Formato Correto" : "❌ Formato Incorreto"}
                </Badge>
              </div>
            </Card>

            {testResult.apiResponse && (
              <Card className="p-4">
                <h4 className="font-medium mb-2">Resposta da API</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge variant={testResult.apiResponse.success ? "default" : "destructive"}>
                      {testResult.apiResponse.status} - {testResult.apiResponse.statusText}
                    </Badge>
                  </div>
                  {testResult.apiData && (
                    <div className="space-y-1">
                      <div>
                        <strong>Igreja:</strong> {testResult.apiData.churchName}
                      </div>
                      <div>
                        <strong>ID:</strong> {testResult.apiData.churchId}
                      </div>
                      <div>
                        <strong>Membros:</strong> {testResult.apiData.membersCount}
                      </div>
                    </div>
                  )}
                  {testResult.apiError && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                      <strong>Erro:</strong> {testResult.apiError}
                    </div>
                  )}
                </div>
              </Card>
            )}

            <Card className="p-4">
              <h4 className="font-medium mb-2">Resultado Completo</h4>
              <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-64">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
