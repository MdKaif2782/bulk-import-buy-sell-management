"use client"

import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export default function ReportsPage() {
  const { t } = useLanguage()

  return (
    <div className="flex min-h-screen bg-background flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 overflow-auto w-full">
        <div className="sticky top-0 z-30 bg-card border-b border-border p-4 md:p-6">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground">{t("reports")}</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">View and export financial reports</p>
        </div>

        <div className="p-4 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Summary Report</CardTitle>
                <CardDescription>October 2025</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between py-2 border-b border-border">
                  <span>Total Purchase</span>
                  <span className="font-semibold">৳ 5,00,000</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span>Total Sales</span>
                  <span className="font-semibold">৳ 6,20,000</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span>Printing & Branding</span>
                  <span className="font-semibold">৳ 8,000</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span>Office & Staff</span>
                  <span className="font-semibold">৳ 12,000</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span>Transport & Misc</span>
                  <span className="font-semibold">৳ 10,000</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span>Tax Paid</span>
                  <span className="font-semibold">৳ 5,000</span>
                </div>
                <div className="flex justify-between py-3 bg-primary/10 px-3 rounded font-semibold">
                  <span>Net Profit</span>
                  <span>৳ 85,000</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Investor Profit (30%)</span>
                  <span className="font-semibold">৳ 25,500</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Business Profit</span>
                  <span className="font-semibold">৳ 59,500</span>
                </div>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-4">
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investor Profit Distribution</CardTitle>
                <CardDescription>October 2025</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between py-2 border-b border-border">
                  <span>Investor A (30%)</span>
                  <span className="font-semibold">৳ 25,500</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span>Investor B (25%)</span>
                  <span className="font-semibold">৳ 21,250</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span>Investor C (20%)</span>
                  <span className="font-semibold">৳ 17,000</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span>Investor D (15%)</span>
                  <span className="font-semibold">৳ 12,750</span>
                </div>
                <div className="flex justify-between py-3 bg-primary/10 px-3 rounded font-semibold">
                  <span>Total Distributed</span>
                  <span>৳ 76,500</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Business Retained</span>
                  <span className="font-semibold">৳ 8,500</span>
                </div>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-4">
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Available Reports</CardTitle>
              <CardDescription>Generate and download various business reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Profit & Loss Statement", desc: "Complete P&L analysis" },
                  { title: "Tax Summary Report", desc: "Tax calculations and payments" },
                  { title: "Stock Movement Report", desc: "Inventory changes" },
                  { title: "Investor Balance Sheet", desc: "Investment and returns" },
                  { title: "Currency Conversion Report", desc: "Import currency summary" },
                  { title: "Due Payment Report", desc: "Outstanding payments" },
                ].map((report, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{report.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{report.desc}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="flex-shrink-0 ml-2 bg-transparent">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
