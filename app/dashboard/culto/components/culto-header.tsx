"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Menu } from "lucide-react"

interface CultoHeaderProps {
  title: string
  backUrl?: string
}

export default function CultoHeader({ title, backUrl = "/dashboard" }: CultoHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Header com botão de voltar e menu mobile */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link href={backUrl} className="md:hidden">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-4 w-4 mr-2" />
            Menu
          </Button>
        </div>
      </div>

      {/* Menu mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden mb-4 bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-col space-y-2">
            <Link
              href="/dashboard/culto"
              className={`py-2 px-3 rounded-md ${
                title === "Acompanhar Culto"
                  ? "text-blue-600 font-medium bg-blue-50"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Acompanhar Culto
            </Link>
            <Link
              href="/dashboard/culto/gestao"
              className={`py-2 px-3 rounded-md ${
                title === "Gestão de Culto" ? "text-blue-600 font-medium bg-blue-50" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Gestão de Culto
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
