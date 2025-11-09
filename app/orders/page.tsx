"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { 
  Plus, 
  Search, 
  FileText, 
  Truck, 
  DollarSign, 
  Users, 
  Calendar,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  BarChart3,
  Package,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/components/language-provider"
import { useAuth } from "@/hooks/useAuth"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { toast } from "sonner"
import {
  useGetOrdersQuery,
  useGetOrderStatisticsQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
  useGetOrderSummaryQuery,
  useGetInvestorProfitsQuery,
  useGetOrderProductsQuery,
  useGetOrderTimelineQuery,
} from "@/lib/store/api/orderApi"
import type { 
  Order, 
  OrderSummary, 
  InvestorProfitSummary, 
  OrderStatistics,
  CreateOrderData 
} from "@/types/order"

// Order Dialog Component
import { OrderDialog } from "@/components/order-dialog"
import { OrderDetailsDialog } from "@/components/order-details-dialog"

// Loading Components
const OrderStatsSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
    {[1, 2, 3, 4].map((i) => (
      <Card key={i}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="h-4 w-4 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-20 bg-muted rounded animate-pulse mb-1" />
          <div className="h-3 w-32 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    ))}
  </div>
)

const OrderTableSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
        <div className="h-10 w-10 bg-muted rounded animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          <div className="h-3 w-24 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-6 w-16 bg-muted rounded animate-pulse" />
      </div>
    ))}
  </div>
)

