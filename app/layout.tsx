import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/components/language-provider"
import { Toaster } from "@/components/ui/sonner"
import { Provider } from "react-redux"
import StoreProvider from "./providers/StoreProvider"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Retail Import Management System",
  description: "Complete Buy-Sell Management Platform",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <StoreProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Toaster
            position="top-right"
            expand={false}
            richColors
            closeButton
          />
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
        </StoreProvider>
        <Analytics />
      </body>
    </html>
  )
}
