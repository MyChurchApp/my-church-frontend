"use client"

import { useEffect } from "react"

export default function ScrollToSection() {
  useEffect(() => {
    // Função para rolagem suave
    const handleSmoothScroll = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      // Verifica se o elemento clicado é um link de navegação interna
      if (target.tagName === "A" && target.getAttribute("href")?.startsWith("#")) {
        e.preventDefault()

        const targetId = target.getAttribute("href")
        const targetElement = document.querySelector(targetId as string)

        if (targetElement) {
          // Rolagem suave para o elemento
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })

          // Atualiza a URL sem recarregar a página
          window.history.pushState(null, "", targetId)
        }
      }
    }

    // Adiciona o event listener para todos os links
    document.addEventListener("click", handleSmoothScroll)

    // Limpa o event listener quando o componente é desmontado
    return () => {
      document.removeEventListener("click", handleSmoothScroll)
    }
  }, [])

  return null
}
