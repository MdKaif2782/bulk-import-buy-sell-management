"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Truck, Package, CheckCircle, Eye, Edit, FileText, Filter } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { ChallanDialog } from "@/components/challan-dialog"
import { ChallanDetailsDialog } from "@/components/challan-details-dialog"
import { useToast } from "@/components/ui/use-toast"

interface ChallanItem {
  id: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
  deliveredQuantity?: number
}

interface Challan {
  id: string
  challanNumber: string
  poNumber: string
  companyName: string
  companyAddress: string
  issueDate: string
  deliveryDate: string
  status: "draft" | "dispatched" | "in_transit" | "delivered" | "cancelled"
  items: ChallanItem[]
  vehicleNumber?: string
  driverName?: string
  driverPhone?: string
  notes: string
  receivedBy?: string
  receivedDate?: string
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
  status: "confirmed" | "challan_processed" | "dispatched" | "delivered"
  lineItems: Array<{
    id: string
    description: string
    quantity: number
    unitPrice: number
    unit: string
  }>
  taxPercentage: number
  shippingCharges: number
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
    status: "confirmed",
    taxPercentage: 15,
    shippingCharges: 500,
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
    poNumber: "PO-2024-003",
    companyName: "Garment Masters BD",
    companyEmail: "procurement@garmentmasters.com",
    companyAddress: "789 Export Processing Zone, Savar",
    issueDate: "2024-03-20",
    deliveryDate: "2024-04-15",
    status: "confirmed",
    taxPercentage: 10,
    shippingCharges: 600,
    lineItems: [
      {
        id: "1",
        description: "Cotton Fabric Roll - Standard",
        quantity: 80,
        unitPrice: 380,
        unit: "roll"
      }
    ]
  }
]

const mockChallans: Challan[] = [
  {
    id: "1",
    challanNumber: "CH-2024-001",
    poNumber: "PO-2024-002",
    companyName: "Textile World International",
    companyAddress: "456 Industrial Zone, Narayanganj",
    issueDate: "2024-03-25",
    deliveryDate: "2024-04-05",
    status: "delivered",
    items: [
      {
        id: "1",
        description: "Silk Blend Fabric",
        quantity: 25,
        deliveredQuantity: 25,
        unitPrice: 850,
        unit: "meter"
      },
      {
        id: "2",
        description: "Designer Buttons",
        quantity: 500,
        deliveredQuantity: 500,
        unitPrice: 12,
        unit: "piece"
      }
    ],
    vehicleNumber: "DHK-12345",
    driverName: "Abdul Karim",
    driverPhone: "+880 1712 345678",
    notes: "Handle with care - fragile materials",
    receivedBy: "Mr. Rahman",
    receivedDate: "2024-04-05",
    createdFromPO: "PO-2024-002"
  },
  {
    id: "2",
    challanNumber: "CH-2024-002",
    poNumber: "PO-2024-004",
    companyName: "Style Hub Fashion",
    companyAddress: "321 Fashion Street, Dhaka 1209",
    issueDate: "2024-03-28",
    deliveryDate: "2024-04-08",
    status: "in_transit",
    items: [
      {
        id: "1",
        description: "Polyester Thread - Black",
        quantity: 150,
        deliveredQuantity: 0,
        unitPrice: 85,
        unit: "spool"
      }
    ],
    vehicleNumber: "CTG-54321",
    driverName: "Mohammad Ali",
    driverPhone: "+880 1812 345678",
    notes: "Urgent delivery required",
    createdFromPO: "PO-2024-004"
  },
  {
    id: "3",
    challanNumber: "CH-2024-003",
    poNumber: "PO-2024-005",
    companyName: "Global Textiles Inc.",
    companyAddress: "654 Trade Center, Chittagong",
    issueDate: "2024-04-01",
    deliveryDate: "2024-04-20",
    status: "dispatched",
    items: [
      {
        id: "1",
        description: "Premium Silk Fabric",
        quantity: 40,
        deliveredQuantity: 0,
        unitPrice: 1200,
        unit: "meter"
      }
    ],
    vehicleNumber: "DHK-67890",
    driverName: "Kamal Hossain",
    driverPhone: "+880 1912 345678",
    notes: "International shipment - customs documents attached",
    createdFromPO: "PO-2024-005"
  },
  {
    id: "4",
    challanNumber: "CH-2024-004",
    poNumber: "PO-2024-006",
    companyName: "Premium Fabrics Ltd.",
    companyAddress: "987 Textile Road, Gazipur",
    issueDate: "2024-04-02",
    deliveryDate: "2024-04-12",
    status: "draft",
    items: [
      {
        id: "1",
        description: "Cotton Fabric - Mixed Colors",
        quantity: 60,
        deliveredQuantity: 0,
        unitPrice: 420,
        unit: "roll"
      }
    ],
    notes: "Draft challan - pending final approval",
    createdFromPO: "PO-2024-006"
  }
]

