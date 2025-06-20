"use client";
import { useState, useEffect } from "react";
import DarkModeToggle from "./DarkModeToggle";
import { Church, Menu } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  const headerClasses = `fixed w-full z-30 top-0 ${
    isScrolled ? "header-scrolled" : "header-transparent"
  }`;

  return (
    <header id="main-header" className={headerClasses}>
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <a
          href="#"
          className={`text-2xl font-bold transition-colors duration-300 z-10 flex items-center ${
            isScrolled ? "brand-text text-blue-600" : "text-white"
          }`}
        >
          <Church className="mr-2 h-6 w-6" />
          MyChurchaa
        </a>
        <div className="hidden md:flex items-center space-x-8">
          <a href="#video" className="nav-link font-medium hover:text-blue-200" onClick={closeMenu}>Demonstração</a>
          <a href="#features" className="nav-link font-medium hover:text-blue-200" onClick={closeMenu}>Funcionalidades</a>
          <a href="#plans" className="nav-link font-medium hover:text-blue-200" onClick={closeMenu}>Planos</a>
        </div>
        <div className="flex items-center space-x-3">
          <DarkModeToggle isScrolled={isScrolled} />
          <div className="hidden md:flex items-center space-x-3">
            <a href="/login" className={`px-5 py-2 font-semibold rounded-lg transition duration-300 ${isScrolled ? "hover:bg-gray-200 dark:hover:bg-gray-700" : "text-white hover:bg-white/20"}`}>Login</a>
            <a href="#launch" className="px-5 py-2 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-100 dark:hover:bg-blue-200 transition duration-300 shadow-md">Seja Notificado</a>
          </div>
          <button
            id="mobile-menu-button"
            className={`md:hidden focus:outline-none z-10 ml-2 ${isScrolled ? "text-text-primary" : "text-white"}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {/* ÁREA CORRIGIDA */}
      <div
        className={`${
          isMenuOpen ? "" : "hidden"
        } md:hidden bg-white dark:bg-gray-900 shadow-lg px-6 pb-4`}
      >
        <a href="#video" className="block py-2 text-text-secondary hover:text-blue-600" onClick={closeMenu}>Demonstração</a>
        <a href="#features" className="block py-2 text-text-secondary hover:text-blue-600" onClick={closeMenu}>Funcionalidades</a>
        <a href="#plans" className="block py-2 text-text-secondary hover:text-blue-600" onClick={closeMenu}>Planos</a>
        <div className="mt-4 pt-4 border-t border-border-color">
          <a href="/login" className="block w-full text-center mb-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 dark:text-white dark:border-white dark:hover:bg-gray-700" onClick={closeMenu}>Login</a>
          <a href="#launch" className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={closeMenu}>Seja Notificado</a>
        </div>
      </div>
    </header>
  );
};

export default Header;
