// Fake API para dados da igreja
export interface User {
  cpf: string
  name: string
  church: string
  role: string
  accessLevel: "admin" | "member"
}

export interface ChurchData {
  id: string
  name: string
  address: string
  phone: string
  email: string
  pastor: string
  members: number
  founded: string
}

export interface Notification {
  id: string
  type: "event" | "announcement" | "prayer" | "birthday" | "finance"
  title: string
  content: string
  author: string
  timestamp: string
  likes: number
  comments: number
  image?: string
}

export const fakeChurchData: ChurchData = {
  id: "1",
  name: "Igreja Batista Central",
  address: "Rua das Flores, 123 - Centro, São Paulo - SP",
  phone: "(11) 3456-7890",
  email: "contato@igrejabatistacentral.com.br",
  pastor: "Pastor João Silva",
  members: 450,
  founded: "1985",
}

// Usuários fake para teste
export const fakeUsers = {
  "123456": {
    cpf: "123456",
    name: "Pastor João Silva",
    church: "Igreja Batista Central",
    role: "Pastor Principal",
    accessLevel: "admin" as const,
  },
  "654321": {
    cpf: "654321",
    name: "Maria Santos",
    church: "Igreja Batista Central",
    role: "Membro",
    accessLevel: "member" as const,
  },
}

export const fakeNotifications: Notification[] = [
  {
    id: "1",
    type: "announcement",
    title: "Culto de Ação de Graças",
    content:
      "Neste domingo teremos um culto especial de ação de graças. Venha com sua família celebrar as bênçãos que Deus tem derramado sobre nossas vidas. Haverá também um almoço comunitário após o culto.",
    author: "Pastor João Silva",
    timestamp: "2024-01-15T10:30:00Z",
    likes: 24,
    comments: 8,
    image: "/placeholder.svg?height=300&width=500&query=church+thanksgiving+service",
  },
  {
    id: "2",
    type: "event",
    title: "Retiro de Jovens 2024",
    content:
      "Inscrições abertas para o retiro de jovens! Será nos dias 15-17 de março em Campos do Jordão. Tema: 'Renovando a Esperança'. Valor: R$ 180,00 (inclui hospedagem e alimentação).",
    author: "Líder de Jovens - Maria Santos",
    timestamp: "2024-01-14T15:45:00Z",
    likes: 42,
    comments: 15,
    image: "/placeholder.svg?height=300&width=500&query=youth+retreat+mountains",
  },
  {
    id: "3",
    type: "birthday",
    title: "Aniversariantes da Semana",
    content:
      "Vamos parabenizar nossos irmãos que fazem aniversário esta semana: Ana Costa (16/01), Pedro Oliveira (18/01) e Carla Mendes (20/01). Que Deus abençoe cada um com muita saúde e alegria!",
    author: "Secretaria da Igreja",
    timestamp: "2024-01-14T09:00:00Z",
    likes: 18,
    comments: 12,
  },
  {
    id: "4",
    type: "prayer",
    title: "Pedido de Oração",
    content:
      "Pedimos orações pela irmã Rosa Silva que está internada no Hospital São Paulo. Ela passará por uma cirurgia na próxima terça-feira. Oremos para que Deus guie as mãos dos médicos e conceda uma recuperação rápida.",
    author: "Ministério de Intercessão",
    timestamp: "2024-01-13T20:15:00Z",
    likes: 35,
    comments: 22,
  },
  {
    id: "5",
    type: "finance",
    title: "Relatório Financeiro - Dezembro",
    content:
      "Compartilhamos com alegria que conseguimos atingir 105% da meta de dízimos e ofertas em dezembro. Isso nos permitiu quitar todas as contas e ainda destinar R$ 5.000 para obras sociais. Obrigado pela fidelidade!",
    author: "Tesouraria",
    timestamp: "2024-01-12T14:30:00Z",
    likes: 28,
    comments: 6,
  },
  {
    id: "6",
    type: "event",
    title: "Escola Bíblica Dominical",
    content:
      "Nova classe para novos convertidos! A partir deste domingo, teremos uma classe especial para quem aceitou Jesus recentemente. O estudo será sobre 'Primeiros Passos na Fé'. Horário: 9h às 9h45.",
    author: "Coordenação EBD",
    timestamp: "2024-01-11T16:20:00Z",
    likes: 31,
    comments: 9,
  },
  {
    id: "7",
    type: "announcement",
    title: "Novo Ministério de Visitação",
    content:
      "Com grande alegria anunciamos o lançamento do Ministério de Visitação! Este ministério será responsável por visitar membros enfermos, idosos e novos convertidos. Se você tem o coração para cuidar das pessoas, venha fazer parte! Reunião de apresentação na quarta-feira às 19h30.",
    author: "Pastor João Silva",
    timestamp: "2024-01-10T18:45:00Z",
    likes: 19,
    comments: 7,
    image: "/placeholder.svg?height=300&width=500&query=church+ministry+visiting+people",
  },
  {
    id: "8",
    type: "finance",
    title: "Campanha Reforma do Templo",
    content:
      "Iniciamos hoje a campanha para reforma do nosso templo! Meta: R$ 50.000 para renovação do sistema de som, pintura e melhorias na acessibilidade. Já arrecadamos R$ 12.500 (25% da meta). Cada contribuição, por menor que seja, faz a diferença. Que Deus abençoe a generosidade de cada um!",
    author: "Comissão de Obras",
    timestamp: "2024-01-09T12:20:00Z",
    likes: 33,
    comments: 18,
    image: "/placeholder.svg?height=300&width=500&query=church+renovation+construction+progress",
  },
  {
    id: "9",
    type: "announcement",
    title: "Testemunho de Transformação",
    content:
      "Glória a Deus! A irmã Fernanda compartilhou um testemunho emocionante no culto de domingo sobre como Deus restaurou sua família. Após 2 anos de oração e perseverança, seu esposo entregou a vida a Jesus e hoje eles servem juntos no ministério de louvor. Que testemunho inspirador de fé e perseverança!",
    author: "Ministério de Testemunhos",
    timestamp: "2024-01-08T21:10:00Z",
    likes: 47,
    comments: 25,
    image: "/placeholder.svg?height=300&width=500&query=happy+family+testimony+church",
  },
]

export const getUser = (): User | null => {
  if (typeof window !== "undefined") {
    const userData = localStorage.getItem("user")
    return userData ? JSON.parse(userData) : null
  }
  return null
}

export const getChurchData = (): ChurchData => {
  return fakeChurchData
}

export const getNotifications = (): Notification[] => {
  return fakeNotifications
}

export const formatTimeAgo = (timestamp: string): string => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)

  if (diffInSeconds < 60) return "Agora mesmo"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min atrás`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d atrás`

  return time.toLocaleDateString("pt-BR")
}

// Função para verificar permissões
export const hasPermission = (userAccessLevel: string, requiredLevel: string): boolean => {
  if (userAccessLevel === "admin") return true
  if (requiredLevel === "member") return true
  return false
}
