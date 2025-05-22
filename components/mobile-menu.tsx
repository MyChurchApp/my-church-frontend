"use client"

import { useState, useEffect } from "react"
import { Menu, X, ChevronRight, Layers, Users, Calendar, BarChart, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/contexts/language-context"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

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

  const menuItems = [
    {
      href: "#funcionalidades",
      label: t("nav.features"),
      icon: <Layers className="h-5 w-5" />,
    },
    {
      href: "#detalhes",
      label: t("nav.details"),
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      href: "#tamanhos",
      label: t("nav.churches"),
      icon: <Users className="h-5 w-5" />,
    },
    {
      href: "#implementacao",
      label: t("nav.implementation"),
      icon: <Settings className="h-5 w-5" />,
    },
    {
      href: "#planos",
      label: t("nav.plans"),
      icon: <Calendar className="h-5 w-5" />,
    },
  ]

  return (
    <>
      <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu} aria-label="Menu">
        <Menu className="h-5 w-5" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] md:hidden"
              onClick={closeMenu}
              aria-hidden="true"
            />

            {/* Mobile menu panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-[90%] max-w-sm bg-white dark:bg-gray-900 shadow-xl z-[9999] md:hidden flex flex-col"
              style={{ backgroundColor: "white" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <Logo size="md" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeMenu}
                  className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto py-4">
                <nav className="px-4">
                  <ul className="space-y-1">
                    {menuItems.map((item, index) => (
                      <li key={index}>
                        <a
                          href={item.href}
                          className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          onClick={closeMenu}
                        >
                          <div className="flex items-center">
                            <span className="mr-3 text-gray-500">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>

                {/* Call to action buttons */}
                <div className="px-8 mt-8 space-y-3">
                  <Button asChild variant="outline" className="w-full justify-between">
                    <Link href="/login" onClick={closeMenu}>
                      <span>{t("btn.login")}</span>
                      <ChevronRight className="h-4 w-4 ml-2 opacity-70" />
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-between">
                    <Link href="/cadastro" onClick={closeMenu}>
                      <span>{t("btn.getStarted")}</span>
                      <ChevronRight className="h-4 w-4 ml-2 opacity-70" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t flex items-center justify-between">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
