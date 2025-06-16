// app/components/DarkModeToggle.tsx
"use client";
import { useState, useEffect } from "react";

const DarkModeToggle = ({ isScrolled }: { isScrolled: boolean }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setIsDarkMode(!isDarkMode);
  };

  return (
    <button
      onClick={toggleDarkMode}
      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 nav-link ${
        isScrolled
          ? "text-text-secondary hover:bg-gray-200 dark:hover:bg-gray-700"
          : "text-white hover:bg-white/20"
      }`}
    >
      <i className={`fas ${isDarkMode ? "fa-sun" : "fa-moon"}`}></i>
    </button>
  );
};

export default DarkModeToggle;
