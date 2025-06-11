"use client"

import type React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { User, ChurchData } from "@/lib/fake-api"

interface DashboardHeaderProps {
  user: User
  churchData: ChurchData
  userPhoto: string
  isProfileModalOpen: boolean
  editingUser: {
    name: string
    email: string
    phone: string
    role: string
    birthDate: string
    baptizedDate: string
    isBaptized: boolean
    isTither: boolean
    notes: string
    cpf: string
    memberSince: string
    maritalStatus: string
    ministry: string
    isActive: boolean
  }
  validationErrors: { [key: string]: string }
  isSavingProfile: boolean
  onOpenProfileModal: () => void
  onCloseProfileModal: () => void
  onEditingUserChange: (user: any) => void
  onPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onSaveProfile: () => void
  setUserPhoto: (photo: string) => void
}

const getInitials = (name: string | undefined | null): string => {
  if (!name || typeof name !== "string") return "U"
  return (
    name
      .split(" ")
      .filter((n) => n.length > 0)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"
  )
}

export function DashboardHeader({
  user,
  churchData,
  userPhoto,
  isProfileModalOpen,
  editingUser,
  validationErrors,
  isSavingProfile,
  onOpenProfileModal,
  onCloseProfileModal,
  onEditingUserChange,
  onPhotoUpload,
  onSaveProfile,
  setUserPhoto,
}: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="ml-12 md:ml-0">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 text-sm md:text-base">{churchData.name}</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
          <Dialog open={isProfileModalOpen} onOpenChange={onCloseProfileModal}>
            {/* Mobile: foto em cima, nome embaixo */}
            <div
              className="flex flex-col items-center md:hidden cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors"
              onClick={onOpenProfileModal}
            >
              <Avatar className="h-8 w-8 hover:opacity-80 transition-opacity border-2 border-transparent hover:border-blue-200">
                <AvatarImage src={userPhoto || "/placeholder.svg?height=40&width=40&query=pastor+profile"} />
                <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <p className="font-medium text-gray-900 text-sm mt-1">{user.name || "Usuário"}</p>
              <p className="text-xs text-gray-500">{user.email || "email@exemplo.com"}</p>
            </div>

            {/* Desktop: nome e foto lado a lado */}
            <div
              className="hidden md:flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors"
              onClick={onOpenProfileModal}
            >
              <div className="text-right">
                <p className="font-medium text-gray-900">{user.name || "Usuário"}</p>
                <p className="text-sm text-gray-500">{user.email || "email@exemplo.com"}</p>
              </div>
              <Avatar className="h-10 w-10 hover:opacity-80 transition-opacity border-2 border-transparent hover:border-blue-200">
                <AvatarImage src={userPhoto || "/placeholder.svg?height=40&width=40&query=pastor+profile"} />
                <AvatarFallback className="text-sm">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
            </div>

            <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Perfil</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Seção de foto */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={userPhoto || "/placeholder.svg?height=80&width=80&query=pastor+profile"} />
                      <AvatarFallback className="text-lg">{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <input type="file" accept="image/*" onChange={onPhotoUpload} className="hidden" id="photo-upload" />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("photo-upload")?.click()}
                      className="text-sm"
                    >
                      Alterar Foto
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={editingUser.name}
                    onChange={(e) => onEditingUserChange({ ...editingUser, name: e.target.value })}
                    className={validationErrors.name ? "border-red-500 focus:border-red-500" : ""}
                  />
                  {validationErrors.name && <p className="text-red-500 text-xs">{validationErrors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => onEditingUserChange({ ...editingUser, email: e.target.value })}
                    className={validationErrors.email ? "border-red-500 focus:border-red-500" : ""}
                  />
                  {validationErrors.email && <p className="text-red-500 text-xs">{validationErrors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={editingUser.phone}
                    onChange={(e) => onEditingUserChange({ ...editingUser, phone: e.target.value })}
                    className={validationErrors.phone ? "border-red-500 focus:border-red-500" : ""}
                  />
                  {validationErrors.phone && <p className="text-red-500 text-xs">{validationErrors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">Data de Nascimento *</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={editingUser.birthDate}
                    onChange={(e) => onEditingUserChange({ ...editingUser, birthDate: e.target.value })}
                    className={validationErrors.birthDate ? "border-red-500 focus:border-red-500" : ""}
                  />
                  {validationErrors.birthDate && <p className="text-red-500 text-xs">{validationErrors.birthDate}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={editingUser.cpf}
                    onChange={(e) => onEditingUserChange({ ...editingUser, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    className={validationErrors.cpf ? "border-red-500 focus:border-red-500" : ""}
                  />
                  {validationErrors.cpf && <p className="text-red-500 text-xs">{validationErrors.cpf}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="baptizedDate">Data de Batismo</Label>
                  <Input
                    id="baptizedDate"
                    type="date"
                    value={editingUser.baptizedDate}
                    onChange={(e) => onEditingUserChange({ ...editingUser, baptizedDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="memberSince">Membro desde</Label>
                  <Input
                    id="memberSince"
                    type="date"
                    value={editingUser.memberSince}
                    onChange={(e) => onEditingUserChange({ ...editingUser, memberSince: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={editingUser.notes}
                    onChange={(e) => onEditingUserChange({ ...editingUser, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isBaptized"
                      checked={editingUser.isBaptized}
                      onChange={(e) => onEditingUserChange({ ...editingUser, isBaptized: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="isBaptized">Batizado</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isTither"
                      checked={editingUser.isTither}
                      onChange={(e) => onEditingUserChange({ ...editingUser, isTither: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="isTither">Dizimista</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Cargo</Label>
                  <Input id="role" value={editingUser.role} disabled className="bg-gray-100" />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={onSaveProfile}
                    disabled={isSavingProfile}
                    className="flex-1"
                    style={{ backgroundColor: "#89f0e6", color: "#000" }}
                  >
                    {isSavingProfile ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        Salvando...
                      </>
                    ) : (
                      "Salvar"
                    )}
                  </Button>
                  <Button variant="outline" onClick={onCloseProfileModal} className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  )
}
