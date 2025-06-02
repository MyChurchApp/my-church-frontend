"use client"

import { Users } from "lucide-react"
import { MemberCard } from "./member-card"
import type { Member, User } from "@/lib/fake-api"

interface MembersGridProps {
  filteredMembers: Member[]
  user: User
  searchTerm: string
  statusFilter: string
  onEditMember: (member: Member) => void
  onDeleteMember: (member: Member) => void
}

export function MembersGrid({
  filteredMembers,
  user,
  searchTerm,
  statusFilter,
  onEditMember,
  onDeleteMember,
}: MembersGridProps) {
  if (filteredMembers.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum membro encontrado</h3>
        <p className="text-gray-500">
          {searchTerm || statusFilter !== "all"
            ? "Tente ajustar os filtros de busca"
            : "Comece cadastrando o primeiro membro da igreja"}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredMembers.map((member) => (
        <MemberCard key={member.id} member={member} user={user} onEdit={onEditMember} onDelete={onDeleteMember} />
      ))}
    </div>
  )
}
