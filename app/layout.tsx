import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/components/language-provider"
import { Toaster } from "@/components/ui/sonner"
import StoreProvider from "./providers/StoreProvider"
import { AuthGuard } from "@/components/AuthGuard"

import { Poppins } from "next/font/google"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
})

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
      <body className={`${poppins.variable} font-sans antialiased`} suppressHydrationWarning>
        <StoreProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Toaster
              position="top-right"
              expand={false}
              richColors
              closeButton
            />
            <LanguageProvider>
              <AuthGuard>{children}</AuthGuard>
            </LanguageProvider>
          </ThemeProvider>
        </StoreProvider>
        <Analytics />
      </body>
    </html>
  )
}
