"use client"

import { useState, useEffect, useRef } from "react"
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
  const menuRef = useRef<HTMLDivElement>(null)

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      // Salva a posição atual do scroll
      const scrollY = window.scrollY
      document.body.style.position = "fixed"
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = "100%"
      document.body.style.overflow = "hidden"
    } else {
      // Restaura o scroll
      const scrollY = document.body.style.top
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.width = ""
      document.body.style.overflow = ""
      if (scrollY) {
        window.scrollTo(0, Number.parseInt(scrollY || "0") * -1)
      }
    }

    // Cleanup function
    return () => {
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.width = ""
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
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
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-[99998]" onClick={closeMenu} style={{ touchAction: "none" }} />
      )}

      {/* Mobile Menu Panel */}
      <div
        ref={menuRef}
        className={`fixed top-0 bottom-0 right-0 w-[90%] max-w-sm z-[99999] shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          touchAction: "none",
        }}
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
        <div className="flex-grow bg-gray-500 overflow-y-auto" style={{ touchAction: "pan-y" }}>
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
          <Button variant="outline" asChild className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 h-11">
            <Link href="/cadastro" onClick={closeMenu} className="font-medium">
              Criar Conta
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
