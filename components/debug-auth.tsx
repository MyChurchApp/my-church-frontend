"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getToken, getUser } from "@/lib/auth-utils"
import { getChurchData } from "@/services/church.service"

export function DebugAuth() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testAuth = async () => {
    setIsLoading(true)
    try {
      const token = getToken()
      const user = getUser()

      console.log("🔍 Debug Auth - Token:", !!token)
      console.log("🔍 Debug Auth - User:", user)

      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]))
          console.log("🔍 Debug Auth - Token Payload:", payload)

          setDebugInfo({
            hasToken: !!token,
            tokenLength: token?.length || 0,
            user: user,
            tokenPayload: payload,
            churchId: payload.churchId || user?.churchId,
          })
        } catch (error) {
          console.error("Erro ao decodificar token:", error)
          setDebugInfo({
            hasToken: !!token,
            tokenLength: token?.length || 0,
            user: user,
            error: "Erro ao decodificar token",
          })
        }
      } else {
        setDebugInfo({
          hasToken: false,
          error: "Token não encontrado",
        })
      }
    } catch (error) {
      console.error("Erro no debug:", error)
      setDebugInfo({
        error: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testChurchAPI = async () => {
    setIsLoading(true)
    try {
      console.log("🔍 Testando API da Igreja...")
      const churchData = await getChurchData()
      console.log("✅ Dados da igreja recebidos:", churchData)

      setDebugInfo((prev) => ({
        ...prev,
        churchData: churchData,
        apiSuccess: true,
      }))
    } catch (error) {
      console.error("❌ Erro na API da Igreja:", error)
      setDebugInfo((prev) => ({
        ...prev,
        apiError: error.message,
        apiSuccess: false,
      }))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Debug de Autenticação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testAuth} disabled={isLoading}>
            Testar Auth
          </Button>
          <Button onClick={testChurchAPI} disabled={isLoading}>
            Testar API Igreja
          </Button>
        </div>

        {debugInfo && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <pre className="text-sm overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
