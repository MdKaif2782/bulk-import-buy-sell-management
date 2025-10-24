"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  FileText,
  DollarSign,
  Settings,
  TrendingUp,
  Home,
  Menu,
  X,
  PackagePlus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useLanguage } from "./language-provider"

const navItemsKeys = [
  { href: "/", labelKey: "dashboard", icon: Home },
  { href: "/products", labelKey: "products", icon: Package },
  { href: "/purchases", labelKey: "purchases", icon: ShoppingCart },
  { href: "/restock", labelKey: "restock", icon: PackagePlus },
  { href: "/investors", labelKey: "investors", icon: Users },
  { href: "/quotations", labelKey: "quotations", icon: FileText },
  { href: "/billing", labelKey: "billing", icon: DollarSign },
  { href: "/expenses", labelKey: "expenses", icon: TrendingUp },
  { href: "/reports", labelKey: "reports", icon: BarChart3 },
  { href: "/settings", labelKey: "settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && <div className="md:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setIsOpen(false)} />}

      <aside
        className={cn(
          "fixed md:static w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border min-h-screen flex flex-col transition-transform duration-300 z-40",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-2xl font-bold text-sidebar-primary">{t("rims")}</h1>
          <p className="text-xs text-sidebar-foreground/60 mt-1">{t("retailImport")}</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItemsKeys.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{t(item.labelKey)}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/60">{t("copyright")}</p>
        </div>
      </aside>
    </>
  )
}
