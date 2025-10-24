"use client"

import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Eye, Download, CheckCircle } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

const bills = [
  {
    id: 1,
    billNo: "INV-2025-001",
    customer: "ABC Trading",
    amount: 85000,
    tax: 4250,
    total: 89250,
    status: "Paid",
    date: "2025-10-15",
    dueDate: "2025-10-20",
  },
  {
    id: 2,
    billNo: "INV-2025-002",
    customer: "XYZ Retail",
    amount: 125000,
    tax: 6250,
    total: 131250,
    status: "Pending",
    date: "2025-10-18",
    dueDate: "2025-10-25",
  },
  {
    id: 3,
    billNo: "INV-2025-003",
    customer: "Global Imports",
    amount: 65000,
    tax: 3250,
    total: 68250,
    status: "Overdue",
    date: "2025-10-10",
    dueDate: "2025-10-15",
  },
  {
    id: 4,
    billNo: "INV-2025-004",
    customer: "Local Distributor",
    amount: 180000,
    tax: 9000,
    total: 189000,
    status: "Paid",
    date: "2025-10-12",
    dueDate: "2025-10-17",
  },
]

export default function BillingPage() {
  const { t } = useLanguage()

  return (
    <div className="flex min-h-screen bg-background flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 overflow-auto w-full">
        <div className="sticky top-0 z-30 bg-card border-b border-border p-4 md:p-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-foreground">{t("billing")}</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Generate and manage invoices and delivery notes
            </p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 flex-shrink-0">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Bill</span>
          </Button>
        </div>

        <div className="p-4 md:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Paid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">৳ 4,77,750</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Bills & Invoices</CardTitle>
              <CardDescription>All generated bills with payment status</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Bill No</th>
                    <th className="text-left py-3 px-4 font-semibold">Customer</th>
                    <th className="text-right py-3 px-4 font-semibold">Amount</th>
                    <th className="text-right py-3 px-4 font-semibold">Tax</th>
                    <th className="text-right py-3 px-4 font-semibold">Total</th>
                    <th className="text-left py-3 px-4 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 font-semibold">Due Date</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-center py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill) => (
                    <tr key={bill.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{bill.billNo}</td>
                      <td className="py-3 px-4">{bill.customer}</td>
                      <td className="py-3 px-4 text-right">৳ {bill.amount}</td>
                      <td className="py-3 px-4 text-right">৳ {bill.tax}</td>
                      <td className="py-3 px-4 text-right font-semibold">৳ {bill.total}</td>
                      <td className="py-3 px-4">{bill.date}</td>
                      <td className="py-3 px-4">{bill.dueDate}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            bill.status === "Paid"
                              ? "bg-green-100 text-green-800"
                              : bill.status === "Pending"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {bill.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center flex gap-2 justify-center">
                        <button className="p-1 hover:bg-muted rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 hover:bg-muted rounded">
                          <Download className="w-4 h-4" />
                        </button>
                        {bill.status !== "Paid" && (
                          <button className="p-1 hover:bg-muted rounded text-green-600">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
