"use client"

import { useState } from "react"
import MemberRegistrationModal from "@/components/member-registration-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Key } from "lucide-react"

export default function ExemploUso() {
  const [token, setToken] = useState("")
  const [tokenSaved, setTokenSaved] = useState(false)

  const handleSaveToken = () => {
    if (token.trim()) {
      localStorage.setItem("authToken", token.trim())
      setTokenSaved(true)
    }
  }

  const handleMemberCreated = (member: any) => {
    console.log("Membro criado:", member)
    // Aqui você pode atualizar a lista de membros, mostrar notificação, etc.
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center">Sistema de Cadastro de Membros</h1>

        {/* Card para configurar token */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Configuração de Autenticação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">Token Bearer</Label>
              <Input
                id="token"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Cole seu token Bearer aqui"
              />
            </div>
            <Button onClick={handleSaveToken} disabled={!token.trim()}>
              Salvar Token
            </Button>

            {tokenSaved && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">
                  Token salvo com sucesso! Agora você pode cadastrar membros.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Card principal */}
        <Card>
          <CardHeader>
            <CardTitle>Gerenciamento de Membros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <p className="text-gray-600">Use o botão abaixo para cadastrar um novo membro na igreja.</p>

              <MemberRegistrationModal onMemberCreated={handleMemberCreated} />
            </div>
          </CardContent>
        </Card>

        {/* Informações da API */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da API</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <strong>Endpoint:</strong> https://demoapp.top1soft.com.br/api/Member
            </p>
            <p>
              <strong>Método:</strong> POST
            </p>
            <p>
              <strong>Autenticação:</strong> Bearer Token
            </p>
            <p>
              <strong>Content-Type:</strong> application/json
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
