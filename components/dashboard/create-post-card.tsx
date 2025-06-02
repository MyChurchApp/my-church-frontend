"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface CreatePostCardProps {
  user: any
  getInitials: (name: string | undefined | null) => string
  setIsNewPostModalOpen: (open: boolean) => void
}

export function CreatePostCard({ user, getInitials, setIsNewPostModalOpen }: CreatePostCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.member?.photo || ""} alt={user.member?.name || "Usuário"} />
            <AvatarFallback>{getInitials(user.member?.name)}</AvatarFallback>
          </Avatar>
          <Button
            variant="outline"
            className="w-full justify-start text-gray-500 font-normal"
            onClick={() => setIsNewPostModalOpen(true)}
          >
            Compartilhe algo com a comunidade...
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
