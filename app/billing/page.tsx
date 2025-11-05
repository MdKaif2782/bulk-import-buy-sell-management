"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, FileText, DollarSign, Calendar, Building, Filter, Download, Eye, Edit } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { BillDialog } from "@/components/bill-dialog"
import { BillDetailsDialog } from "@/components/bill-details-dialog"
import { useToast } from "@/components/ui/use-toast"

interface BillItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
  amount: number
}

interface Bill {
  id: string
  billNumber: string
  poNumber: string
  companyName: string
  companyEmail: string
  companyAddress: string
  issueDate: string
  dueDate: string
  status: "draft" | "sent" | "overdue" | "paid" | "cancelled"
  items: BillItem[]
  subtotal: number
  taxAmount: number
  totalAmount: number
  amountPaid: number
  balanceDue: number
  notes: string
  terms: string
  paymentMethod?: string
  paymentDate?: string
  createdFromPO: string
}

interface PurchaseOrder {
  id: string
  poNumber: string
  companyName: string
  companyEmail: string
  companyAddress: string
  issueDate: string
  deliveryDate: string
  status: "challan_processed" | "dispatched" | "delivered" | "cancelled"
  lineItems: Array<{
    id: string
    description: string
    quantity: number
    unitPrice: number
    unit: string
  }>
  taxPercentage: number
  shippingCharges: number
  totalAmount: number
  billedAmount: number
  paidAmount: number
  dueAmount: number
}

const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: "1",
    poNumber: "PO-2024-001",
    companyName: "Fashion Trends Ltd.",
    companyEmail: "purchase@fashion-trends.com",
    companyAddress: "123 Commercial Area, Dhaka 1205",
    issueDate: "2024-03-15",
    deliveryDate: "2024-04-10",
    status: "delivered",
    taxPercentage: 15,
    shippingCharges: 500,
    totalAmount: 45875,
    billedAmount: 45875,
    paidAmount: 0,
    dueAmount: 45875,
    lineItems: [
      {
        id: "1",
        description: "Cotton Fabric Roll - Premium Quality",
        quantity: 50,
        unitPrice: 450,
        unit: "roll"
      },
      {
        id: "2",
        description: "Polyester Thread",
        quantity: 200,
        unitPrice: 85,
        unit: "spool"
      }
    ]
  },
  {
    id: "2",
    poNumber: "PO-2024-002",
    companyName: "Textile World International",
    companyEmail: "orders@textileworld.com",
    companyAddress: "456 Industrial Zone, Narayanganj",
    issueDate: "2024-03-18",
    deliveryDate: "2024-04-05",
    status: "delivered",
    taxPercentage: 15,
    shippingCharges: 750,
    totalAmount: 33425,
    billedAmount: 33425,
    paidAmount: 33425,
    dueAmount: 0,
    lineItems: [
      {
        id: "1",
        description: "Silk Blend Fabric",
        quantity: 25,
        unitPrice: 850,
        unit: "meter"
      },
      {
        id: "2",
        description: "Designer Buttons",
        quantity: 500,
        unitPrice: 12,
        unit: "piece"
      }
    ]
  },
  {
    id: "3",
    poNumber: "PO-2024-003",
    companyName: "Garment Masters BD",
    companyEmail: "procurement@garmentmasters.com",
    companyAddress: "789 Export Processing Zone, Savar",
    issueDate: "2024-03-20",
    deliveryDate: "2024-04-15",
    status: "delivered",
    taxPercentage: 10,
    shippingCharges: 600,
    totalAmount: 34240,
    billedAmount: 34240,
    paidAmount: 17120,
    dueAmount: 17120,
    lineItems: [
      {
        id: "1",
        description: "Cotton Fabric Roll - Standard",
        quantity: 80,
        unitPrice: 380,
        unit: "roll"
      }
    ]
  },
  {
    id: "4",
    poNumber: "PO-2024-004",
    companyName: "Style Hub Fashion",
    companyEmail: "orders@stylehub.com",
    companyAddress: "321 Fashion Street, Dhaka 1209",
    issueDate: "2024-03-22",
    deliveryDate: "2024-04-08",
    status: "dispatched",
    taxPercentage: 15,
    shippingCharges: 400,
    totalAmount: 16100,
    billedAmount: 0,
    paidAmount: 0,
    dueAmount: 16100,
    lineItems: [
      {
        id: "1",
        description: "Polyester Thread - Black",
        quantity: 150,
        unitPrice: 85,
        unit: "spool"
      },
      {
        id: "2",
        description: "Plastic Buttons - White",
        quantity: 300,
        unitPrice: 8,
        unit: "piece"
      }
    ]
  },
  {
    id: "5",
    poNumber: "PO-2024-005",
    companyName: "Global Textiles Inc.",
    companyEmail: "purchase@globaltextiles.com",
    companyAddress: "654 Trade Center, Chittagong",
    issueDate: "2024-03-25",
    deliveryDate: "2024-04-20",
    status: "challan_processed",
    taxPercentage: 12,
    shippingCharges: 1200,
    totalAmount: 55800,
    billedAmount: 0,
    paidAmount: 0,
    dueAmount: 55800,
    lineItems: [
      {
        id: "1",
        description: "Premium Silk Fabric",
        quantity: 40,
        unitPrice: 1200,
        unit: "meter"
      },
      {
        id: "2",
        description: "Gold Thread",
        quantity: 80,
        unitPrice: 150,
        unit: "spool"
      }
    ]
  }
]

