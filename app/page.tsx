"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, Church, UserPlus, Navigation } from "lucide-react"
import Link from "next/link"
import { ChurchSearchInput } from "@/components/church-search-input"

export default function HomePage() {
  const [loading, setLoading] = useState(false)
  const [nearbyChurches, setNearbyChurches] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedChurch, setSelectedChurch] = useState<any>(null)

  const handleVisitante = async () => {
    setLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError("Geolocalização não é suportada pelo seu navegador")
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/churches/nearby?lat=${latitude}&lng=${longitude}`,
          )

          if (response.ok) {
            const churches = await response.json()
            setNearbyChurches(churches)
          } else {
            setNearbyChurches([
              {
                id: 1,
                name: "Igreja Batista Central",
                address: "Rua das Flores, 123 - Centro",
                city: "São Paulo",
                state: "SP",
                distance: "0.5 km",
                rating: 4.8,
                reviews: 127,
              },
              {
                id: 2,
                name: "Igreja Assembleia de Deus",
                address: "Av. Principal, 456 - Jardim América",
                city: "São Paulo",
                state: "SP",
                distance: "1.2 km",
                rating: 4.6,
                reviews: 89,
              },
              {
                id: 3,
                name: "Igreja Presbiteriana do Brasil",
                address: "Rua da Paz, 789 - Vila Mariana",
                city: "São Paulo",
                state: "SP",
                distance: "2.0 km",
                rating: 4.9,
                reviews: 203,
              },
            ])
          }
        } catch (err) {
          setError("Erro ao buscar igrejas próximas")
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        setError("Não foi possível obter sua localização. Verifique as permissões.")
        setLoading(false)
      },
    )
  }

  const handleSelectChurch = (church: any) => {
    setSelectedChurch(church)
    setNearbyChurches([church])
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header estilo TripAdvisor */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Church className="h-8 w-8 text-emerald-600" />
              <span className="text-2xl font-bold text-gray-900">MyChurchApp</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/cadastro"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cadastrar
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 bg-transparent"
              >
                Entrar
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section com busca */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Encontre sua comunidade de fé</h1>
            <p className="text-lg md:text-xl text-emerald-50 text-pretty">
              Descubra igrejas próximas a você e conecte-se com sua comunidade
            </p>
          </div>

          {/* Search Box estilo TripAdvisor */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-2xl p-4 md:p-6">
              <ChurchSearchInput
                onSelectChurch={handleSelectChurch}
                placeholder="Para onde você quer ir? Busque por cidade, bairro ou nome da igreja..."
              />

              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Button
                  onClick={handleVisitante}
                  disabled={loading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-base font-medium"
                >
                  <Navigation className="h-5 w-5 mr-2" />
                  {loading ? "Buscando..." : "Usar minha localização"}
                </Button>
                <Link href="/cadastro" className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full h-12 text-base font-medium border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 bg-transparent"
                  >
                    <UserPlus className="h-5 w-5 mr-2" />
                    Cadastrar minha igreja
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Results Section estilo TripAdvisor */}
      {nearbyChurches.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {selectedChurch ? "Igreja selecionada" : "Igrejas próximas a você"}
            </h2>
            <p className="text-gray-600">{nearbyChurches.length} resultados encontrados</p>
          </div>

          <div className="grid gap-4">
            {nearbyChurches.map((church) => (
              <div
                key={church.id}
                className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow duration-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-emerald-600 cursor-pointer">
                        {church.name}
                      </h3>

                      {church.rating && (
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(church.rating) ? "text-emerald-600" : "text-gray-300"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{church.rating}</span>
                          <span className="text-sm text-gray-500">({church.reviews} avaliações)</span>
                        </div>
                      )}

                      <div className="flex items-start gap-2 text-gray-600 mb-2">
                        <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm">{church.address}</p>
                          {church.city && (
                            <p className="text-sm">
                              {church.city}
                              {church.state && `, ${church.state}`}
                            </p>
                          )}
                        </div>
                      </div>

                      {church.distance && (
                        <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                          <Navigation className="h-3 w-3" />
                          {church.distance}
                        </div>
                      )}
                    </div>

                    <div className="flex md:flex-col gap-2">
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Ver detalhes</Button>
                      <Button variant="outline" className="border-gray-300 bg-transparent">
                        Como chegar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State quando não há busca */}
      {nearbyChurches.length === 0 && !error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Church className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Comece sua busca</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Use a busca acima ou clique em "Usar minha localização" para encontrar igrejas próximas a você
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
