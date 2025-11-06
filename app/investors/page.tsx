"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, PieChartIcon, Loader2 } from "lucide-react"
import { InvestorDialog } from "@/components/investor-dialog"
import { InvestorTable } from "@/components/investor-table"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { useLanguage } from "@/components/language-provider"
import { useAuth } from "@/hooks/useAuth"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import {
  useGetInvestorsQuery,
  useGetInvestorStatisticsQuery,
  useGetInvestorPerformanceQuery,
  useGetEquityDistributionQuery,
  useCreateInvestorMutation,
  useUpdateInvestorMutation,
  useDeleteInvestorMutation,
  useToggleInvestorStatusMutation,
} from "@/lib/store/api/investorsApi"
import type {
  Investor as ApiInvestor,
  InvestorStatistics,
  InvestorPerformance,
  EquityDistribution,
  CreateInvestorData,
  UpdateInvestorData,
} from "@/types/investor"

// Local type for form data (since API doesn't have all form fields)
interface InvestorFormData {
  name: string
  email: string
  phone: string
  address?: string
  taxId?: string
  bankAccount?: string
  bankName?: string
  isActive: boolean
}

export default function InvestorsPage() {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingInvestor, setEditingInvestor] = useState<ApiInvestor | null>(null)

  // API Queries
  const { data: investorsData, isLoading: isLoadingInvestors, refetch: refetchInvestors } = useGetInvestorsQuery({
    search: searchTerm || undefined,
  })
  
  const { data: statistics, isLoading: isLoadingStats } = useGetInvestorStatisticsQuery()
  const { data: performanceData, isLoading: isLoadingPerformance } = useGetInvestorPerformanceQuery()
  const { data: equityDistribution, isLoading: isLoadingEquity } = useGetEquityDistributionQuery()

  // API Mutations
  const [createInvestor, { isLoading: isCreating }] = useCreateInvestorMutation()
  const [updateInvestor, { isLoading: isUpdating }] = useUpdateInvestorMutation()
  const [deleteInvestor] = useDeleteInvestorMutation()
  const [toggleInvestorStatus] = useToggleInvestorStatusMutation()

  const investors = investorsData?.investors || []
  const filteredInvestors = investors.filter(investor =>
    investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    investor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    investor.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddInvestor = async (formData: InvestorFormData) => {
    try {
      const createData: CreateInvestorData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        taxId: formData.taxId,
        bankAccount: formData.bankAccount,
        bankName: formData.bankName,
        isActive: formData.isActive,
      }

      await createInvestor(createData).unwrap()
      setIsDialogOpen(false)
      refetchInvestors()
    } catch (error) {
      console.error("Failed to create investor:", error)
    }
  }

  const handleEditInvestor = async (formData: InvestorFormData) => {
    if (!editingInvestor) return

    try {
      const updateData: UpdateInvestorData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        taxId: formData.taxId,
        bankAccount: formData.bankAccount,
        bankName: formData.bankName,
        isActive: formData.isActive,
      }

      await updateInvestor({ id: editingInvestor.id, data: updateData }).unwrap()
      setEditingInvestor(null)
      setIsDialogOpen(false)
      refetchInvestors()
    } catch (error) {
      console.error("Failed to update investor:", error)
    }
  }

  const handleDeleteInvestor = async (id: string) => {
    try {
      await deleteInvestor(id).unwrap()
      refetchInvestors()
    } catch (error) {
      console.error("Failed to delete investor:", error)
      // You might want to show a toast notification here
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleInvestorStatus(id).unwrap()
      refetchInvestors()
    } catch (error) {
      console.error("Failed to toggle investor status:", error)
    }
  }

  const handleOpenDialog = (investor?: ApiInvestor) => {
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

  // Chart data preparation
  const equityChartData = equityDistribution?.map(item => ({
    name: item.investorName,
    value: item.sharePercentage,
    amount: item.amount,
  })) || []

  const performanceChartData = performanceData?.map(investor => ({
    name: investor.name,
    invested: investor.totalInvested,
    profit: investor.totalProfit,
    roi: investor.roi,
  })) || []

  const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

  return (
    <ProtectedRoute requiredRole="ADMIN">
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
            {/* Loading States */}
            {(isLoadingStats || isLoadingInvestors) && (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}

            {/* Stats Cards */}
            {statistics && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Investors</CardTitle>
                    <PieChartIcon className="h-4 w-4 text-accent" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statistics.summary.totalInvestors}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {statistics.summary.activeInvestors} active
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
                    <PieChartIcon className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">৳ {(statistics.summary.totalInvestment / 1000000).toFixed(1)}M</div>
                    <p className="text-xs text-muted-foreground mt-1">Combined capital</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Investors</CardTitle>
                    <PieChartIcon className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statistics.summary.activeInvestors}</div>
                    <p className="text-xs text-muted-foreground mt-1">Currently active</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Share</CardTitle>
                    <PieChartIcon className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statistics.summary.averageShare.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground mt-1">Average equity share</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
              {/* Equity Distribution Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Equity Distribution</CardTitle>
                  <CardDescription>Share percentage breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingEquity ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={equityChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {equityChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, "Share Percentage"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Performance Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Investment Performance</CardTitle>
                  <CardDescription>Capital contribution by investor</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingPerformance ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={performanceChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip formatter={(value) => [`৳ ${Number(value).toLocaleString()}`, "Amount"]} />
                        <Legend />
                        <Bar dataKey="invested" fill="#0088FE" name="Total Invested" />
                        <Bar dataKey="profit" fill="#00C49F" name="Total Profit" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Investor Summary List */}
            {statistics?.investorDetails && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Investment Summary</CardTitle>
                  <CardDescription>Capital contribution by investor</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <div className="space-y-4">
                    {statistics.investorDetails.map((investor, index) => (
                      <div key={investor.investorId} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: colors[index % colors.length] }}
                          />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{investor.investorName}</p>
                            <p className="text-xs text-muted-foreground">
                              {investor.sharePercentage.toFixed(1)}% equity • {investor.activeInvestments} active investments
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <p className="font-semibold">৳ {investor.totalInvested.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {investor.totalInvested > 0 ? "Active" : "No investments"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

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
              <Button 
                onClick={() => handleOpenDialog()} 
                className="gap-2 w-full sm:w-auto"
                disabled={isCreating || isUpdating}
              >
                {(isCreating || isUpdating) ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Add Investor
              </Button>
            </div>

            {/* Investors Table */}
            <Card>
              <CardHeader>
                <CardTitle>Investor Directory</CardTitle>
                <CardDescription>
                  {isLoadingInvestors ? "Loading..." : `${filteredInvestors.length} investors found`}
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <InvestorTable 
                  investors={filteredInvestors} 
                  onEdit={handleOpenDialog}
                  onDelete={handleDeleteInvestor}
                  onToggleStatus={handleToggleStatus}
                  isLoading={isLoadingInvestors}
                />
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
          isLoading={isCreating || isUpdating}
        />
      </div>
    </ProtectedRoute>
  )
}