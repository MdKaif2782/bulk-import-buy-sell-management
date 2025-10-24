"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Download, TrendingDown } from "lucide-react"
import { ExpenseDialog } from "@/components/expense-dialog"
import { ExpenseTable } from "@/components/expense-table"
import { useLanguage } from "@/components/language-provider"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface Expense {
  id: string
  date: string
  category: string
  description: string
  amount: number
  paymentMethod: string
  status: "pending" | "approved" | "rejected"
  notes: string
}

const initialExpenses: Expense[] = [
  {
    id: "1",
    date: "2025-01-20",
    category: "Printing",
    description: "Business cards and letterheads",
    amount: 8000,
    paymentMethod: "Bank Transfer",
    status: "approved",
    notes: "Quarterly printing supplies",
  },
  {
    id: "2",
    date: "2025-01-18",
    category: "Transport",
    description: "Delivery vehicle fuel",
    amount: 5000,
    paymentMethod: "Cash",
    status: "approved",
    notes: "Weekly fuel expense",
  },
  {
    id: "3",
    date: "2025-01-15",
    category: "Office",
    description: "Office supplies and stationery",
    amount: 3500,
    paymentMethod: "Credit Card",
    status: "approved",
    notes: "Monthly office supplies",
  },
  {
    id: "4",
    date: "2025-01-12",
    category: "Transport",
    description: "Courier service",
    amount: 2500,
    paymentMethod: "Bank Transfer",
    status: "approved",
    notes: "Shipment to customers",
  },
  {
    id: "5",
    date: "2025-01-10",
    category: "Utilities",
    description: "Electricity bill",
    amount: 12000,
    paymentMethod: "Bank Transfer",
    status: "pending",
    notes: "Monthly utility bill",
  },
  {
    id: "6",
    date: "2025-01-08",
    category: "Miscellaneous",
    description: "Office maintenance",
    amount: 4000,
    paymentMethod: "Cash",
    status: "approved",
    notes: "Cleaning and maintenance",
  },
]

const expenseCategories = ["Printing", "Transport", "Office", "Utilities", "Miscellaneous", "Marketing", "Maintenance"]

export default function ExpensesPage() {
  const { t } = useLanguage()
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const filteredExpenses = expenses.filter(
    (expense) =>
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.date.includes(searchTerm),
  )

  const handleAddExpense = (newExpense: Omit<Expense, "id">) => {
    const expense: Expense = {
      ...newExpense,
      id: Date.now().toString(),
    }
    setExpenses([...expenses, expense])
    setIsDialogOpen(false)
  }

  const handleEditExpense = (updatedExpense: Expense) => {
    setExpenses(expenses.map((e) => (e.id === updatedExpense.id ? updatedExpense : e)))
    setEditingExpense(null)
    setIsDialogOpen(false)
  }

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter((e) => e.id !== id))
  }

  const handleOpenDialog = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense)
    } else {
      setEditingExpense(null)
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingExpense(null)
  }

  // Calculate statistics
  const stats = {
    totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
    approvedExpenses: expenses.filter((e) => e.status === "approved").reduce((sum, e) => sum + e.amount, 0),
    pendingExpenses: expenses.filter((e) => e.status === "pending").reduce((sum, e) => sum + e.amount, 0),
    expenseCount: expenses.length,
  }

  // Category breakdown
  const categoryData = expenseCategories.map((category) => ({
    name: category,
    value: expenses.filter((e) => e.category === category).reduce((sum, e) => sum + e.amount, 0),
  }))

  // Monthly trend
  const monthlyData = [
    { month: "Jan", expenses: expenses.reduce((sum, e) => sum + e.amount, 0) },
    { month: "Feb", expenses: 45000 },
    { month: "Mar", expenses: 52000 },
    { month: "Apr", expenses: 48000 },
    { month: "May", expenses: 55000 },
    { month: "Jun", expenses: 60000 },
  ]

  const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  return (
    <div className="flex min-h-screen bg-background flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 overflow-auto w-full">
        <div className="sticky top-0 z-30 bg-card border-b border-border p-4 md:p-6">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground">{t("expenses")}</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Track business expenses and generate financial reports
          </p>
        </div>

        <div className="p-4 md:p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">৳ {(stats.totalExpenses / 1000).toFixed(0)}K</div>
                <p className="text-xs text-muted-foreground mt-1">{stats.expenseCount} transactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <TrendingDown className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">৳ {(stats.approvedExpenses / 1000).toFixed(0)}K</div>
                <p className="text-xs text-muted-foreground mt-1">Verified expenses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <TrendingDown className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">৳ {(stats.pendingExpenses / 1000).toFixed(0)}K</div>
                <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Expense</CardTitle>
                <TrendingDown className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ৳ {(stats.totalExpenses / stats.expenseCount).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Per transaction</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Expense Trend</CardTitle>
                <CardDescription>Last 6 months expense overview</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="expenses" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense by Category</CardTitle>
                <CardDescription>Category breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData.filter((c) => c.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ৳${(value / 1000).toFixed(0)}K`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `৳ ${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Category Summary */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Category Summary</CardTitle>
              <CardDescription>Expense breakdown by category</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="space-y-3">
                {categoryData
                  .filter((c) => c.value > 0)
                  .sort((a, b) => b.value - a.value)
                  .map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: colors[index % colors.length] }}
                        />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold">৳ {category.value.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {((category.value / stats.totalExpenses) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Search and Add */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by description, category, or date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="gap-2 w-full sm:w-auto">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
            <Button onClick={() => handleOpenDialog()} className="gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              Add Expense
            </Button>
          </div>

          {/* Expenses Table */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Records</CardTitle>
              <CardDescription>{filteredExpenses.length} expenses found</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <ExpenseTable expenses={filteredExpenses} onEdit={handleOpenDialog} onDelete={handleDeleteExpense} />
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Expense Dialog */}
      <ExpenseDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSave={editingExpense ? handleEditExpense : handleAddExpense}
        expense={editingExpense}
        categories={expenseCategories}
      />
    </div>
  )
}
