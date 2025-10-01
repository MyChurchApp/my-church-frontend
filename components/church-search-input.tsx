"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Church {
  id: number
  name: string
  address: string
  city?: string
  state?: string
  distance?: string
}

interface ChurchSearchInputProps {
  onSelectChurch?: (church: Church) => void
  placeholder?: string
  className?: string
}

const mockChurches: Church[] = [
  {
    id: 1,
    name: "Igreja Batista Central",
    address: "Rua das Flores, 123",
    city: "São Paulo",
    state: "SP",
  },
  {
    id: 2,
    name: "Igreja Assembleia de Deus",
    address: "Av. Principal, 456",
    city: "São Paulo",
    state: "SP",
  },
  {
    id: 3,
    name: "Igreja Presbiteriana do Brasil",
    address: "Rua da Paz, 789",
    city: "Rio de Janeiro",
    state: "RJ",
  },
  {
    id: 4,
    name: "Igreja Metodista Wesleyana",
    address: "Rua dos Anjos, 321",
    city: "Belo Horizonte",
    state: "MG",
  },
  {
    id: 5,
    name: "Igreja Adventista do Sétimo Dia",
    address: "Av. da Liberdade, 654",
    city: "Curitiba",
    state: "PR",
  },
  {
    id: 6,
    name: "Igreja Católica São Pedro",
    address: "Praça Central, 100",
    city: "Salvador",
    state: "BA",
  },
  {
    id: 7,
    name: "Igreja Evangélica Pentecostal",
    address: "Rua do Comércio, 234",
    city: "Fortaleza",
    state: "CE",
  },
  {
    id: 8,
    name: "Igreja Batista da Lagoinha",
    address: "Av. Brasil, 567",
    city: "Belo Horizonte",
    state: "MG",
  },
]

export function ChurchSearchInput({
  onSelectChurch,
  placeholder = "Buscar igrejas por nome ou localização...",
  className,
}: ChurchSearchInputProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Church[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Debounce para pesquisa
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setShowResults(false)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL

        if (apiUrl) {
          try {
            const response = await fetch(`${apiUrl}/churches/search?q=${encodeURIComponent(query)}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            })

            if (response.ok) {
              const data = await response.json()
              setResults(data)
              setShowResults(true)
              setLoading(false)
              return
            }
          } catch (apiError) {
            console.log("[v0] API não disponível, usando dados mock")
          }
        }

        const filteredResults = mockChurches.filter(
          (church) =>
            church.name.toLowerCase().includes(query.toLowerCase()) ||
            church.address.toLowerCase().includes(query.toLowerCase()) ||
            church.city?.toLowerCase().includes(query.toLowerCase()) ||
            church.state?.toLowerCase().includes(query.toLowerCase()),
        )

        setResults(filteredResults)
        setShowResults(true)
      } catch (error) {
        console.error("[v0] Erro ao buscar igrejas:", error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelectChurch = (church: Church) => {
    setQuery(church.name)
    setShowResults(false)
    onSelectChurch?.(church)
  }

  return (
    <div ref={searchRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          className="pl-12 pr-12 h-14 text-base border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm text-gray-900 placeholder:text-gray-500"
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-600 animate-spin" />
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-[500px] overflow-y-auto">
          <div className="py-2">
            {results.map((church) => (
              <button
                key={church.id}
                onClick={() => handleSelectChurch(church)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3 border-b border-gray-100 last:border-b-0"
              >
                <div className="bg-emerald-50 rounded-lg p-2 flex-shrink-0">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 mb-1">{church.name}</p>
                  <p className="text-xs text-gray-600 line-clamp-1">
                    {church.address}
                    {church.city && `, ${church.city}`}
                    {church.state && ` - ${church.state}`}
                  </p>
                  {church.distance && <p className="text-xs text-emerald-600 font-medium mt-1">{church.distance}</p>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {showResults && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-2xl border border-gray-200">
          <div className="p-6 text-center">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-900 mb-1">Nenhuma igreja encontrada</p>
            <p className="text-xs text-gray-500">Tente buscar por outra cidade ou nome</p>
          </div>
        </div>
      )}
    </div>
  )
}