export default function OrdersPage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  const limit = 10

  // API Queries
  const { 
    data: ordersData, 
    isLoading: isLoadingOrders, 
    error: ordersError,
    refetch: refetchOrders 
  } = useGetOrdersQuery({ 
    page, 
    limit, 
    status: statusFilter === "all" ? undefined : statusFilter 
  })

  const { 
    data: statistics, 
    isLoading: isLoadingStats,
    error: statsError 
  } = useGetOrderStatisticsQuery()

  // API Mutations
  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation()
  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation()
  const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation()

  // Selected Order Details Queries
  const { data: orderSummary } = useGetOrderSummaryQuery(selectedOrder?.id || "", {
    skip: !selectedOrder
  })
  const { data: investorProfits } = useGetInvestorProfitsQuery(selectedOrder?.id || "", {
    skip: !selectedOrder
  })
  const { data: orderProducts } = useGetOrderProductsQuery(selectedOrder?.id || "", {
    skip: !selectedOrder
  })
  const { data: orderTimeline } = useGetOrderTimelineQuery(selectedOrder?.id || "", {
    skip: !selectedOrder
  })

  const orders = ordersData?.data || []
  const meta = ordersData?.meta

  // Error handling
  useEffect(() => {
    if (ordersError) {
      toast.error("Failed to load orders")
    }
    if (statsError) {
      toast.error("Failed to load statistics")
    }
  }, [ordersError, statsError])

  // Filter orders by search term
  const filteredOrders = orders.filter(order =>
    order.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.quotation.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.quotation.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateOrder = async (orderData: CreateOrderData) => {
    try {
      await createOrder(orderData).unwrap()
      setIsOrderDialogOpen(false)
      toast.success("Order created successfully")
      refetchOrders()
    } catch (error) {
      console.error("Failed to create order:", error)
      toast.error("Failed to create order")
    }
  }

  const handleUpdateOrder = async (id: string, orderData: Partial<CreateOrderData>) => {
    try {
      await updateOrder({ id, data: orderData }).unwrap()
      setIsOrderDialogOpen(false)
      setSelectedOrder(null)
      toast.success("Order updated successfully")
      refetchOrders()
    } catch (error) {
      console.error("Failed to update order:", error)
      toast.error("Failed to update order")
    }
  }

  const handleDeleteOrder = async (id: string) => {
    try {
      await deleteOrder(id).unwrap()
      toast.success("Order deleted successfully")
      refetchOrders()
    } catch (error) {
      console.error("Failed to delete order:", error)
      toast.error("Failed to delete order")
    }
  }

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailsDialogOpen(true)
  }

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsOrderDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACCEPTED": return "bg-green-100 text-green-800"
      case "PENDING": return "bg-yellow-100 text-yellow-800"
      case "REJECTED": return "bg-red-100 text-red-800"
      case "EXPIRED": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-500"
    if (percentage >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="flex min-h-screen bg-background flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 overflow-auto w-full">
          <div className="sticky top-0 z-30 bg-card border-b border-border p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-4xl font-bold text-foreground">Orders</h1>
                <p className="text-sm md:text-base text-muted-foreground mt-1">
                  Manage buyer purchase orders and track order progress
                </p>
              </div>
              <Button 
                onClick={() => setIsOrderDialogOpen(true)}
                className="gap-2 mt-4 md:mt-0"
                disabled={isCreating}
              >
                <Plus className="w-4 h-4" />
                Create Order
              </Button>
            </div>
          </div>

          <div className="p-4 md:p-8">
            {/* Statistics Cards */}
            {isLoadingStats ? (
              <OrderStatsSkeleton />
            ) : statistics && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statistics.totalOrders}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      All time orders
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">৳ {statistics.totalBilledAmount.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total amount billed
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Amount Received</CardTitle>
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">৳ {statistics.totalPaidAmount.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total payments received
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
                    <DollarSign className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">৳ {statistics.pendingAmount.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Awaiting payment
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recent Orders Summary */}
            {statistics?.recentOrders && statistics.recentOrders.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Latest orders created in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {statistics.recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{order.poNumber}</p>
                            <p className="text-sm text-muted-foreground">{order.companyName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">৳ {order.totalAmount.toLocaleString()}</p>
                          <Badge variant="secondary" className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Main Content */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Order Management</CardTitle>
                    <CardDescription>
                      {isLoadingOrders ? "Loading..." : `Total ${meta?.total || 0} orders found`}
                    </CardDescription>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Status Filter */}
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border rounded-md text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="PENDING">Pending</option>
                      <option value="ACCEPTED">Accepted</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="EXPIRED">Expired</option>
                    </select>

                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full sm:w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingOrders ? (
                  <OrderTableSkeleton />
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order Number</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Quotation</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Progress</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                {order.poNumber}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{order.quotation.companyName}</p>
                                <p className="text-sm text-muted-foreground">{order.quotation.companyAddress}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {order.quotation.quotationNumber}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-semibold">
                              ৳ {order.quotation.totalAmount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(order.quotation.status)}>
                                {order.quotation.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress 
                                  value={order.bills.length > 0 ? 100 : order.challans.length > 0 ? 50 : 25} 
                                  className="w-20"
                                />
                                <span className="text-xs text-muted-foreground">
                                  {order.bills.length > 0 ? 'Billed' : order.challans.length > 0 ? 'Dispatched' : 'Processing'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditOrder(order)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Order
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteOrder(order.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Order
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {filteredOrders.length === 0 && (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No orders found</p>
                        <Button 
                          onClick={() => setIsOrderDialogOpen(true)}
                          className="mt-4"
                        >
                          Create Your First Order
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Pagination */}
                {meta && meta.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-muted-foreground">
                      Showing page {page} of {meta.totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                        disabled={page === meta.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Order Dialog */}
        <OrderDialog
          isOpen={isOrderDialogOpen}
          onClose={() => {
            setIsOrderDialogOpen(false)
            setSelectedOrder(null)
          }}
          onSave={selectedOrder ? 
            (data) => handleUpdateOrder(selectedOrder.id, data) : 
            handleCreateOrder
          }
          order={selectedOrder}
          isLoading={isCreating || isUpdating}
        />

        {/* Order Details Dialog */}
        {selectedOrder && (
          <OrderDetailsDialog
            isOpen={isDetailsDialogOpen}
            onClose={() => {
              setIsDetailsDialogOpen(false)
              setSelectedOrder(null)
            }}
            order={selectedOrder}
            summary={orderSummary}
            investorProfits={investorProfits}
            products={orderProducts}
            timeline={orderTimeline}
          />
        )}
      </div>
    </ProtectedRoute>
  )
}