import { authFetch } from "@/lib/auth-fetch"

export interface MemberFormData {
  name: string
  email: string
  phone: string
  birthDate: string
  isBaptized: boolean
  baptizedDate: string
  isTither: boolean
  maritalStatus: string
  memberSince: string
  ministry: string
  isActive: boolean
  notes: string
  photo: string
  cpf: string
  rg: string
}

export interface MemberApiData {
  name: string
  email: string
  phone: string
  birthDate: string | null
  isBaptized: boolean
  baptizedDate: string | null
  isTither: boolean
  maritalStatus: number
  memberSince: string | null
  ministry: number
  isActive: boolean
  notes: string
  photo: string
  documents: Array<{
    type: number
    number: string
  }>
}

export class MembersEditService {
  private static readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://demoapp.top1soft.com.br/api"

  static async updateMember(memberId: number, data: MemberApiData): Promise<any> {
    const response = await authFetch(`${this.API_BASE_URL}/Member/${memberId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Erro ao atualizar membro: ${response.status} - ${errorText}`)
    }

    return response.json()
  }

  static convertApiDataToForm(member: any): MemberFormData {
    // Extrair CPF e RG dos documentos
    const cpfDoc = member.document?.find((doc: any) => doc.type === 1)
    const rgDoc = member.document?.find((doc: any) => doc.type === 2)

    return {
      name: member.name || "",
      email: member.email || "",
      phone: member.phone || "",
      birthDate: member.birthDate ? member.birthDate.split("T")[0] : "",
      isBaptized: member.isBaptized || false,
      baptizedDate: member.baptizedDate ? member.baptizedDate.split("T")[0] : "",
      isTither: member.isTither || false,
      maritalStatus: this.getMaritalStatusValue(member.maritalStatus),
      memberSince: member.memberSince ? member.memberSince.split("T")[0] : "",
      ministry: this.getMinistryValue(member.ministry),
      isActive: member.isActive !== undefined ? member.isActive : true,
      notes: member.notes || "",
      photo: member.photo || "",
      cpf: cpfDoc?.number || "",
      rg: rgDoc?.number || "",
    }
  }

  static convertFormDataToApi(formData: MemberFormData, existingDocuments: any[] = []): MemberApiData {
    const documents: Array<{ type: number; number: string }> = []

    // Adicionar CPF se preenchido
    if (formData.cpf.trim()) {
      documents.push({
        type: 1, // CPF
        number: formData.cpf.replace(/\D/g, ""), // Remove formatação
      })
    }

    // Adicionar RG se preenchido
    if (formData.rg.trim()) {
      documents.push({
        type: 2, // RG
        number: formData.rg.replace(/\D/g, ""), // Remove formatação
      })
    }

    // Se não há novos documentos, manter os existentes
    if (documents.length === 0 && existingDocuments?.length > 0) {
      existingDocuments.forEach((doc) => {
        documents.push({
          type: doc.type,
          number: doc.number,
        })
      })
    }

    return {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : null,
      isBaptized: formData.isBaptized,
      baptizedDate: formData.baptizedDate ? new Date(formData.baptizedDate).toISOString() : null,
      isTither: formData.isTither,
      maritalStatus: Number.parseInt(formData.maritalStatus) || 0,
      memberSince: formData.memberSince ? new Date(formData.memberSince).toISOString() : null,
      ministry: Number.parseInt(formData.ministry) || 0,
      isActive: formData.isActive,
      notes: formData.notes,
      photo: formData.photo,
      documents,
    }
  }

  static getMaritalStatusOptions() {
    return [
      { value: "0", label: "Solteiro(a)" },
      { value: "1", label: "Casado(a)" },
      { value: "2", label: "Divorciado(a)" },
      { value: "3", label: "Viúvo(a)" },
      { value: "4", label: "União Estável" },
    ]
  }

  static getMinistryOptions() {
    return [
      { value: "0", label: "Nenhum" },
      { value: "1", label: "Louvor" },
      { value: "2", label: "Ensino" },
      { value: "3", label: "Evangelismo" },
      { value: "4", label: "Intercessão" },
      { value: "5", label: "Diaconia" },
      { value: "6", label: "Infantil" },
      { value: "7", label: "Jovens" },
      { value: "8", label: "Casais" },
      { value: "9", label: "Idosos" },
      { value: "10", label: "Administração" },
    ]
  }

  private static getMaritalStatusValue(status: any): string {
    if (typeof status === "number") {
      return status.toString()
    }
    if (typeof status === "string") {
      // Mapear strings para números se necessário
      const statusMap: { [key: string]: string } = {
        Solteiro: "0",
        Solteira: "0",
        Casado: "1",
        Casada: "1",
        Divorciado: "2",
        Divorciada: "2",
        Viúvo: "3",
        Viúva: "3",
        "União Estável": "4",
      }
      return statusMap[status] || "0"
    }
    return "0"
  }

  private static getMinistryValue(ministry: any): string {
    if (typeof ministry === "number") {
      return ministry.toString()
    }
    if (typeof ministry === "string") {
      // Mapear strings para números se necessário
      const ministryMap: { [key: string]: string } = {
        Louvor: "1",
        Ensino: "2",
        Evangelismo: "3",
        Intercessão: "4",
        Diaconia: "5",
        Infantil: "6",
        Jovens: "7",
        Casais: "8",
        Idosos: "9",
        Administração: "10",
      }
      return ministryMap[ministry] || "0"
    }
    return "0"
  }
}
