"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, PieChartIcon, Loader2, Eye, DollarSign, History, Activity } from "lucide-react"
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
  useGetInvestorDueSummaryQuery,
  usePayInvestorMutation,
} from "@/lib/store/api/investorsApi"
import {
  Investor as ApiInvestor,
  InvestorStatistics,
  InvestorPerformance,
  EquityDistribution,
  CreateInvestorData,
  UpdateInvestorData,
  DueSummary,
  CreateInvestorPaymentData,
  PaymentMethod,
} from "@/types/investor"

// Local type for form data
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

// Payment Dialog Component
interface PaymentDialogProps {
  isOpen: boolean
  onClose: () => void
  onPay: (data: CreateInvestorPaymentData) => Promise<void>
  dueAmount: number
  isLoading: boolean
}

function PaymentDialog({ isOpen, onClose, onPay, dueAmount, isLoading }: PaymentDialogProps) {
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.BANK_TRANSFER)
  const [reference, setReference] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onPay({
      amount: parseFloat(amount),
      description,
      paymentMethod,
      reference: reference || undefined,
    })
    handleClose()
  }

  const handleClose = () => {
    setAmount("")
    setDescription("")
    setReference("")
    setPaymentMethod(PaymentMethod.BANK_TRANSFER)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Make Payment</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Amount</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Maximum: ৳${dueAmount.toLocaleString()}`}
              max={dueAmount}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full p-2 border rounded-md"
            >
              <option value={PaymentMethod.CASH}>Cash</option>
              <option value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</option>
              <option value={PaymentMethod.CHEQUE}>Cheque</option>
              <option value={PaymentMethod.CARD}>Card</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Payment description"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Reference (Optional)</label>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Transaction reference"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !amount || parseFloat(amount) > dueAmount}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
              Process Payment
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Investor Details Dialog Component
interface InvestorDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  investorId: string | null
}

function InvestorDetailsDialog({ isOpen, onClose, investorId }: InvestorDetailsDialogProps) {
  const { data: dueSummary, isLoading } = useGetInvestorDueSummaryQuery(investorId!, {
    skip: !investorId,
  })
  const [payInvestor, { isLoading: isPaying }] = usePayInvestorMutation()
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)

  const handlePayment = async (paymentData: CreateInvestorPaymentData) => {
    if (!investorId) return
    try {
      await payInvestor({ id: investorId, data: paymentData }).unwrap()
      setShowPaymentDialog(false)
    } catch (error) {
      console.error("Failed to process payment:", error)
    }
  }

  if (!isOpen || !investorId) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : dueSummary ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold">{dueSummary.investor.name}</h3>
                  <p className="text-muted-foreground">{dueSummary.investor.email}</p>
                </div>
                <Button onClick={onClose} variant="outline">
                  Close
                </Button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total Investment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">৳{dueSummary.summary.totalInvestment.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total Due</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      ৳{dueSummary.summary.totalDue.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Payable Now</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      ৳{dueSummary.summary.payableNow.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">ROI</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {dueSummary.summary.overallROI.toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Pay Button */}
              {dueSummary.summary.payableNow > 0 && (
                <Button 
                  onClick={() => setShowPaymentDialog(true)}
                  className="w-full"
                  size="lg"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Pay ৳{dueSummary.summary.payableNow.toLocaleString()} Now
                </Button>
              )}

              {/* Investment Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Investment Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dueSummary.investmentBreakdown.map((investment) => (
                      <div key={investment.investmentId} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{investment.poNumber}</h4>
                            <p className="text-sm text-muted-foreground">{investment.vendorName}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">৳{investment.investmentAmount.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">{investment.profitPercentage}% Profit</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Profit Earned:</span>
                            <p className="font-medium">৳{investment.profitEarned.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Payable Now:</span>
                            <p className="font-medium">৳{investment.payableNow.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">ROI:</span>
                            <p className="font-medium">{investment.roi.toFixed(1)}%</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Status:</span>
                            <p className="font-medium">{investment.poStatus}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Payment History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Payment History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dueSummary.paymentHistory.map((payment) => (
                      <div key={payment.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-medium">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                          <p className="text-sm text-muted-foreground">{payment.description}</p>
                          {payment.paymentMethod && (
                            <p className="text-xs text-muted-foreground">{payment.paymentMethod}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">৳{payment.amount.toLocaleString()}</p>
                          {payment.reference && (
                            <p className="text-xs text-muted-foreground">Ref: {payment.reference}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dueSummary.recentActivity.map((activity, index) => (
                      <div key={index} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-medium">{activity.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(activity.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">৳{activity.amount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {activity.type.toLowerCase().replace(/_/g, ' ')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div>No data found</div>
          )}
        </div>
      </div>

      {/* Payment Dialog */}
      <PaymentDialog
        isOpen={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        onPay={handlePayment}
        dueAmount={dueSummary?.summary.payableNow || 0}
        isLoading={isPaying}
      />
    </>
  )
}

export default function InvestorsPage() {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingInvestor, setEditingInvestor] = useState<ApiInvestor | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedInvestorId, setSelectedInvestorId] = useState<string | null>(null)

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

  const handleViewDetails = (investor: ApiInvestor) => {
    setSelectedInvestorId(investor.id)
    setDetailsDialogOpen(true)
  }

  const handleCloseDetailsDialog = () => {
    setDetailsDialogOpen(false)
    setSelectedInvestorId(null)
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
              Manage investor profiles, track equity shares, and process payments
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
                  onViewDetails={handleViewDetails}
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

        {/* Investor Details Dialog */}
        <InvestorDetailsDialog
          isOpen={detailsDialogOpen}
          onClose={handleCloseDetailsDialog}
          investorId={selectedInvestorId}
        />
      </div>
    </ProtectedRoute>
  )
}