export default function ChallansPage() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [challans, setChallans] = useState<Challan[]>(mockChallans)
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(mockPurchaseOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null)
  const [selectedChallan, setSelectedChallan] = useState<Challan | null>(null)

  // Filter POs without challans (confirmed POs that don't have a challan created yet)
  const poWithoutChallans = purchaseOrders.filter(po => 
    po.status === "confirmed" && 
    !challans.some(challan => challan.poNumber === po.poNumber)
  )

  const filteredChallans = challans.filter((challan) => {
    const matchesSearch = 
      challan.challanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challan.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challan.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || challan.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Draft", class: "bg-gray-100 text-gray-800 border-gray-200" },
      dispatched: { label: "Dispatched", class: "bg-blue-100 text-blue-800 border-blue-200" },
      in_transit: { label: "In Transit", class: "bg-orange-100 text-orange-800 border-orange-200" },
      delivered: { label: "Delivered", class: "bg-green-100 text-green-800 border-green-200" },
      cancelled: { label: "Cancelled", class: "bg-red-100 text-red-800 border-red-200" }
    }
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
  }

  const handleCreateChallan = (po: PurchaseOrder) => {
    setSelectedPO(po)
    setIsCreateDialogOpen(true)
  }

  const handleSaveChallan = (challanData: Omit<Challan, "id" | "challanNumber">) => {
    const newChallan: Challan = {
      ...challanData,
      id: Date.now().toString(),
      challanNumber: `CH-2024-${String(challans.length + 1).padStart(3, '0')}`
    }
    
    setChallans(prev => [newChallan, ...prev])
    
    // Update PO status to challan_processed
    setPurchaseOrders(prev => prev.map(po => 
      po.poNumber === challanData.poNumber ? { ...po, status: "challan_processed" } : po
    ))

    toast({
      title: "Challan Created",
      description: `Challan ${newChallan.challanNumber} has been created successfully`,
      duration: 3000,
    })
    
    setIsCreateDialogOpen(false)
    setSelectedPO(null)
  }

  const handleUpdateChallan = (updatedChallan: Challan) => {
    setChallans(prev => prev.map(challan => 
      challan.id === updatedChallan.id ? updatedChallan : challan
    ))

    toast({
      title: "Challan Updated",
      description: `Challan ${updatedChallan.challanNumber} has been updated successfully`,
      duration: 3000,
    })
    
    setIsDetailsDialogOpen(false)
    setSelectedChallan(null)
  }

  const handleViewChallan = (challan: Challan) => {
    setSelectedChallan(challan)
    setIsDetailsDialogOpen(true)
  }

  const handleStatusUpdate = (challanId: string, newStatus: Challan["status"]) => {
    setChallans(prev => prev.map(challan => 
      challan.id === challanId ? { 
        ...challan, 
        status: newStatus,
        ...(newStatus === "delivered" ? { 
          receivedDate: new Date().toISOString().split('T')[0],
          receivedBy: "Customer"
        } : {})
      } : challan
    ))

    toast({
      title: "Status Updated",
      description: `Challan status updated to ${getStatusBadge(newStatus).label}`,
      duration: 3000,
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const calculateTotalItems = (items: ChallanItem[]) => {
    return items.reduce((sum, item) => sum + item.quantity, 0)
  }

  const calculateTotalValue = (items: ChallanItem[]) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  }

  const statusCounts = challans.reduce((acc, challan) => {
    acc[challan.status] = (acc[challan.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const getNextStatusAction = (currentStatus: Challan["status"]) => {
    const statusFlow = {
      draft: { label: "Dispatch", status: "dispatched", icon: Truck },
      dispatched: { label: "Mark In Transit", status: "in_transit", icon: Package },
      in_transit: { label: "Mark Delivered", status: "delivered", icon: CheckCircle },
      delivered: null,
      cancelled: null
    }
    
    return statusFlow[currentStatus]
  }

  return (
    <div className="flex min-h-screen bg-background flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 overflow-auto w-full">
        <div className="sticky top-0 z-30 bg-card border-b border-border p-4 md:p-6">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground">Challan Management</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Manage delivery challans and track shipment status
          </p>
        </div>

        <div className="p-4 md:p-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium text-blue-800">Total Challans</CardTitle>
                <CardDescription className="text-2xl font-bold text-blue-800">
                  {challans.length}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-gray-50 border-gray-200">
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium text-gray-800">Draft</CardTitle>
                <CardDescription className="text-2xl font-bold text-gray-800">
                  {statusCounts.draft || 0}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium text-blue-800">Dispatched</CardTitle>
                <CardDescription className="text-2xl font-bold text-blue-800">
                  {statusCounts.dispatched || 0}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-orange-50 border-orange-200">
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium text-orange-800">In Transit</CardTitle>
                <CardDescription className="text-2xl font-bold text-orange-800">
                  {statusCounts.in_transit || 0}
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

          {/* POs Without Challans Section */}
          {poWithoutChallans.length > 0 && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">Ready for Challan Creation</CardTitle>
                <CardDescription>
                  {poWithoutChallans.length} purchase order(s) confirmed and ready for challan preparation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {poWithoutChallans.map((po) => (
                    <div key={po.id} className="flex items-center justify-between p-3 border border-green-200 rounded-lg bg-white">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <FileText className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold">{po.poNumber}</p>
                            <p className="text-sm text-muted-foreground">{po.companyName}</p>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {calculateTotalItems(po.lineItems)} items • ৳ {calculateTotalValue(po.lineItems).toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Delivery: {formatDate(po.deliveryDate)}
                          </div>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleCreateChallan(po)}
                        className="gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="w-4 h-4" />
                        Create Challan
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
                placeholder="Search by challan number, PO number, or company..."
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
                <option value="dispatched">Dispatched</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>
          </div>

          {/* Challans Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Challans</CardTitle>
              <CardDescription>
                {filteredChallans.length} challan(s) found • Manage and track delivery status
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="border rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-semibold">Challan #</th>
                      <th className="text-left py-3 px-4 font-semibold">PO Reference</th>
                      <th className="text-left py-3 px-4 font-semibold">Company</th>
                      <th className="text-left py-3 px-4 font-semibold">Issue Date</th>
                      <th className="text-left py-3 px-4 font-semibold">Delivery Date</th>
                      <th className="text-center py-3 px-4 font-semibold">Items</th>
                      <th className="text-center py-3 px-4 font-semibold">Status</th>
                      <th className="text-center py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredChallans.map((challan) => {
                      const statusInfo = getStatusBadge(challan.status)
                      const nextAction = getNextStatusAction(challan.status)
                      const totalItems = calculateTotalItems(challan.items)
                      const deliveredItems = challan.items.reduce((sum, item) => 
                        sum + (item.deliveredQuantity || 0), 0
                      )
                      
                      return (
                        <tr key={challan.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4 font-medium">{challan.challanNumber}</td>
                          <td className="py-3 px-4 text-muted-foreground">{challan.poNumber}</td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{challan.companyName}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {challan.companyAddress}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{formatDate(challan.issueDate)}</td>
                          <td className="py-3 px-4 text-muted-foreground">{formatDate(challan.deliveryDate)}</td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex flex-col items-center">
                              <span className="font-medium">{totalItems}</span>
                              {challan.status === "delivered" && (
                                <span className="text-xs text-green-600">
                                  {deliveredItems} delivered
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant="outline" className={statusInfo.class}>
                              {statusInfo.label}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewChallan(challan)}
                                className="h-8 w-8 p-0"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewChallan(challan)}
                                className="h-8 w-8 p-0"
                                title="Edit Challan"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              
                              {nextAction && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusUpdate(challan.id, nextAction.status)}
                                  className="h-8 px-2 gap-1"
                                >
                                  <nextAction.icon className="w-3 h-3" />
                                  {nextAction.label}
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {filteredChallans.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">No challans found</h3>
                  <p className="text-muted-foreground mt-1">
                    {searchTerm || statusFilter !== "all" 
                      ? "Try adjusting your search or filter criteria" 
                      : "Create your first challan from a purchase order"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Create Challan Dialog */}
      <ChallanDialog
        isOpen={isCreateDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false)
          setSelectedPO(null)
        }}
        purchaseOrder={selectedPO}
        onSave={handleSaveChallan}
      />

      {/* Challan Details Dialog */}
      <ChallanDetailsDialog
        isOpen={isDetailsDialogOpen}
        onClose={() => {
          setIsDetailsDialogOpen(false)
          setSelectedChallan(null)
        }}
        challan={selectedChallan}
        onUpdate={handleUpdateChallan}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  )
}