"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { useLanguage } from "./language-provider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { t } = useLanguage()

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setTheme("light")}
        className={`p-2 rounded-lg transition-colors ${
          theme === "light" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
        }`}
        title={t("light")}
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-2 rounded-lg transition-colors ${
          theme === "dark" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
        }`}
        title={t("dark")}
      >
        <Moon className="w-4 h-4" />
      </button>
    </div>
  )
}
