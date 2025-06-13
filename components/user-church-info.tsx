"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getToken, getUser, getChurchId } from "@/lib/auth-utils"
import { getChurchData } from "@/services/church.service"

export function UserChurchInfo() {
  const [userInfo, setUserInfo] = useState<any>(null)
  const [churchInfo, setChurchInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadUserInfo = async () => {
    setIsLoading(true)
    try {
      // Obter informações do usuário
      const user = getUser()
      const churchId = getChurchId()
      const token = getToken()

      let tokenPayload = null
      if (token) {
        try {
          tokenPayload = JSON.parse(atob(token.split(".")[1]))
        } catch (error) {
          console.error("Erro ao decodificar token:", error)
        }
      }

      setUserInfo({
        user,
        churchId,
        tokenPayload,
        hasToken: !!token,
      })

      // Tentar obter dados da igreja
      if (churchId) {
        try {
          const churchData = await getChurchData(churchId)
          setChurchInfo(churchData)
        } catch (error) {
          console.error("Erro ao obter dados da igreja:", error)
          setChurchInfo({ error: error.message })
        }
      }
    } catch (error) {
      console.error("Erro ao carregar informações:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUserInfo()
  }, [])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            👤 Informações do Usuário
            <Badge variant={userInfo?.hasToken ? "default" : "destructive"}>
              {userInfo?.hasToken ? "Autenticado" : "Não Autenticado"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={loadUserInfo} disabled={isLoading} className="mb-4">
            {isLoading ? "Carregando..." : "Atualizar Informações"}
          </Button>

          {userInfo && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Dados do Usuário:</h4>
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                  {JSON.stringify(userInfo.user, null, 2)}
                </pre>
              </div>

              <div>
                <h4 className="font-medium mb-2">Church ID:</h4>
                <Badge variant={userInfo.churchId ? "default" : "destructive"}>
                  {userInfo.churchId || "Não encontrado"}
                </Badge>
              </div>

              <div>
                <h4 className="font-medium mb-2">Token Payload:</h4>
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                  {JSON.stringify(userInfo.tokenPayload, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {churchInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🏛️ Informações da Igreja
              <Badge variant={churchInfo.error ? "destructive" : "default"}>
                {churchInfo.error ? "Erro" : "Carregado"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {churchInfo.error ? (
              <div className="text-red-600">
                <p>Erro: {churchInfo.error}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p>
                  <strong>Nome:</strong> {churchInfo.name}
                </p>
                <p>
                  <strong>ID:</strong> {churchInfo.id}
                </p>
                <p>
                  <strong>Telefone:</strong> {churchInfo.phone}
                </p>
                <p>
                  <strong>Membros:</strong> {churchInfo.members?.length || 0}
                </p>
                <p>
                  <strong>Plano Ativo:</strong> {churchInfo.subscription?.isActive ? "Sim" : "Não"}
                </p>
                {churchInfo.subscription?.plan && (
                  <p>
                    <strong>Plano:</strong> {churchInfo.subscription.plan.name}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
