"use client"

import { useState, useEffect } from "react"
import { Menu, X, Layers, Users, Calendar, BarChart, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/contexts/language-context"
import Link from "next/link"

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useLanguage()

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  return (
    <>
      {/* Menu Button */}
      <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Menu</span>
      </Button>

      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-[99999]" onClick={closeMenu} />}

      {/* Mobile Menu Panel */}
      <div
        className={`fixed top-0 bottom-0 right-0 w-[90%] max-w-sm z-[999999] shadow-2xl transition-transform duration-300 ease-in-out h-screen ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ height: "100vh", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-gray-500 border-b border-gray-600">
          <Logo size="md" className="text-white" />
          <Button variant="ghost" size="icon" onClick={closeMenu} className="text-white hover:bg-gray-600 rounded-full">
            <X className="h-5 w-5" />
            <span className="sr-only">Fechar</span>
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-grow bg-gray-500 overflow-y-auto">
          <nav className="h-full">
            <ul className="space-y-1 p-4">
              <li>
                <a
                  href="#funcionalidades"
                  className="flex items-center py-3 px-4 text-white hover:bg-gray-600 rounded-md transition-colors"
                  onClick={closeMenu}
                >
                  <Layers className="h-5 w-5 mr-3" />
                  <span className="font-medium">{t("nav.features")}</span>
                </a>
              </li>
              <li>
                <a
                  href="#detalhes"
                  className="flex items-center py-3 px-4 text-white hover:bg-gray-600 rounded-md transition-colors"
                  onClick={closeMenu}
                >
                  <BarChart className="h-5 w-5 mr-3" />
                  <span className="font-medium">{t("nav.details")}</span>
                </a>
              </li>
              <li>
                <a
                  href="#tamanhos"
                  className="flex items-center py-3 px-4 text-white hover:bg-gray-600 rounded-md transition-colors"
                  onClick={closeMenu}
                >
                  <Users className="h-5 w-5 mr-3" />
                  <span className="font-medium">{t("nav.churches")}</span>
                </a>
              </li>
              <li>
                <a
                  href="#implementacao"
                  className="flex items-center py-3 px-4 text-white hover:bg-gray-600 rounded-md transition-colors"
                  onClick={closeMenu}
                >
                  <Settings className="h-5 w-5 mr-3" />
                  <span className="font-medium">{t("nav.implementation")}</span>
                </a>
              </li>
              <li>
                <a
                  href="#planos"
                  className="flex items-center py-3 px-4 text-white hover:bg-gray-600 rounded-md transition-colors"
                  onClick={closeMenu}
                >
                  <Calendar className="h-5 w-5 mr-3" />
                  <span className="font-medium">{t("nav.plans")}</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Action Buttons */}
        <div className="p-4 space-y-3 bg-gray-500 border-t border-gray-600">
          <Button variant="outline" asChild className="w-full bg-white hover:bg-gray-100 h-11">
            <Link href="/login" onClick={closeMenu} className="font-medium">
              {t("btn.login")}
            </Link>
          </Button>
          <Button asChild className="w-full h-11">
            <Link href="/cadastro" onClick={closeMenu} className="font-medium">
              {t("btn.getStarted")}
            </Link>
          </Button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-white">
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <span className="text-sm text-gray-500">|</span>
            <ThemeToggle />
          </div>
          <div className="text-xs text-gray-500">© {new Date().getFullYear()} MyChurch</div>
        </div>
      </div>
    </>
  )
}
