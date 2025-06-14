import { authFetchJson } from "@/lib/auth-fetch"
import type { ApiMember } from "@/lib/api"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://demoapp.top1soft.com.br/api"

// Enum para tipos de documento
export enum DocumentType {
  CPF = 1,
  RG = 2,
  TituloEleitor = 3,
  CNH = 4,
  CertidaoNascimento = 5,
  Outros = 99,
}

// Enum para estado civil
export enum MaritalStatus {
  Solteiro = 0,
  Casado = 1,
  Divorciado = 2,
  Viuvo = 3,
  UniaoEstavel = 4,
}

// Enum para ministério
export enum Ministry {
  Nenhum = 0,
  Louvor = 1,
  Ensino = 2,
  Evangelismo = 3,
  Diaconia = 4,
  Juventude = 5,
  Infantil = 6,
  Intercessao = 7,
  Midia = 8,
  Recepcao = 9,
  Limpeza = 10,
  Seguranca = 11,
  Outros = 99,
}

// Interface para dados de edição do membro
export interface MemberEditData {
  name: string
  email: string
  phone: string
  birthDate: string
  isBaptized: boolean
  baptizedDate: string
  isTither: boolean
  maritalStatus: MaritalStatus
  memberSince: string
  ministry: Ministry
  isActive: boolean
  notes: string
  photo: string
  documents: Array<{
    type: DocumentType
    number: string
  }>
}

export class MembersEditService {
  // Função para atualizar um membro
  static async updateMember(memberId: number, memberData: MemberEditData): Promise<ApiMember> {
    try {
      const response = await authFetchJson(`${API_BASE_URL}/Member/${memberId}`, {
        method: "PUT",
        body: JSON.stringify(memberData),
      })

      return response as ApiMember
    } catch (error) {
      console.error("Erro ao atualizar membro:", error)
      throw error
    }
  }

  // Função para converter dados do formulário para o formato da API
  static convertFormDataToApi(formData: any, existingDocuments: any[] = []): MemberEditData {
    // Processar documentos
    const documents = []

    // CPF
    if (formData.cpf && formData.cpf.trim()) {
      documents.push({
        type: DocumentType.CPF,
        number: formData.cpf.replace(/\D/g, ""), // Remove formatação
      })
    }

    // RG
    if (formData.rg && formData.rg.trim()) {
      documents.push({
        type: DocumentType.RG,
        number: formData.rg.trim(),
      })
    }

    // Se não há novos documentos, manter os existentes
    if (documents.length === 0 && existingDocuments.length > 0) {
      existingDocuments.forEach((doc) => {
        documents.push({
          type: doc.type,
          number: doc.number,
        })
      })
    }

    return {
      name: formData.name?.trim() || "",
      email: formData.email?.trim() || "",
      phone: formData.phone?.trim() || "",
      birthDate: formData.birthDate ? `${formData.birthDate}T00:00:00.000Z` : "1990-01-01T00:00:00.000Z",
      isBaptized: Boolean(formData.isBaptized),
      baptizedDate: formData.baptizedDate ? `${formData.baptizedDate}T00:00:00.000Z` : "2023-01-01T00:00:00.000Z",
      isTither: Boolean(formData.isTither),
      maritalStatus: this.parseMaritalStatus(formData.maritalStatus),
      memberSince: formData.memberSince ? `${formData.memberSince}T00:00:00.000Z` : "2020-01-01T00:00:00.000Z",
      ministry: this.parseMinistry(formData.ministry),
      isActive: formData.isActive !== undefined ? Boolean(formData.isActive) : true,
      notes: formData.notes?.trim() || "",
      photo: formData.photo || "",
      documents: documents,
    }
  }

  // Função para converter dados da API para o formulário
  static convertApiDataToForm(apiMember: ApiMember) {
    const documents = apiMember.document || []
    const cpfDocument = documents.find((doc: any) => doc.type === DocumentType.CPF)
    const rgDocument = documents.find((doc: any) => doc.type === DocumentType.RG)

    return {
      name: apiMember.name || "",
      email: apiMember.email || "",
      phone: apiMember.phone || "",
      cpf: cpfDocument?.number ? this.formatCPF(cpfDocument.number) : "",
      rg: rgDocument?.number || "",
      birthDate: apiMember.birthDate ? apiMember.birthDate.split("T")[0] : "",
      isBaptized: Boolean(apiMember.isBaptized),
      baptizedDate: apiMember.baptizedDate ? apiMember.baptizedDate.split("T")[0] : "",
      isTither: Boolean(apiMember.isTither),
      maritalStatus: apiMember.maritalStatus || "",
      memberSince: apiMember.memberSince ? apiMember.memberSince.split("T")[0] : "",
      ministry: apiMember.ministry || "",
      isActive: Boolean(apiMember.isActive),
      notes: apiMember.notes || "",
      photo: apiMember.photo || "",
    }
  }

  // Função para formatar CPF
  static formatCPF(cpf: string): string {
    const numbers = cpf.replace(/\D/g, "")
    if (numbers.length === 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    }
    return cpf
  }

  // Função para parsear estado civil
  private static parseMaritalStatus(status: string): MaritalStatus {
    switch (status?.toLowerCase()) {
      case "casado":
      case "casada":
        return MaritalStatus.Casado
      case "divorciado":
      case "divorciada":
        return MaritalStatus.Divorciado
      case "viuvo":
      case "viuva":
        return MaritalStatus.Viuvo
      case "uniao estavel":
      case "união estável":
        return MaritalStatus.UniaoEstavel
      default:
        return MaritalStatus.Solteiro
    }
  }

  // Função para parsear ministério
  private static parseMinistry(ministry: string): Ministry {
    switch (ministry?.toLowerCase()) {
      case "louvor":
        return Ministry.Louvor
      case "ensino":
        return Ministry.Ensino
      case "evangelismo":
        return Ministry.Evangelismo
      case "diaconia":
        return Ministry.Diaconia
      case "juventude":
        return Ministry.Juventude
      case "infantil":
        return Ministry.Infantil
      case "intercessao":
      case "intercessão":
        return Ministry.Intercessao
      case "midia":
      case "mídia":
        return Ministry.Midia
      case "recepcao":
      case "recepção":
        return Ministry.Recepcao
      case "limpeza":
        return Ministry.Limpeza
      case "seguranca":
      case "segurança":
        return Ministry.Seguranca
      case "outros":
        return Ministry.Outros
      default:
        return Ministry.Nenhum
    }
  }

  // Função para obter opções de estado civil
  static getMaritalStatusOptions() {
    return [
      { value: "solteiro", label: "Solteiro(a)" },
      { value: "casado", label: "Casado(a)" },
      { value: "divorciado", label: "Divorciado(a)" },
      { value: "viuvo", label: "Viúvo(a)" },
      { value: "uniao estavel", label: "União Estável" },
    ]
  }

  // Função para obter opções de ministério
  static getMinistryOptions() {
    return [
      { value: "", label: "Nenhum" },
      { value: "louvor", label: "Louvor" },
      { value: "ensino", label: "Ensino" },
      { value: "evangelismo", label: "Evangelismo" },
      { value: "diaconia", label: "Diaconia" },
      { value: "juventude", label: "Juventude" },
      { value: "infantil", label: "Infantil" },
      { value: "intercessao", label: "Intercessão" },
      { value: "midia", label: "Mídia" },
      { value: "recepcao", label: "Recepção" },
      { value: "limpeza", label: "Limpeza" },
      { value: "seguranca", label: "Segurança" },
      { value: "outros", label: "Outros" },
    ]
  }
}
