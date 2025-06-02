"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"
import type { Member } from "@/lib/fake-api"

interface MembersSummaryProps {
  members: Member[]
  filteredMembers: Member[]
}

export function MembersSummary({ members, filteredMembers }: MembersSummaryProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Resumo de Membros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{members.length}</div>
            <p className="text-sm text-gray-600">Total de Membros</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{members.filter((m) => m.isActive).length}</div>
            <p className="text-sm text-gray-600">Membros Ativos</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{members.filter((m) => !m.isActive).length}</div>
            <p className="text-sm text-gray-600">Membros Inativos</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{filteredMembers.length}</div>
            <p className="text-sm text-gray-600">Resultados da Busca</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