const mockBills: Bill[] = [
  {
    id: "1",
    billNumber: "INV-2024-001",
    poNumber: "PO-2024-001",
    companyName: "Fashion Trends Ltd.",
    companyEmail: "purchase@fashion-trends.com",
    companyAddress: "123 Commercial Area, Dhaka 1205",
    issueDate: "2024-04-01",
    dueDate: "2024-05-01",
    status: "sent",
    items: [
      {
        id: "1",
        description: "Cotton Fabric Roll - Premium Quality",
        quantity: 50,
        unitPrice: 450,
        taxRate: 15,
        amount: 22500
      },
      {
        id: "2",
        description: "Polyester Thread",
        quantity: 200,
        unitPrice: 85,
        taxRate: 15,
        amount: 17000
      }
    ],
    subtotal: 39500,
    taxAmount: 5925,
    totalAmount: 45425,
    amountPaid: 0,
    balanceDue: 45425,
    notes: "Thank you for your business. Please make payment within 30 days.",
    terms: "Net 30 days",
    createdFromPO: "1"
  },
  {
    id: "2",
    billNumber: "INV-2024-002",
    poNumber: "PO-2024-002",
    companyName: "Textile World International",
    companyEmail: "orders@textileworld.com",
    companyAddress: "456 Industrial Zone, Narayanganj",
    issueDate: "2024-04-02",
    dueDate: "2024-05-02",
    status: "paid",
    items: [
      {
        id: "1",
        description: "Silk Blend Fabric",
        quantity: 25,
        unitPrice: 850,
        taxRate: 15,
        amount: 21250
      },
      {
        id: "2",
        description: "Designer Buttons",
        quantity: 500,
        unitPrice: 12,
        taxRate: 15,
        amount: 6000
      }
    ],
    subtotal: 27250,
    taxAmount: 4087.5,
    totalAmount: 31337.5,
    amountPaid: 31337.5,
    balanceDue: 0,
    notes: "Payment received. Thank you for your prompt payment.",
    terms: "Net 30 days",
    paymentMethod: "Bank Transfer",
    paymentDate: "2024-04-10",
    createdFromPO: "2"
  },
  {
    id: "3",
    billNumber: "INV-2024-003",
    poNumber: "PO-2024-003",
    companyName: "Garment Masters BD",
    companyEmail: "procurement@garmentmasters.com",
    companyAddress: "789 Export Processing Zone, Savar",
    issueDate: "2024-04-03",
    dueDate: "2024-05-03",
    status: "sent",
    items: [
      {
        id: "1",
        description: "Cotton Fabric Roll - Standard",
        quantity: 80,
        unitPrice: 380,
        taxRate: 10,
        amount: 30400
      }
    ],
    subtotal: 30400,
    taxAmount: 3040,
    totalAmount: 33440,
    amountPaid: 16720,
    balanceDue: 16720,
    notes: "Partial payment received. Balance due by due date.",
    terms: "Net 30 days",
    paymentMethod: "Cash",
    paymentDate: "2024-04-15",
    createdFromPO: "3"
  },
  {
    id: "4",
    billNumber: "INV-2024-004",
    poNumber: "PO-2024-006",
    companyName: "Premium Fabrics Ltd.",
    companyEmail: "accounts@premiumfabrics.com",
    companyAddress: "987 Textile Road, Gazipur",
    issueDate: "2024-04-05",
    dueDate: "2024-04-25",
    status: "overdue",
    items: [
      {
        id: "1",
        description: "Cotton Fabric - Mixed Colors",
        quantity: 60,
        unitPrice: 420,
        taxRate: 15,
        amount: 25200
      }
    ],
    subtotal: 25200,
    taxAmount: 3780,
    totalAmount: 28980,
    amountPaid: 0,
    balanceDue: 28980,
    notes: "Payment overdue. Please settle immediately.",
    terms: "Net 20 days",
    createdFromPO: "6"
  }
]

