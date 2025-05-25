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

export interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  type: "culto" | "evento" | "reuniao" | "estudo"
  organizer: string
  attendees?: number
}

export interface Member {
  id: string
  name: string
  email: string
  phone: string
  cpf: string
  birthDate: string
  address: string
  city: string
  state: string
  zipCode: string
  maritalStatus: "solteiro" | "casado" | "divorciado" | "viuvo"
  baptized: boolean
  memberSince: string
  ministry: string
  photo?: string
  isActive: boolean
  notes?: string
}

export interface FinanceRecord {
  id: string
  type: "entrada" | "saida"
  category: "dizimo" | "oferta" | "doacao" | "despesa" | "salario"
  description: string
  amount: number
  date: string
  method: "dinheiro" | "pix" | "cartao" | "transferencia"
  member?: string
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

export const fakeMembers: Member[] = [
  {
    id: "1",
    name: "Pastor João Silva",
    email: "joao.silva@igreja.com.br",
    phone: "(11) 99999-0001",
    cpf: "123.456.789-01",
    birthDate: "1975-03-15",
    address: "Rua das Palmeiras, 456",
    city: "São Paulo",
    state: "SP",
    zipCode: "01234-567",
    maritalStatus: "casado",
    baptized: true,
    memberSince: "2010-01-15",
    ministry: "Liderança",
    photo: "/placeholder.svg?height=100&width=100&query=pastor+profile",
    isActive: true,
    notes: "Pastor principal da igreja",
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria.santos@email.com",
    phone: "(11) 99999-0002",
    cpf: "987.654.321-02",
    birthDate: "1988-07-22",
    address: "Av. Paulista, 1000",
    city: "São Paulo",
    state: "SP",
    zipCode: "01310-100",
    maritalStatus: "solteiro",
    baptized: true,
    memberSince: "2018-05-10",
    ministry: "Jovens",
    photo: "/placeholder.svg?height=100&width=100&query=young+woman+church",
    isActive: true,
    notes: "Líder do ministério de jovens",
  },
  {
    id: "3",
    name: "Carlos Oliveira",
    email: "carlos.oliveira@email.com",
    phone: "(11) 99999-0003",
    cpf: "456.789.123-03",
    birthDate: "1965-12-08",
    address: "Rua da Consolação, 789",
    city: "São Paulo",
    state: "SP",
    zipCode: "01302-001",
    maritalStatus: "casado",
    baptized: true,
    memberSince: "2005-03-20",
    ministry: "Música",
    photo: "/placeholder.svg?height=100&width=100&query=man+musician+church",
    isActive: true,
    notes: "Regente do coral da igreja",
  },
  {
    id: "4",
    name: "Ana Costa",
    email: "ana.costa@email.com",
    phone: "(11) 99999-0004",
    cpf: "789.123.456-04",
    birthDate: "1992-01-16",
    address: "Rua Augusta, 321",
    city: "São Paulo",
    state: "SP",
    zipCode: "01305-000",
    maritalStatus: "solteiro",
    baptized: false,
    memberSince: "2023-08-15",
    ministry: "Visitação",
    photo: "/placeholder.svg?height=100&width=100&query=young+woman+smile",
    isActive: true,
    notes: "Nova convertida, em processo de batismo",
  },
  {
    id: "5",
    name: "Pedro Mendes",
    email: "pedro.mendes@email.com",
    phone: "(11) 99999-0005",
    cpf: "321.654.987-05",
    birthDate: "1980-09-30",
    address: "Rua Liberdade, 654",
    city: "São Paulo",
    state: "SP",
    zipCode: "01503-001",
    maritalStatus: "divorciado",
    baptized: true,
    memberSince: "2015-11-05",
    ministry: "Intercessão",
    photo: "/placeholder.svg?height=100&width=100&query=man+prayer+church",
    isActive: false,
    notes: "Afastado temporariamente por motivos pessoais",
  },
  {
    id: "6",
    name: "Rosa Silva",
    email: "rosa.silva@email.com",
    phone: "(11) 99999-0006",
    cpf: "654.987.321-06",
    birthDate: "1955-04-12",
    address: "Rua do Carmo, 987",
    city: "São Paulo",
    state: "SP",
    zipCode: "01020-010",
    maritalStatus: "viuvo",
    baptized: true,
    memberSince: "1985-06-30",
    ministry: "Oração",
    photo: "/placeholder.svg?height=100&width=100&query=elderly+woman+church",
    isActive: true,
    notes: "Membro fundador da igreja",
  },
]

export const fakeEvents: Event[] = [
  {
    id: "1",
    title: "Culto Dominical",
    description: "Culto de adoração e pregação da palavra",
    date: "2024-01-21",
    time: "19:00",
    location: "Templo Principal",
    type: "culto",
    organizer: "Pastor João Silva",
    attendees: 320,
  },
  {
    id: "2",
    title: "Retiro de Jovens",
    description: "Retiro espiritual para jovens de 15 a 30 anos",
    date: "2024-03-15",
    time: "08:00",
    location: "Campos do Jordão - SP",
    type: "evento",
    organizer: "Maria Santos",
    attendees: 45,
  },
  {
    id: "3",
    title: "Reunião de Oração",
    description: "Momento de intercessão e oração pela igreja",
    date: "2024-01-24",
    time: "19:30",
    location: "Sala de Oração",
    type: "reuniao",
    organizer: "Ministério de Intercessão",
    attendees: 25,
  },
  {
    id: "4",
    title: "Estudo Bíblico",
    description: "Estudo do livro de Romanos - Capítulo 8",
    date: "2024-01-25",
    time: "20:00",
    location: "Sala 2",
    type: "estudo",
    organizer: "Pastor João Silva",
    attendees: 35,
  },
  {
    id: "5",
    title: "Culto de Quarta",
    description: "Culto de meio de semana com foco em ensino",
    date: "2024-01-24",
    time: "19:30",
    location: "Templo Principal",
    type: "culto",
    organizer: "Pastor João Silva",
    attendees: 180,
  },
]

export const fakeFinanceRecords: FinanceRecord[] = [
  {
    id: "1",
    type: "entrada",
    category: "dizimo",
    description: "Dízimos Janeiro 2024",
    amount: 15420.5,
    date: "2024-01-15",
    method: "pix",
    member: "Vários membros",
  },
  {
    id: "2",
    type: "entrada",
    category: "oferta",
    description: "Ofertas Culto Dominical",
    amount: 2340.0,
    date: "2024-01-14",
    method: "dinheiro",
  },
  {
    id: "3",
    type: "saida",
    category: "despesa",
    description: "Conta de Luz",
    amount: 890.45,
    date: "2024-01-10",
    method: "transferencia",
  },
  {
    id: "4",
    type: "entrada",
    category: "doacao",
    description: "Doação para reforma do templo",
    amount: 5000.0,
    date: "2024-01-12",
    method: "pix",
    member: "João Carlos Silva",
  },
  {
    id: "5",
    type: "saida",
    category: "salario",
    description: "Salário Pastor",
    amount: 4500.0,
    date: "2024-01-05",
    method: "transferencia",
  },
]

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

export const getEvents = (): Event[] => {
  return fakeEvents
}

export const getMembers = (): Member[] => {
  return fakeMembers
}

export const getFinanceRecords = (): FinanceRecord[] => {
  return fakeFinanceRecords
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

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

// Função para verificar permissões
export const hasPermission = (userAccessLevel: string, requiredLevel: string): boolean => {
  if (userAccessLevel === "admin") return true
  if (requiredLevel === "member") return true
  return false
}
