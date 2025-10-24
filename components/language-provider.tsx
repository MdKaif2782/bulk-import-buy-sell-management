"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "bn"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  en: {
    dashboard: "Dashboard",
    products: "Products & Stock",
    purchases: "Purchases & Imports",
    investors: "Investors",
    quotations: "Quotations",
    billing: "Billing & Challan",
    expenses: "Expenses",
    reports: "Reports",
    settings: "Settings",
    language: "Language",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    restock: "Restock",
    system: "System",
    english: "English",
    bangla: "বাংলা",
    retailImport: "Wholesale Import Management",
    rims: "WIMS",
    copyright: "© 2025 RIMS",
    menu: "Menu",
    close: "Close",
  },
  bn: {
    dashboard: "ড্যাশবোর্ড",
    products: "পণ্য ও স্টক",
    purchases: "ক্রয় ও আমদানি",
    investors: "বিনিয়োগকারী",
    quotations: "উদ্ধৃতি",
    billing: "বিলিং ও চালান",
    expenses: "খরচ",
    reports: "রিপোর্ট",
    restock: "পুনঃস্টক",
    settings: "সেটিংস",
    language: "ভাষা",
    theme: "থিম",
    light: "হালকা",
    dark: "অন্ধকার",
    system: "সিস্টেম",
    english: "English",
    bangla: "বাংলা",
    retailImport: "পাইকারি আমদানি ব্যবস্থাপনা",
    rims: "WIMS",
    copyright: "© 2025 RIMS",
    menu: "মেনু",
    close: "বন্ধ করুন",
  },
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("language") as Language | null
    if (saved && (saved === "en" || saved === "bn")) {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)["en"]] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}
