"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type React from "react"

interface ProfileModalProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  user: any
  editingUser: any
  setEditingUser: (user: any) => void
  userPhoto: string
  getInitials: (name: string | undefined | null) => string
  handlePhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  saveProfile: () => void
}

export function ProfileModal({
  isOpen,
  setIsOpen,
  user,
  editingUser,
  setEditingUser,
  userPhoto,
  getInitials,
  handlePhotoUpload,
  saveProfile,
}: ProfileModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={userPhoto || user.member?.photo || ""} alt={user.member?.name || "Usuário"} />
              <AvatarFallback className="text-2xl">{getInitials(user.member?.name)}</AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="photo" className="sr-only">
                Foto
              </Label>
              <Input id="photo" type="file" accept="image/*" onChange={handlePhotoUpload} className="w-full max-w-xs" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={editingUser.name}
              onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={editingUser.email}
              onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={editingUser.phone}
              onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Cargo</Label>
            <Input
              id="role"
              value={editingUser.role}
              onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
              disabled
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={saveProfile}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
