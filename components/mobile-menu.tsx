"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/contexts/language-context"
import Link from "next/link"

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useLanguage()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Menu</span>
      </Button>

      {/* Overlay with high z-index */}
      {isOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[9998] md:hidden" onClick={toggleMenu} />
      )}

      {/* Mobile menu */}
      <div
        className={`fixed inset-y-0 right-0 w-full max-w-xs bg-background p-6 shadow-lg transform transition-transform duration-200 ease-in-out z-[9999] md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <Logo size="md" />
          <Button variant="ghost" size="icon" onClick={toggleMenu} className="rounded-full">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <nav className="flex flex-col space-y-4 mb-8">
          <a href="#funcionalidades" className="px-4 py-2 font-medium hover:bg-muted rounded-md" onClick={toggleMenu}>
            {t("nav.features")}
          </a>
          <a href="#detalhes" className="px-4 py-2 font-medium hover:bg-muted rounded-md" onClick={toggleMenu}>
            {t("nav.details")}
          </a>
          <a href="#tamanhos" className="px-4 py-2 font-medium hover:bg-muted rounded-md" onClick={toggleMenu}>
            {t("nav.churches")}
          </a>
          <a href="#implementacao" className="px-4 py-2 font-medium hover:bg-muted rounded-md" onClick={toggleMenu}>
            {t("nav.implementation")}
          </a>
          <a href="#planos" className="px-4 py-2 font-medium hover:bg-muted rounded-md" onClick={toggleMenu}>
            {t("nav.plans")}
          </a>
        </nav>

        <div className="flex flex-col space-y-4">
          <Button variant="outline" asChild className="w-full">
            <Link href="/login">{t("btn.login")}</Link>
          </Button>
          <Button asChild className="w-full">
            <Link href="/cadastro">{t("btn.getStarted")}</Link>
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t flex justify-between">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </>
  )
}
