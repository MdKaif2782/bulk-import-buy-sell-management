"use client"

import { useLanguage } from "./language-provider"

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLanguage("en")}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          language === "en" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
        }`}
      >
        {t("english")}
      </button>
      <button
        onClick={() => setLanguage("bn")}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          language === "bn" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
        }`}
      >
        {t("bangla")}
      </button>
    </div>
  )
}
