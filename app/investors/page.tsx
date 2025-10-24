"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, PieChartIcon } from "lucide-react"
import { InvestorDialog } from "@/components/investor-dialog"
import { InvestorTable } from "@/components/investor-table"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { useLanguage } from "@/components/language-provider"

interface Investor {
  id: string
  name: string
  email: string
  phone: string
  sharePercentage: number
  investmentAmount: number
  joinDate: string
  status: "active" | "inactive"
  notes: string
}

const initialInvestors: Investor[] = [
  {
    id: "1",
    name: "Investor A",
    email: "investor.a@example.com",
    phone: "+880-1700-000001",
    sharePercentage: 35,
    investmentAmount: 3500000,
    joinDate: "2024-01-15",
    status: "active",
    notes: "Primary investor",
  },
  {
    id: "2",
    name: "Investor B",
    email: "investor.b@example.com",
    phone: "+880-1700-000002",
    sharePercentage: 30,
    investmentAmount: 3000000,
    joinDate: "2024-02-20",
    status: "active",
    notes: "Co-investor",
  },
  {
    id: "3",
    name: "Investor C",
    email: "investor.c@example.com",
    phone: "+880-1700-000003",
    sharePercentage: 25,
    investmentAmount: 2500000,
    joinDate: "2024-03-10",
    status: "active",
    notes: "Strategic investor",
  },
  {
    id: "4",
    name: "Business Owner",
    email: "owner@example.com",
    phone: "+880-1700-000004",
    sharePercentage: 10,
    investmentAmount: 1000000,
    joinDate: "2024-01-01",
    status: "active",
    notes: "Founder and owner",
  },
]

export default function InvestorsPage() {
  const { t } = useLanguage()
  const [investors, setInvestors] = useState<Investor[]>(initialInvestors)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingInvestor, setEditingInvestor] = useState<Investor | null>(null)

  const filteredInvestors = investors.filter(
    (investor) =>
      investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investor.phone.includes(searchTerm),
  )

  const handleAddInvestor = (newInvestor: Omit<Investor, "id">) => {
    const investor: Investor = {
      ...newInvestor,
      id: Date.now().toString(),
    }
    setInvestors([...investors, investor])
    setIsDialogOpen(false)
  }

  const handleEditInvestor = (updatedInvestor: Investor) => {
    setInvestors(investors.map((i) => (i.id === updatedInvestor.id ? updatedInvestor : i)))
    setEditingInvestor(null)
    setIsDialogOpen(false)
  }

  const handleDeleteInvestor = (id: string) => {
    setInvestors(investors.filter((i) => i.id !== id))
  }

  const handleOpenDialog = (investor?: Investor) => {
    if (investor) {
      setEditingInvestor(investor)
    } else {
      setEditingInvestor(null)
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingInvestor(null)
  }

  const stats = {
    totalInvestors: investors.length,
    activeInvestors: investors.filter((i) => i.status === "active").length,
    totalInvestment: investors.reduce((sum, i) => sum + i.investmentAmount, 0),
    averageShare: (investors.reduce((sum, i) => sum + i.sharePercentage, 0) / investors.length).toFixed(1),
  }

  const chartData = investors.map((investor) => ({
    name: investor.name,
    value: investor.sharePercentage,
  }))

  const colors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"]

  return (
    <div className="flex min-h-screen bg-background flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 overflow-auto w-full">
        <div className="sticky top-0 z-30 bg-card border-b border-border p-4 md:p-6">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground">{t("investors")}</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Manage investor profiles and track equity shares
          </p>
        </div>

        <div className="p-4 md:p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Investors</CardTitle>
                <PieChartIcon className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalInvestors}</div>
                <p className="text-xs text-muted-foreground mt-1">{stats.activeInvestors} active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
                <PieChartIcon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">৳ {(stats.totalInvestment / 1000000).toFixed(1)}M</div>
                <p className="text-xs text-muted-foreground mt-1">Combined capital</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Investors</CardTitle>
                <PieChartIcon className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeInvestors}</div>
                <p className="text-xs text-muted-foreground mt-1">Currently active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Share</CardTitle>
                <PieChartIcon className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageShare}%</div>
                <p className="text-xs text-muted-foreground mt-1">Average equity share</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Equity Distribution</CardTitle>
                <CardDescription>Share percentage breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Investment Summary</CardTitle>
                <CardDescription>Capital contribution by investor</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <div className="space-y-4">
                  {investors.map((investor, index) => (
                    <div key={investor.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: colors[index % colors.length] }}
                        />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{investor.name}</p>
                          <p className="text-xs text-muted-foreground">{investor.sharePercentage}% equity</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="font-semibold">৳ {investor.investmentAmount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{investor.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Add */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => handleOpenDialog()} className="gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              Add Investor
            </Button>
          </div>

          {/* Investors Table */}
          <Card>
            <CardHeader>
              <CardTitle>Investor Directory</CardTitle>
              <CardDescription>{filteredInvestors.length} investors found</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <InvestorTable investors={filteredInvestors} onEdit={handleOpenDialog} onDelete={handleDeleteInvestor} />
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Investor Dialog */}
      <InvestorDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSave={editingInvestor ? handleEditInvestor : handleAddInvestor}
        investor={editingInvestor}
      />
    </div>
  )
}
