"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface NewPostModalProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  user: any
  newPostContent: string
  setNewPostContent: (content: string) => void
  isCreatingPost: boolean
  handleCreatePost: () => void
  getInitials: (name: string | undefined | null) => string
}

export function NewPostModal({
  isOpen,
  setIsOpen,
  user,
  newPostContent,
  setNewPostContent,
  isCreatingPost,
  handleCreatePost,
  getInitials,
}: NewPostModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nova Publicação</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-start space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.member?.photo || ""} alt={user?.member?.name || "Usuário"} />
              <AvatarFallback>{getInitials(user?.member?.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{user?.member?.name || "Usuário"}</p>
              <p className="text-xs text-gray-500">{user?.role || "Membro"}</p>
            </div>
          </div>
          <div className="grid gap-2">
            <Textarea
              placeholder="Compartilhe algo com a comunidade..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              rows={5}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreatePost} disabled={isCreatingPost || !newPostContent.trim()}>
            {isCreatingPost ? "Publicando..." : "Publicar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
