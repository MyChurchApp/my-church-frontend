"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Bug } from "lucide-react"

export default function DebugMemberModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<string[]>([])

  const getAuthToken = () => {
    if (typeof window === "undefined") return null
    return localStorage.getItem("authToken")
  }

  const testPayload = async (description: string, payload: any) => {
    const token = getAuthToken()

    if (!token) {
      return `❌ ${description}: Token não encontrado`
    }

    try {
      console.log(`=== TESTE: ${description} ===`)
      console.log(JSON.stringify(payload, null, 2))

      const response = await fetch("https://demoapp.top1soft.com.br/api/Member", {
        method: "POST",
        headers: {
          accept: "text/plain",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        return `✅ ${description}: Status ${response.status} - SUCESSO!`
      } else {
        const errorText = await response.text()
        return `❌ ${description}: Status ${response.status} - ${errorText.substring(0, 100)}...`
      }
    } catch (error: any) {
      return `❌ ${description}: Erro - ${error.message}`
    }
  }

  const runTests = async () => {
    setLoading(true)
    setResults([])

    const tests = [
      {
        description: "1. Dados EXATOS do Swagger",
        payload: {
          name: "Fellipe",
          email: "fvsouza623@gmail.com",
          document: "45570179836",
          photo: "base64",
          phone: "19987250777",
          birthDate: "2023-10-14T00:00:00",
          isBaptized: true,
          baptizedDate: "2023-10-14T00:00:00",
          isTither: true,
          roleMember: 0,
          maritalStatus: "Solteiro",
          memberSince: "2020-01-01T00:00:00",
          ministry: "Louvor",
          isActive: true,
          notes: "Participa do grupo de jovens",
        },
      },
      {
        description: "2. Mudando apenas o email",
        payload: {
          name: "Fellipe",
          email: "teste123@gmail.com", // Email diferente
          document: "45570179836",
          photo: "base64",
          phone: "19987250777",
          birthDate: "2023-10-14T00:00:00",
          isBaptized: true,
          baptizedDate: "2023-10-14T00:00:00",
          isTither: true,
          roleMember: 0,
          maritalStatus: "Solteiro",
          memberSince: "2020-01-01T00:00:00",
          ministry: "Louvor",
          isActive: true,
          notes: "Participa do grupo de jovens",
        },
      },
      {
        description: "3. Mudando apenas o documento",
        payload: {
          name: "Fellipe",
          email: "fvsouza623@gmail.com",
          document: "12345678901", // CPF diferente
          photo: "base64",
          phone: "19987250777",
          birthDate: "2023-10-14T00:00:00",
          isBaptized: true,
          baptizedDate: "2023-10-14T00:00:00",
          isTither: true,
          roleMember: 0,
          maritalStatus: "Solteiro",
          memberSince: "2020-01-01T00:00:00",
          ministry: "Louvor",
          isActive: true,
          notes: "Participa do grupo de jovens",
        },
      },
      {
        description: "4. Mudando apenas o nome",
        payload: {
          name: "João Silva", // Nome diferente
          email: "fvsouza623@gmail.com",
          document: "45570179836",
          photo: "base64",
          phone: "19987250777",
          birthDate: "2023-10-14T00:00:00",
          isBaptized: true,
          baptizedDate: "2023-10-14T00:00:00",
          isTither: true,
          roleMember: 0,
          maritalStatus: "Solteiro",
          memberSince: "2020-01-01T00:00:00",
          ministry: "Louvor",
          isActive: true,
          notes: "Participa do grupo de jovens",
        },
      },
      {
        description: "5. Dados do payload que deu erro 500",
        payload: {
          name: "teste",
          email: "ga.f.orpinelli@gmail.com",
          document: "40101804806",
          photo: "base64",
          phone: "19993326735",
          birthDate: "1998-09-14T00:00:00",
          isBaptized: true,
          baptizedDate: "2002-07-20T00:00:00",
          isTither: true,
          roleMember: 0,
          maritalStatus: "Casado",
          memberSince: "2000-01-01T00:00:00",
          ministry: "aaaaa",
          isActive: true,
          notes: "aa",
        },
      },
    ]

    const testResults = []

    for (const test of tests) {
      const result = await testPayload(test.description, test.payload)
      testResults.push(result)
      setResults([...testResults])
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Delay entre testes
    }

    setLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Bug className="h-4 w-4" />
          Debug API
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Debug - Teste de Payloads</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Button onClick={runTests} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Executando testes...
              </>
            ) : (
              "🔍 Executar Testes de Debug"
            )}
          </Button>

          {results.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Resultados dos Testes:</h3>
              {results.map((result, index) => (
                <Alert key={index} variant={result.includes("✅") ? "default" : "destructive"}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="font-mono text-sm">{result}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Objetivo dos Testes:</h4>
            <ul className="text-sm space-y-1">
              <li>• Teste 1: Verifica se os dados exatos do Swagger funcionam</li>
              <li>• Teste 2: Verifica se o problema é email duplicado</li>
              <li>• Teste 3: Verifica se o problema é CPF inválido</li>
              <li>• Teste 4: Verifica se o problema é no nome</li>
              <li>• Teste 5: Reproduz o erro 500 original</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
