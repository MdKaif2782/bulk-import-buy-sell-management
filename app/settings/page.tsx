"use client"

import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Save, Moon, Sun, Globe } from "lucide-react"
import { useTheme } from "next-themes"
import { useLanguage } from "@/components/language-provider"
import { useState } from "react"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const [taxRate, setTaxRate] = useState("5")
  const [cashDiscount, setCashDiscount] = useState("2")
  const [duePaymentDays, setDuePaymentDays] = useState("30")
  const [latePaymentPenalty, setLatePaymentPenalty] = useState("2")
  const [usdRate, setUsdRate] = useState("120")
  const [inrRate, setInrRate] = useState("1.5")
  const [rmbRate, setRmbRate] = useState("17")

  return (
    <div className="flex min-h-screen bg-background flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 overflow-auto w-full">
        <div className="sticky top-0 z-30 bg-card border-b border-border p-4 md:p-6">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground">{t("settings")}</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Configure system rules and preferences</p>
        </div>

        <div className="p-4 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sun className="w-5 h-5" />
                  {t("theme")}
                </CardTitle>
                <CardDescription>Choose your preferred display mode</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => setTheme("light")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      theme === "light"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span className="text-sm font-medium">{t("light")}</span>
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      theme === "dark"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span className="text-sm font-medium">{t("dark")}</span>
                  </button>
                  <button
                    onClick={() => setTheme("system")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      theme === "system"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    <span className="text-sm font-medium">{t("system")}</span>
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  {t("language")}
                </CardTitle>
                <CardDescription>Select your preferred language</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => setLanguage("en")}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                      language === "en"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {t("english")}
                  </button>
                  <button
                    onClick={() => setLanguage("bn")}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                      language === "bn"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {t("bangla")}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Tax Configuration</CardTitle>
                <CardDescription>Set default tax rates for billing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Default Tax Rate (%)</label>
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tax Challan Percentage (%)</label>
                  <input
                    type="number"
                    defaultValue="5"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Investors</p>
                  <p className="text-2xl font-bold">4</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Products</p>
                  <p className="text-2xl font-bold">5</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Rule Engine</CardTitle>
                <CardDescription>Configure payment terms for due sales</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Cash Sale Discount (%)</label>
                  <input
                    type="number"
                    value={cashDiscount}
                    onChange={(e) => setCashDiscount(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Due Payment Days</label>
                  <input
                    type="number"
                    value={duePaymentDays}
                    onChange={(e) => setDuePaymentDays(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Late Payment Penalty (%)</label>
                  <input
                    type="number"
                    value={latePaymentPenalty}
                    onChange={(e) => setLatePaymentPenalty(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <Save className="w-4 h-4 mr-2" />
                  Save Rules
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Currency Settings</CardTitle>
                <CardDescription>Configure exchange rates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">USD to BDT</label>
                  <input
                    type="number"
                    value={usdRate}
                    onChange={(e) => setUsdRate(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">INR to BDT</label>
                  <input
                    type="number"
                    value={inrRate}
                    onChange={(e) => setInrRate(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">RMB to BDT</label>
                  <input
                    type="number"
                    value={rmbRate}
                    onChange={(e) => setRmbRate(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <Save className="w-4 h-4 mr-2" />
                  Update Rates
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
