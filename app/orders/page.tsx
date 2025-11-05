"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, Truck, Package, CheckCircle, Download, Filter } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { PurchaseOrderDialog } from "@/components/purchase-order-dialog"
import { useToast } from "@/components/ui/use-toast"

interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  unit: string
}

interface PurchaseOrder {
  id: string
  poNumber: string
  quotationNumber: string
  companyName: string
  companyEmail: string
  companyPhone: string
  companyAddress: string
  issueDate: string
  deliveryDate: string
  status: "pending" | "confirmed" | "challan_processed" | "dispatched" | "delivered" | "cancelled"
  lineItems: LineItem[]
  taxPercentage: number
  shippingCharges: number
  notes: string
  terms: string
  challanNumber?: string
  dispatchDate?: string
  deliveryDateActual?: string
}

const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: "1",
    poNumber: "PO-2024-001",
    quotationNumber: "QT-2024-015",
    companyName: "Fashion Trends Ltd.",
    companyEmail: "purchase@fashion-trends.com",
    companyPhone: "+880 2 556 7890",
    companyAddress: "123 Commercial Area, Dhaka 1205",
    issueDate: "2024-03-15",
    deliveryDate: "2024-04-10",
    status: "challan_processed",
    taxPercentage: 15,
    shippingCharges: 500,
    notes: "Please ensure quality check before delivery",
    terms: "Net 30 days",
    challanNumber: "CH-2024-001",
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
    quotationNumber: "QT-2024-018",
    companyName: "Textile World International",
    companyEmail: "orders@textileworld.com",
    companyPhone: "+880 2 667 8901",
    companyAddress: "456 Industrial Zone, Narayanganj",
    issueDate: "2024-03-18",
    deliveryDate: "2024-04-05",
    status: "dispatched",
    taxPercentage: 15,
    shippingCharges: 750,
    notes: "Urgent delivery required",
    terms: "Net 15 days",
    challanNumber: "CH-2024-002",
    dispatchDate: "2024-03-25",
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
      },
      {
        id: "3",
        description: "Premium Zippers",
        quantity: 100,
        unitPrice: 35,
        unit: "piece"
      }
    ]
  },
  {
    id: "3",
    poNumber: "PO-2024-003",
    quotationNumber: "QT-2024-022",
    companyName: "Garment Masters BD",
    companyEmail: "procurement@garmentmasters.com",
    companyPhone: "+880 2 778 9012",
    companyAddress: "789 Export Processing Zone, Savar",
    issueDate: "2024-03-20",
    deliveryDate: "2024-04-15",
    status: "confirmed",
    taxPercentage: 10,
    shippingCharges: 600,
    notes: "Standard quality materials required",
    terms: "Net 45 days",
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
    quotationNumber: "QT-2024-025",
    companyName: "Style Hub Fashion",
    companyEmail: "orders@stylehub.com",
    companyPhone: "+880 2 889 0123",
    companyAddress: "321 Fashion Street, Dhaka 1209",
    issueDate: "2024-03-22",
    deliveryDate: "2024-04-08",
    status: "delivered",
    taxPercentage: 15,
    shippingCharges: 400,
    notes: "Successfully delivered",
    terms: "Net 30 days",
    challanNumber: "CH-2024-004",
    dispatchDate: "2024-03-28",
    deliveryDateActual: "2024-04-05",
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
    quotationNumber: "QT-2024-028",
    companyName: "Global Textiles Inc.",
    companyEmail: "purchase@globaltextiles.com",
    companyPhone: "+880 2 990 1234",
    companyAddress: "654 Trade Center, Chittagong",
    issueDate: "2024-03-25",
    deliveryDate: "2024-04-20",
    status: "pending",
    taxPercentage: 12,
    shippingCharges: 1200,
    notes: "International shipment",
    terms: "LC at sight",
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

export default function PurchaseOrdersPage() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(mockPurchaseOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null)

  const filteredOrders = purchaseOrders.filter((order) => {
    const matchesSearch = 
      order.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const calculateSubtotal = (lineItems: LineItem[]) => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  }

  const calculateTaxAmount = (subtotal: number, taxPercentage: number) => {
    return (subtotal * taxPercentage) / 100
  }

  const calculateTotal = (lineItems: LineItem[], taxPercentage: number, shippingCharges: number) => {
    const subtotal = calculateSubtotal(lineItems)
    const taxAmount = calculateTaxAmount(subtotal, taxPercentage)
    return subtotal + taxAmount + shippingCharges
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", class: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      confirmed: { label: "Confirmed", class: "bg-blue-100 text-blue-800 border-blue-200" },
      challan_processed: { label: "Challan Processed", class: "bg-purple-100 text-purple-800 border-purple-200" },
      dispatched: { label: "Dispatched", class: "bg-orange-100 text-orange-800 border-orange-200" },
      delivered: { label: "Delivered", class: "bg-green-100 text-green-800 border-green-200" },
      cancelled: { label: "Cancelled", class: "bg-red-100 text-red-800 border-red-200" }
    }
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  }

  const handleViewOrder = (order: PurchaseOrder) => {
    setSelectedOrder(order)
    setIsDialogOpen(true)
  }

  const handleStatusUpdate = (orderId: string, newStatus: PurchaseOrder["status"]) => {
    setPurchaseOrders(prev => prev.map(order => 
      order.id === orderId ? { 
        ...order, 
        status: newStatus,
        ...(newStatus === "challan_processed" && !order.challanNumber ? { 
          challanNumber: `CH-2024-${String(prev.length + 1).padStart(3, '0')}` 
        } : {}),
        ...(newStatus === "dispatched" ? { 
          dispatchDate: new Date().toISOString().split('T')[0] 
        } : {}),
        ...(newStatus === "delivered" ? { 
          deliveryDateActual: new Date().toISOString().split('T')[0] 
        } : {})
      } : order
    ))

    toast({
      title: "Status Updated",
      description: `Order status updated to ${getStatusBadge(newStatus).label}`,
      duration: 3000,
    })
  }

  const handleDownloadPO = (order: PurchaseOrder) => {
    toast({
      title: "Download Started",
      description: `Purchase order ${order.poNumber} is being downloaded`,
      duration: 3000,
    })
    // In a real app, this would trigger a PDF download
  }

  const getNextStatusAction = (currentStatus: PurchaseOrder["status"]) => {
    const statusFlow = {
      pending: { label: "Confirm Order", status: "confirmed", icon: CheckCircle },
      confirmed: { label: "Process Challan", status: "challan_processed", icon: Package },
      challan_processed: { label: "Dispatch Order", status: "dispatched", icon: Truck },
      dispatched: { label: "Mark Delivered", status: "delivered", icon: CheckCircle },
      delivered: null,
      cancelled: null
    }
    
    return statusFlow[currentStatus]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const statusCounts = purchaseOrders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="flex min-h-screen bg-background flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 overflow-auto w-full">
        <div className="sticky top-0 z-30 bg-card border-b border-border p-4 md:p-6">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground">Purchase Orders</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Manage and track all purchase orders from companies
          </p>
        </div>

        <div className="p-4 md:p-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium text-blue-800">Total Orders</CardTitle>
                <CardDescription className="text-2xl font-bold text-blue-800">
                  {purchaseOrders.length}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium text-yellow-800">Pending</CardTitle>
                <CardDescription className="text-2xl font-bold text-yellow-800">
                  {statusCounts.pending || 0}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-purple-50 border-purple-200">
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium text-purple-800">In Process</CardTitle>
                <CardDescription className="text-2xl font-bold text-purple-800">
                  {(statusCounts.confirmed || 0) + (statusCounts.challan_processed || 0)}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-orange-50 border-orange-200">
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium text-orange-800">Dispatched</CardTitle>
                <CardDescription className="text-2xl font-bold text-orange-800">
                  {statusCounts.dispatched || 0}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium text-green-800">Delivered</CardTitle>
                <CardDescription className="text-2xl font-bold text-green-800">
                  {statusCounts.delivered || 0}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by PO number, company, or quotation..."
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
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="challan_processed">Challan Processed</option>
                <option value="dispatched">Dispatched</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>
          </div>

          {/* Purchase Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>
                {filteredOrders.length} orders found • Track and manage order fulfillment
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const nextAction = getNextStatusAction(order.status)
                  const statusInfo = getStatusBadge(order.status)
                  const totalAmount = calculateTotal(order.lineItems, order.taxPercentage, order.shippingCharges)
                  
                  return (
                    <Card key={order.id} className="overflow-hidden">
                      <div className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          {/* Order Info */}
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">PO Number</p>
                              <p className="font-semibold text-lg">{order.poNumber}</p>
                              <p className="text-sm text-muted-foreground">Ref: {order.quotationNumber}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Company</p>
                              <p className="font-semibold">{order.companyName}</p>
                              <p className="text-sm text-muted-foreground">{order.companyEmail}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Delivery Date</p>
                              <p className="font-semibold">{formatDate(order.deliveryDate)}</p>
                              <p className="text-sm text-muted-foreground">Issued: {formatDate(order.issueDate)}</p>
                            </div>
                          </div>

                          {/* Status and Actions */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="text-center sm:text-right">
                              <Badge variant="outline" className={statusInfo.class}>
                                {statusInfo.label}
                              </Badge>
                              <p className="text-lg font-bold mt-1">৳ {totalAmount.toLocaleString()}</p>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewOrder(order)}
                                className="gap-1"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadPO(order)}
                                className="gap-1"
                              >
                                <Download className="w-4 h-4" />
                                PDF
                              </Button>

                              {nextAction && (
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusUpdate(order.id, nextAction.status)}
                                  className="gap-1"
                                >
                                  <nextAction.icon className="w-4 h-4" />
                                  {nextAction.label}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Order Received</span>
                            <span>Confirmed</span>
                            <span>Challan Processed</span>
                            <span>Dispatched</span>
                            <span>Delivered</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                order.status === "pending" ? "bg-yellow-500 w-1/5" :
                                order.status === "confirmed" ? "bg-blue-500 w-2/5" :
                                order.status === "challan_processed" ? "bg-purple-500 w-3/5" :
                                order.status === "dispatched" ? "bg-orange-500 w-4/5" :
                                "bg-green-500 w-full"
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>

              {filteredOrders.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">No purchase orders found</h3>
                  <p className="text-muted-foreground mt-1">
                    {searchTerm || statusFilter !== "all" 
                      ? "Try adjusting your search or filter criteria" 
                      : "Purchase orders will appear here when created from quotations"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Purchase Order Dialog */}
      <PurchaseOrderDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        order={selectedOrder}
        onStatusUpdate={handleStatusUpdate}
        onDownload={handleDownloadPO}
      />
    </div>
  )
}