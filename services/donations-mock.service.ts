import type { PaidDonation, PaidDonationsResponse, DonationsFilters } from "./donations.service"

export class DonationsMockService {
  private mockDonations: PaidDonation[] = [
    {
      id: 1,
      description: "Dízimo - Janeiro 2024",
      value: 150.0,
      date: "2024-01-15T10:30:00Z",
      status: "paid",
      paymentMethod: "pix",
      transactionId: "PIX123456789",
    },
    {
      id: 2,
      description: "Oferta Especial - Construção",
      value: 300.0,
      date: "2024-01-20T14:15:00Z",
      status: "paid",
      paymentMethod: "credit_card",
      transactionId: "CC987654321",
    },
    {
      id: 3,
      description: "Dízimo - Fevereiro 2024",
      value: 150.0,
      date: "2024-02-15T10:30:00Z",
      status: "paid",
      paymentMethod: "pix",
      transactionId: "PIX111222333",
    },
    {
      id: 4,
      description: "Oferta Missionária",
      value: 75.0,
      date: "2024-02-25T16:45:00Z",
      status: "paid",
      paymentMethod: "boleto",
      transactionId: "BOL444555666",
    },
    {
      id: 5,
      description: "Dízimo - Março 2024",
      value: 150.0,
      date: "2024-03-15T10:30:00Z",
      status: "paid",
      paymentMethod: "pix",
      transactionId: "PIX777888999",
    },
  ]

  async getPaidDonations(filters: DonationsFilters = {}): Promise<PaidDonationsResponse> {
    console.log("🎭 [MockService] Usando dados mock para doações")

    // Simular delay da API
    await new Promise((resolve) => setTimeout(resolve, 500))

    let filteredDonations = [...this.mockDonations]

    // Aplicar filtros
    if (filters.description) {
      filteredDonations = filteredDonations.filter((d) =>
        d.description.toLowerCase().includes(filters.description!.toLowerCase()),
      )
    }

    if (filters.value) {
      filteredDonations = filteredDonations.filter((d) => d.value >= filters.value!)
    }

    if (filters.date) {
      const filterDate = new Date(filters.date).toDateString()
      filteredDonations = filteredDonations.filter((d) => new Date(d.date).toDateString() === filterDate)
    }

    // Paginação
    const page = filters.page || 1
    const pageSize = filters.pageSize || 10
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedItems = filteredDonations.slice(startIndex, endIndex)

    const totalCount = filteredDonations.length
    const totalPages = Math.ceil(totalCount / pageSize)

    return {
      items: paginatedItems,
      totalCount,
      page,
      pageSize,
      totalPages,
    }
  }
}

export const donationsMockService = new DonationsMockService()
