"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  Search, 
  PieChartIcon, 
  Loader2, 
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Building
} from "lucide-react"
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
  useGetInvestorDueSummaryQuery,
  useGetDuePayablesQuery,
  useGetPaymentHistoryQuery,
  useCreateInvestorPaymentMutation,
  useCreatePayableMutation,
  useCreateInvestorMutation,
  useUpdateInvestorMutation,
  useDeleteInvestorMutation,
  useToggleInvestorStatusMutation,
} from "@/lib/store/api/investorsApi"
import {
  Investor as ApiInvestor,
  InvestorStatistics,
  InvestorPerformance,
  EquityDistribution,
  CreateInvestorData,
  UpdateInvestorData,
  InvestorDueSummary,
  InvestorPayable,
  InvestorPayment,
  PaymentHistoryResponse,
  CreateInvestorPaymentData,
  CreatePayableData,
  PayableStatus,
  InvestorPaymentStatus,
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
  onSave: (paymentData: CreateInvestorPaymentData) => void
  payable?: InvestorPayable
  investorName: string
  isLoading: boolean
  maxAmount?: number
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  payable,
  investorName,
  isLoading,
  maxAmount
}) => {
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.BANK_TRANSFER)
  const [reference, setReference] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (payable && isOpen) {
      setAmount(payable.remainingAmount.toString())
    }
  }, [payable, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      amount: parseFloat(amount),
      paymentMethod,
      reference: reference || undefined,
      notes: notes || undefined,
      payableId: payable?.id
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          Make Payment to {investorName}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Amount</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="0"
              max={maxAmount}
              step="0.01"
              required
            />
            {maxAmount && (
              <p className="text-xs text-muted-foreground mt-1">
                Maximum: ৳ {maxAmount.toLocaleString()}
              </p>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value={PaymentMethod.CASH}>Cash</option>
              <option value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</option>
              <option value={PaymentMethod.CHEQUE}>Cheque</option>
              <option value={PaymentMethod.CARD}>Card</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Reference (Optional)</label>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Transaction reference"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Notes (Optional)</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Payment notes"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Make Payment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Payable Card Component
interface PayableCardProps {
  payable: InvestorPayable
  onMakePayment: (payable: InvestorPayable) => void
}

const PayableCard: React.FC<PayableCardProps> = ({ payable, onMakePayment }) => {
  const getStatusColor = (status: PayableStatus) => {
    switch (status) {
      case PayableStatus.PAID: return "bg-green-100 text-green-800"
      case PayableStatus.PARTIALLY_PAID: return "bg-blue-100 text-blue-800"
      case PayableStatus.OVERDUE: return "bg-red-100 text-red-800"
      default: return "bg-yellow-100 text-yellow-800"
    }
  }

  const getStatusIcon = (status: PayableStatus) => {
    switch (status) {
      case PayableStatus.PAID: return <CheckCircle2 className="w-4 h-4" />
      case PayableStatus.PARTIALLY_PAID: return <TrendingUp className="w-4 h-4" />
      case PayableStatus.OVERDUE: return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  return (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-sm">{payable.poNumber}</h4>
          <p className="text-xs text-muted-foreground">{payable.vendorName}</p>
        </div>
        <Badge className={`text-xs ${getStatusColor(payable.status)}`}>
          {getStatusIcon(payable.status)}
          <span className="ml-1">{payable.status.replace('_', ' ')}</span>
        </Badge>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Due Amount:</span>
          <span className="font-medium">৳ {payable.dueAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Paid Amount:</span>
          <span className="font-medium text-green-600">৳ {payable.paidAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Remaining:</span>
          <span className="font-medium text-blue-600">৳ {payable.remainingAmount.toLocaleString()}</span>
        </div>
        {payable.dueDate && (
          <div className="flex justify-between">
            <span>Due Date:</span>
            <span className="text-muted-foreground">
              {new Date(payable.dueDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {payable.status !== PayableStatus.PAID && (
        <Button
          size="sm"
          className="w-full mt-3"
          onClick={() => onMakePayment(payable)}
        >
          <DollarSign className="w-4 h-4 mr-1" />
          Make Payment
        </Button>
      )}
    </Card>
  )
}

// Payment Timeline Component
interface PaymentTimelineProps {
  payments: InvestorPayment[]
}

const PaymentTimeline: React.FC<PaymentTimelineProps> = ({ payments }) => {
  return (
    <div className="space-y-4">
      {payments.map((payment, index) => (
        <div key={payment.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            {index < payments.length - 1 && (
              <div className="w-0.5 h-full bg-border mt-1" />
            )}
          </div>
          <div className="flex-1 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">৳ {payment.amount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {payment.paymentMethod.toLowerCase().replace('_', ' ')}
                </p>
                {payment.reference && (
                  <p className="text-xs text-muted-foreground">
                    Ref: {payment.reference}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  {new Date(payment.paymentDate).toLocaleDateString()}
                </p>
                <Badge variant="outline" className="text-xs">
                  {payment.status}
                </Badge>
              </div>
            </div>
            {payment.notes && (
              <p className="text-sm text-muted-foreground mt-1">{payment.notes}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function InvestorsPage() {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [selectedPayable, setSelectedPayable] = useState<InvestorPayable | null>(null)
  const [selectedInvestor, setSelectedInvestor] = useState<ApiInvestor | null>(null)
  const [editingInvestor, setEditingInvestor] = useState<ApiInvestor | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  // API Queries
  const { data: investorsData, isLoading: isLoadingInvestors, refetch: refetchInvestors } = useGetInvestorsQuery({
    search: searchTerm || undefined,
  })
  
  const { data: statistics, isLoading: isLoadingStats } = useGetInvestorStatisticsQuery()
  const { data: performanceData, isLoading: isLoadingPerformance } = useGetInvestorPerformanceQuery()
  const { data: equityDistribution, isLoading: isLoadingEquity } = useGetEquityDistributionQuery()
  const { data: dueSummary, isLoading: isLoadingDueSummary } = useGetInvestorDueSummaryQuery()
  const { data: paymentHistory, isLoading: isLoadingPaymentHistory } = useGetPaymentHistoryQuery(
    selectedInvestor ? { investorId: selectedInvestor.id, params: { limit: 10 } } : { investorId: '' }
  )

  // API Mutations
  const [createInvestor, { isLoading: isCreating }] = useCreateInvestorMutation()
  const [updateInvestor, { isLoading: isUpdating }] = useUpdateInvestorMutation()
  const [deleteInvestor] = useDeleteInvestorMutation()
  const [toggleInvestorStatus] = useToggleInvestorStatusMutation()
  const [createInvestorPayment, { isLoading: isCreatingPayment }] = useCreateInvestorPaymentMutation()
  const [createPayable, { isLoading: isCreatingPayable }] = useCreatePayableMutation()

  const investors = investorsData?.investors || []
  const filteredInvestors = investors.filter(investor =>
    investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    investor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    investor.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate payment statistics
  const paymentStats = dueSummary?.reduce((acc, summary) => ({
    totalDue: acc.totalDue + summary.totalDue,
    totalPaid: acc.totalPaid + summary.totalPaid,
    totalRemaining: acc.totalRemaining + summary.totalRemaining,
    payableCount: acc.payableCount + summary.payables.length
  }), { totalDue: 0, totalPaid: 0, totalRemaining: 0, payableCount: 0 })

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

  const handleMakePayment = (payable: InvestorPayable) => {
    setSelectedPayable(payable)
    // Find the investor for this payable
    const investor = investors.find(inv => inv.id === payable.investorId)
    setSelectedInvestor(investor || null)
    setIsPaymentDialogOpen(true)
  }

  const handleSubmitPayment = async (paymentData: CreateInvestorPaymentData) => {
    if (!selectedInvestor) return

    try {
      await createInvestorPayment({
        investorId: selectedInvestor.id,
        paymentData
      }).unwrap()
      
      setIsPaymentDialogOpen(false)
      setSelectedPayable(null)
      setSelectedInvestor(null)
      // Refetch relevant data
      refetchInvestors()
    } catch (error) {
      console.error("Failed to create payment:", error)
    }
  }

  const handleCreatePayable = async (investorId: string) => {
    try {
      // This would typically be called when profit is calculated
      // For demo purposes, we'll create a sample payable
      const payableData: CreatePayableData = {
        purchaseOrderId: `po-${Date.now()}`,
        dueAmount: 400000,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      }

      await createPayable({ investorId, payableData }).unwrap()
      
      // Create the first payment along with the payable (as requested)
      const paymentData: CreateInvestorPaymentData = {
        amount: 100000,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        reference: `INIT-${Date.now()}`,
        notes: 'Initial payment for new payable',
      }

      await createInvestorPayment({
        investorId,
        paymentData
      }).unwrap()

      refetchInvestors()
    } catch (error) {
      console.error("Failed to create payable:", error)
    }
  }

  const handleInvestorSelect = (investor: ApiInvestor) => {
    setSelectedInvestor(investor)
    setActiveTab('payments')
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
              Manage investor profiles, track equity shares, and handle payments
            </p>
          </div>

          <div className="p-4 md:p-8">
            {/* Loading States */}
            {(isLoadingStats || isLoadingInvestors) && (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="investors">Investors</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
                <TabsTrigger value="payables">Due Payables</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Stats Cards */}
                {statistics && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Investors</CardTitle>
                        <User className="h-4 w-4 text-accent" />
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
                        <TrendingUp className="h-4 w-4 text-primary" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">৳ {(statistics.summary.totalInvestment / 1000000).toFixed(1)}M</div>
                        <p className="text-xs text-muted-foreground mt-1">Combined capital</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Investors</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
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

                {/* Payment Overview Cards */}
                {paymentStats && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Due</CardTitle>
                        <FileText className="h-4 w-4 text-orange-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">৳ {(paymentStats.totalDue / 1000).toFixed(1)}K</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {paymentStats.payableCount} payables
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">৳ {(paymentStats.totalPaid / 1000).toFixed(1)}K</div>
                        <p className="text-xs text-muted-foreground mt-1">Amount paid to date</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Remaining Due</CardTitle>
                        <Clock className="h-4 w-4 text-blue-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">৳ {(paymentStats.totalRemaining / 1000).toFixed(1)}K</div>
                        <p className="text-xs text-muted-foreground mt-1">Outstanding balance</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completion</CardTitle>
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {paymentStats.totalDue > 0 ? ((paymentStats.totalPaid / paymentStats.totalDue) * 100).toFixed(1) : 0}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Payment progress</p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Due Payables</CardTitle>
                      <CardDescription>Latest pending payments</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingDueSummary ? (
                        <div className="flex justify-center items-center h-32">
                          <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                      ) : dueSummary?.slice(0, 5).map(summary => (
                        <div key={summary.investorId} className="flex items-center justify-between py-3 border-b last:border-0">
                          <div className="flex items-center gap-3">
                            <Building className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">{summary.investorName}</p>
                              <p className="text-xs text-muted-foreground">
                                {summary.payables.length} payables
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm">৳ {summary.totalRemaining.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Remaining</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Timeline</CardTitle>
                      <CardDescription>Recent payment activities</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingPaymentHistory ? (
                        <div className="flex justify-center items-center h-32">
                          <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                      ) : paymentHistory?.payments && paymentHistory.payments.length > 0 ? (
                        <PaymentTimeline payments={paymentHistory.payments.slice(0, 5)} />
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          No recent payments
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Investors Tab */}
              <TabsContent value="investors" className="space-y-6">
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
                      onViewPayments={handleInvestorSelect}
                      isLoading={isLoadingInvestors}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payments Tab */}
              <TabsContent value="payments" className="space-y-6">
                {selectedInvestor ? (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Payments for {selectedInvestor.name}</CardTitle>
                        <CardDescription>
                          Payment history and transaction details
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoadingPaymentHistory ? (
                          <div className="flex justify-center items-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin" />
                          </div>
                        ) : paymentHistory ? (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <Card>
                                <CardContent className="pt-6">
                                  <div className="text-2xl font-bold text-green-600">
                                    ৳ {paymentHistory.payments.reduce((sum, payment) => sum + payment.amount, 0).toLocaleString()}
                                  </div>
                                  <p className="text-sm text-muted-foreground">Total Paid</p>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardContent className="pt-6">
                                  <div className="text-2xl font-bold">
                                    {paymentHistory.total}
                                  </div>
                                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardContent className="pt-6">
                                  <Button 
                                    onClick={() => handleCreatePayable(selectedInvestor.id)}
                                    disabled={isCreatingPayable}
                                    className="w-full"
                                  >
                                    {isCreatingPayable ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Plus className="w-4 h-4" />
                                    )}
                                    Create Payable
                                  </Button>
                                </CardContent>
                              </Card>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-4">Payment History</h4>
                              <PaymentTimeline payments={paymentHistory.payments} />
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-muted-foreground">No payment history found</p>
                            <Button 
                              onClick={() => handleCreatePayable(selectedInvestor.id)}
                              className="mt-4"
                              disabled={isCreatingPayable}
                            >
                              Create First Payable
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Select an Investor</h3>
                        <p className="text-muted-foreground mb-4">
                          Choose an investor from the list to view their payment history and manage payments
                        </p>
                        <Button onClick={() => setActiveTab('investors')}>
                          View Investors
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Due Payables Tab */}
              <TabsContent value="payables" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Due Payables</CardTitle>
                    <CardDescription>
                      Manage pending payments to investors
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingDueSummary ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    ) : dueSummary && dueSummary.length > 0 ? (
                      <div className="space-y-6">
                        {dueSummary.map(summary => (
                          <div key={summary.investorId} className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold">{summary.investorName}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Total Due: ৳ {summary.totalDue.toLocaleString()} • 
                                  Paid: ৳ {summary.totalPaid.toLocaleString()} • 
                                  Remaining: ৳ {summary.totalRemaining.toLocaleString()}
                                </p>
                              </div>
                              <Badge variant="outline">
                                {summary.payables.length} Payables
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {summary.payables.map(payable => (
                                <PayableCard
                                  key={payable.id}
                                  payable={payable}
                                  onMakePayment={handleMakePayment}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Due Payables</h3>
                        <p className="text-muted-foreground">
                          All investor payments are up to date
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reports Tab */}
              <TabsContent value="reports" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Investor Reports</CardTitle>
                    <CardDescription>
                      Comprehensive reports and analytics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Investment Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {statistics?.investorDetails.map((investor, index) => (
                            <div key={investor.investorId} className="flex items-center justify-between py-3 border-b last:border-0">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: colors[index % colors.length] }}
                                />
                                <div className="min-w-0">
                                  <p className="font-medium truncate text-sm">{investor.investorName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {investor.sharePercentage.toFixed(1)}% equity
                                  </p>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0 ml-4">
                                <p className="font-semibold text-sm">৳ {investor.totalInvested.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">
                                  {investor.activeInvestments} active
                                </p>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Payment Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {dueSummary?.map((summary, index) => (
                            <div key={summary.investorId} className="flex items-center justify-between py-3 border-b last:border-0">
                              <div className="flex items-center gap-3">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium text-sm">{summary.investorName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {summary.payables.length} payables
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-sm">৳ {summary.totalRemaining.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">
                                  {((summary.totalPaid / summary.totalDue) * 100).toFixed(1)}% paid
                                </p>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
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

        {/* Payment Dialog */}
        <PaymentDialog
          isOpen={isPaymentDialogOpen}
          onClose={() => {
            setIsPaymentDialogOpen(false)
            setSelectedPayable(null)
            setSelectedInvestor(null)
          }}
          onSave={handleSubmitPayment}
          payable={selectedPayable || undefined}
          investorName={selectedInvestor?.name || ""}
          isLoading={isCreatingPayment}
          maxAmount={selectedPayable?.remainingAmount}
        />
      </div>
    </ProtectedRoute>
  )
}