export default function BillingPage() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [bills, setBills] = useState<Bill[]>(mockBills)
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(mockPurchaseOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null)
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)

  // Filter POs that are ready for billing (delivered or dispatched) and not fully billed
  const poReadyForBilling = purchaseOrders.filter(po => 
    (po.status === "delivered" || po.status === "dispatched") && 
    po.billedAmount < po.totalAmount
  )

  const filteredBills = bills.filter((bill) => {
    const matchesSearch = 
      bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || bill.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Draft", class: "bg-gray-100 text-gray-800 border-gray-200" },
      sent: { label: "Sent", class: "bg-blue-100 text-blue-800 border-blue-200" },
      overdue: { label: "Overdue", class: "bg-red-100 text-red-800 border-red-200" },
      paid: { label: "Paid", class: "bg-green-100 text-green-800 border-green-200" },
      cancelled: { label: "Cancelled", class: "bg-gray-100 text-gray-800 border-gray-200" }
    }
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
  }

  const handleCreateBill = (po: PurchaseOrder) => {
    setSelectedPO(po)
    setIsCreateDialogOpen(true)
  }

  const handleSaveBill = (billData: Omit<Bill, "id" | "billNumber">) => {
    const newBill: Bill = {
      ...billData,
      id: Date.now().toString(),
      billNumber: `INV-2024-${String(bills.length + 1).padStart(3, '0')}`
    }
    
    setBills(prev => [newBill, ...prev])
    
    // Update PO billed amount
    setPurchaseOrders(prev => prev.map(po => 
      po.poNumber === billData.poNumber ? { 
        ...po, 
        billedAmount: po.billedAmount + billData.totalAmount 
      } : po
    ))

    toast({
      title: "Bill Created",
      description: `Bill ${newBill.billNumber} has been created successfully`,
      duration: 3000,
    })
    
    setIsCreateDialogOpen(false)
    setSelectedPO(null)
  }

  const handleUpdateBill = (updatedBill: Bill) => {
    setBills(prev => prev.map(bill => 
      bill.id === updatedBill.id ? updatedBill : bill
    ))

    toast({
      title: "Bill Updated",
      description: `Bill ${updatedBill.billNumber} has been updated successfully`,
      duration: 3000,
    })
    
    setIsDetailsDialogOpen(false)
    setSelectedBill(null)
  }

  const handleViewBill = (bill: Bill) => {
    setSelectedBill(bill)
    setIsDetailsDialogOpen(true)
  }

  const handleStatusUpdate = (billId: string, newStatus: Bill["status"], paymentData?: { method: string, date: string, amount: number }) => {
    setBills(prev => prev.map(bill => {
      if (bill.id === billId) {
        const updatedBill = { 
          ...bill, 
          status: newStatus,
          ...(newStatus === "paid" && paymentData ? {
            paymentMethod: paymentData.method,
            paymentDate: paymentData.date,
            amountPaid: paymentData.amount,
            balanceDue: 0
          } : {})
        }
        
        // Update PO paid amount if marked as paid
        if (newStatus === "paid" && paymentData) {
          setPurchaseOrders(prevPOs => prevPOs.map(po => 
            po.poNumber === bill.poNumber ? { 
              ...po, 
              paidAmount: po.paidAmount + paymentData.amount,
              dueAmount: Math.max(0, po.dueAmount - paymentData.amount)
            } : po
          ))
        }
        
        return updatedBill
      }
      return bill
    }))

    toast({
      title: "Status Updated",
      description: `Bill status updated to ${getStatusBadge(newStatus).label}`,
      duration: 3000,
    })
  }

  const handleDownloadBill = (bill: Bill) => {
    toast({
      title: "Download Started",
      description: `Bill ${bill.billNumber} is being downloaded`,
      duration: 3000,
    })
    // In a real app, this would trigger a PDF download
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  // Calculate stats
  const totalBills = bills.length
  const totalBilledAmount = bills.reduce((sum, bill) => sum + bill.totalAmount, 0)
  const totalPaidAmount = bills.reduce((sum, bill) => sum + bill.amountPaid, 0)
  const totalDueAmount = bills.reduce((sum, bill) => sum + bill.balanceDue, 0)
  const overdueBills = bills.filter(bill => bill.status === "overdue" || (bill.status === "sent" && isOverdue(bill.dueDate))).length

  const statusCounts = bills.reduce((acc, bill) => {
    acc[bill.status] = (acc[bill.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="flex min-h-screen bg-background flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 overflow-auto w-full">
        <div className="sticky top-0 z-30 bg-card border-b border-border p-4 md:p-6">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground">Billing Management</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Manage invoices, track payments, and monitor billing status
          </p>
        </div>

        <div className="p-4 md:p-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Total Bills
                </CardTitle>
                <CardDescription className="text-2xl font-bold text-blue-800">
                  {totalBills}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-purple-50 border-purple-200">
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Total Billed
                </CardTitle>
                <CardDescription className="text-2xl font-bold text-purple-800">
                  ৳ {totalBilledAmount.toLocaleString()}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Total Paid
                </CardTitle>
                <CardDescription className="text-2xl font-bold text-green-800">
                  ৳ {totalPaidAmount.toLocaleString()}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-orange-50 border-orange-200">
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Due Amount
                </CardTitle>
                <CardDescription className="text-2xl font-bold text-orange-800">
                  ৳ {totalDueAmount.toLocaleString()}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* POs Ready for Billing Section */}
          {poReadyForBilling.length > 0 && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">Ready for Billing</CardTitle>
                <CardDescription>
                  {poReadyForBilling.length} purchase order(s) delivered and ready for invoice creation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {poReadyForBilling.map((po) => (
                    <div key={po.id} className="flex items-center justify-between p-3 border border-green-200 rounded-lg bg-white">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Building className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold">{po.poNumber}</p>
                            <p className="text-sm text-muted-foreground">{po.companyName}</p>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total: ৳ {po.totalAmount.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Billed: ৳ {po.billedAmount.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Due: ৳ {po.dueAmount.toLocaleString()}
                          </div>
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                            {po.status}
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleCreateBill(po)}
                        className="gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="w-4 h-4" />
                        Create Bill
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by bill number, PO number, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-10 w-full md:w-40 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="overdue">Overdue</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>
          </div>

          {/* Bills Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Bills</CardTitle>
              <CardDescription>
                {filteredBills.length} bill(s) found • Manage invoices and track payments
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="border rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-semibold">Bill #</th>
                      <th className="text-left py-3 px-4 font-semibold">PO Reference</th>
                      <th className="text-left py-3 px-4 font-semibold">Company</th>
                      <th className="text-left py-3 px-4 font-semibold">Issue Date</th>
                      <th className="text-left py-3 px-4 font-semibold">Due Date</th>
                      <th className="text-right py-3 px-4 font-semibold">Total Amount</th>
                      <th className="text-right py-3 px-4 font-semibold">Balance Due</th>
                      <th className="text-center py-3 px-4 font-semibold">Status</th>
                      <th className="text-center py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBills.map((bill) => {
                      const statusInfo = getStatusBadge(bill.status)
                      const isBillOverdue = bill.status === "sent" && isOverdue(bill.dueDate)
                      
                      return (
                        <tr key={bill.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4 font-medium">{bill.billNumber}</td>
                          <td className="py-3 px-4 text-muted-foreground">{bill.poNumber}</td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{bill.companyName}</p>
                              <p className="text-xs text-muted-foreground">{bill.companyEmail}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{formatDate(bill.issueDate)}</td>
                          <td className="py-3 px-4">
                            <div className={`flex items-center gap-1 ${isBillOverdue ? 'text-red-600 font-semibold' : 'text-muted-foreground'}`}>
                              <Calendar className="w-3 h-3" />
                              {formatDate(bill.dueDate)}
                              {isBillOverdue && <span className="text-xs">(Overdue)</span>}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-semibold">
                            ৳ {bill.totalAmount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className={bill.balanceDue > 0 ? "text-orange-600 font-semibold" : "text-green-600"}>
                              ৳ {bill.balanceDue.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant="outline" className={statusInfo.class}>
                              {isBillOverdue ? "Overdue" : statusInfo.label}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewBill(bill)}
                                className="h-8 w-8 p-0"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadBill(bill)}
                                className="h-8 w-8 p-0"
                                title="Download PDF"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewBill(bill)}
                                className="h-8 w-8 p-0"
                                title="Edit Bill"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {filteredBills.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">No bills found</h3>
                  <p className="text-muted-foreground mt-1">
                    {searchTerm || statusFilter !== "all" 
                      ? "Try adjusting your search or filter criteria" 
                      : "Create your first bill from a purchase order"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Create Bill Dialog */}
      <BillDialog
        isOpen={isCreateDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false)
          setSelectedPO(null)
        }}
        purchaseOrder={selectedPO}
        onSave={handleSaveBill}
      />

      {/* Bill Details Dialog */}
      <BillDetailsDialog
        isOpen={isDetailsDialogOpen}
        onClose={() => {
          setIsDetailsDialogOpen(false)
          setSelectedBill(null)
        }}
        bill={selectedBill}
        onUpdate={handleUpdateBill}
        onStatusUpdate={handleStatusUpdate}
        onDownload={handleDownloadBill}
      />
    </div>
  )
}