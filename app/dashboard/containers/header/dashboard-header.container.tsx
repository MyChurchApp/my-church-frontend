"use client"

import type React from "react"

import { useState } from "react"
import { DashboardHeader } from "../../components/header/dashboard-header"
import { MembersService } from "@/services/members.service"
import type { User, ChurchData } from "@/lib/fake-api"

interface DashboardHeaderContainerProps {
  user: User
  churchData: ChurchData
  onUserUpdate: (user: User) => void
}

export function DashboardHeaderContainer({ user, churchData, onUserUpdate }: DashboardHeaderContainerProps) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [userPhoto, setUserPhoto] = useState<string>(user.photo || "")
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})
  const [editingUser, setEditingUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    birthDate: "",
    baptizedDate: "",
    isBaptized: false,
    isTither: false,
    notes: "",
    cpf: "",
    memberSince: "",
    maritalStatus: "",
    ministry: "",
    isActive: true,
  })

  const openProfileModal = () => {
    if (user) {
      console.log("🔍 Debug openProfileModal - user:", user)

      // Buscar dados mais recentes do localStorage se disponível
      let memberData = null
      try {
        const storedData = localStorage.getItem("user")
        if (storedData) {
          const parsedData = JSON.parse(storedData)
          console.log("📋 Dados brutos do localStorage:", parsedData)

          if (parsedData.token && parsedData.token.member) {
            memberData = parsedData.token.member
            console.log("📋 Dados do member encontrados em token.member:", memberData)
          } else {
            memberData = parsedData
            console.log("📋 Usando dados diretos do localStorage:", memberData)
          }
        }
      } catch (error) {
        console.error("❌ Erro ao parsear dados do localStorage:", error)
      }

      const sourceData = memberData || user

      // Procurar CPF nos documentos (tipo 1 é CPF)
      let cpfValue = ""
      if (sourceData.document && Array.isArray(sourceData.document)) {
        const cpfDoc = sourceData.document.find((doc: any) => doc.type === 1)
        cpfValue = cpfDoc?.number || ""
      } else if (sourceData.documents && Array.isArray(sourceData.documents)) {
        const cpfDoc = sourceData.documents.find((doc: any) => doc.type === 1)
        cpfValue = cpfDoc?.number || ""
      }

      console.log("📄 CPF encontrado:", cpfValue)

      const editingData = {
        name: sourceData.name || "",
        email: sourceData.email || "",
        phone: sourceData.phone || "",
        role: user.role || "",
        birthDate: sourceData.birthDate ? sourceData.birthDate.split("T")[0] : "",
        baptizedDate: sourceData.baptizedDate ? sourceData.baptizedDate.split("T")[0] : "",
        isBaptized: sourceData.isBaptized || false,
        isTither: sourceData.isTither || false,
        notes: sourceData.notes || "",
        cpf: cpfValue,
        memberSince: sourceData.memberSince ? sourceData.memberSince.split("T")[0] : "",
        maritalStatus: sourceData.maritalStatus || "",
        ministry: sourceData.ministry || "",
        isActive: sourceData.isActive !== undefined ? sourceData.isActive : true,
      }

      console.log("📝 Dados mapeados para edição:", editingData)
      setEditingUser(editingData)
      setUserPhoto(sourceData.photo || "")
      setValidationErrors({})
      setIsProfileModalOpen(true)
    }
  }

  const validateFields = () => {
    const errors: { [key: string]: string } = {}

    if (!editingUser.name.trim()) {
      errors.name = "Nome é obrigatório"
    }

    if (!editingUser.email.trim()) {
      errors.email = "Email é obrigatório"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editingUser.email.trim())) {
      errors.email = "Email deve ter um formato válido"
    }

    if (!editingUser.cpf.trim()) {
      errors.cpf = "CPF é obrigatório"
    } else if (editingUser.cpf.replace(/\D/g, "").length !== 11) {
      errors.cpf = "CPF deve ter 11 dígitos"
    }

    if (!editingUser.phone.trim()) {
      errors.phone = "Telefone é obrigatório"
    } else if (editingUser.phone.replace(/\D/g, "").length < 10) {
      errors.phone = "Telefone deve ter pelo menos 10 dígitos"
    }

    if (!editingUser.birthDate) {
      errors.birthDate = "Data de nascimento é obrigatória"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const saveProfile = async () => {
    if (!user?.id) {
      console.error("ID do usuário não encontrado")
      return
    }

    if (!validateFields()) {
      console.log("Validação falhou:", validationErrors)
      return
    }

    setIsSavingProfile(true)

    try {
      console.log("Salvando perfil para o membro ID:", user.id)

      const updateData = {
        command: "UpdateMember",
        name: editingUser.name.trim(),
        email: editingUser.email.trim(),
        phone: editingUser.phone.trim(),
        birthDate: editingUser.birthDate ? `${editingUser.birthDate}T00:00:00` : "1990-01-01T00:00:00",
        isBaptized: Boolean(editingUser.isBaptized),
        baptizedDate: editingUser.baptizedDate ? `${editingUser.baptizedDate}T00:00:00` : "2010-05-20T00:00:00",
        isTither: Boolean(editingUser.isTither),
        maritalStatus: 0,
        memberSince: editingUser.memberSince ? `${editingUser.memberSince}T00:00:00` : "2020-01-01T00:00:00",
        ministry: 0,
        isActive: Boolean(editingUser.isActive),
        notes: editingUser.notes || "",
        photo: userPhoto || "",
        document: [
          {
            type: 1,
            number: editingUser.cpf.replace(/\D/g, ""),
          },
        ],
      }

      console.log("Dados enviados para API:", updateData)

      const updatedMember = await MembersService.updateMember(Number.parseInt(user.id), updateData)

      console.log("Membro atualizado com sucesso:", updatedMember)

      const updatedUser = {
        ...user,
        name: updatedMember.name,
        email: updatedMember.email,
        phone: updatedMember.phone,
        photo: updatedMember.photo,
        birthDate: updatedMember.birthDate ? updatedMember.birthDate.split("T")[0] : "",
        baptizedDate: updatedMember.baptizedDate ? updatedMember.baptizedDate.split("T")[0] : "",
        isBaptized: updatedMember.isBaptized,
        isTither: updatedMember.isTither,
        notes: updatedMember.notes,
        documents: updatedMember.document || [],
        memberSince: updatedMember.memberSince ? updatedMember.memberSince.split("T")[0] : "",
        maritalStatus: updatedMember.maritalStatus || "",
        ministry: updatedMember.ministry || "",
        isActive: updatedMember.isActive,
      }

      onUserUpdate(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedMember))
      setIsProfileModalOpen(false)
      console.log("✅ Perfil atualizado com sucesso!")
    } catch (error) {
      console.error("❌ Erro ao salvar perfil:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      console.error(`Erro ao salvar perfil: ${errorMessage}`)
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setUserPhoto(result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <DashboardHeader
      user={user}
      churchData={churchData}
      userPhoto={userPhoto}
      isProfileModalOpen={isProfileModalOpen}
      editingUser={editingUser}
      validationErrors={validationErrors}
      isSavingProfile={isSavingProfile}
      onOpenProfileModal={openProfileModal}
      onCloseProfileModal={() => setIsProfileModalOpen(false)}
      onEditingUserChange={setEditingUser}
      onPhotoUpload={handlePhotoUpload}
      onSaveProfile={saveProfile}
      setUserPhoto={setUserPhoto}
    />
  )
}
