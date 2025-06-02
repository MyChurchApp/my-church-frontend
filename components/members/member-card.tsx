"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Edit, Mail, Phone, MapPin, Calendar, Heart, UserCheck, UserX } from "lucide-react"

interface Member {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  memberSince: string
  ministry: string
  isActive: boolean
  photo?: string
}

interface User {
  role: string
}

interface MemberCardProps {
  member: Member
  user: User
  onEdit: (member: Member) => void
  onDelete: (member: Member) => void
}

export function MemberCard({ member, user, onEdit, onDelete }: MemberCardProps) {
  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">
        <UserCheck className="h-3 w-3 mr-1" />
        Ativo
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">
        <UserX className="h-3 w-3 mr-1" />
        Inativo
      </Badge>
    )
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-20 w-20 mb-3">
            <AvatarImage src={member.photo || "/placeholder.svg"} alt={member.name} />
            <AvatarFallback className="text-lg">
              {member.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <h3 className="font-semibold text-lg mb-1">{member.name}</h3>

          {user.role === "Admin" ? (
            <>
              <div className="mb-3">{getStatusBadge(member.isActive)}</div>

              <div className="w-full space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{member.phone}</span>
                </div>
                {member.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">
                      {member.city}, {member.state}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Membro desde {new Date(member.memberSince).getFullYear()}</span>
                </div>
                {member.ministry && (
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    <span className="truncate">{member.ministry}</span>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(member)}
                className="mt-4 w-full flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(member)}
                className="mt-2 w-full flex items-center gap-2"
              >
                <UserX className="h-4 w-4" />
                Excluir
              </Button>
            </>
          ) : (
            <div className="mb-3">{getStatusBadge(member.isActive)}</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
