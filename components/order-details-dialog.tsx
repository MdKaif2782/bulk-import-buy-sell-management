"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Truck, DollarSign, Users, Package, Calendar, CircleDot } from "lucide-react"
import type { Order, OrderSummary, InvestorProfitSummary } from "@/types/order"
import { Button } from "./ui/button"

interface OrderDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  order: Order
  summary?: OrderSummary
  investorProfits?: InvestorProfitSummary[]
  products?: any[]
  timeline?: any[]
}

export function OrderDetailsDialog({ 
  isOpen, 
  onClose, 
  order, 
  summary, 
  investorProfits = [], 
  products = [], 
  timeline = [] 
}: OrderDetailsDialogProps) {
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACCEPTED": return "bg-green-100 text-green-800"
      case "PENDING": return "bg-yellow-100 text-yellow-800"
      case "REJECTED": return "bg-red-100 text-red-800"
      case "EXPIRED": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[70vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Order Details: {order.poNumber}
          </DialogTitle>
          <DialogDescription>
            {order.quotation.companyName} • Created on {new Date(order.createdAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="profits">Investor Profits</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-4">
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Order Progress</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{summary.completionPercentage}%</div>
                    <Progress value={summary.completionPercentage} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">৳ {summary.totalBilledAmount.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Across {summary.billCount} bills</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Amount Received</CardTitle>
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">৳ {summary.totalPaidAmount.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      {((summary.totalPaidAmount / summary.totalBilledAmount) * 100).toFixed(1)}% collected
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Profit Distributed</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">৳ {summary.totalProfitDistributed.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">To investors</p>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Number:</span>
                    <span className="font-medium">{order.poNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quotation:</span>
                    <span className="font-medium">{order.quotation.quotationNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Company:</span>
                    <span className="font-medium">{order.quotation.companyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className={getStatusColor(order.quotation.status)}>
                      {order.quotation.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Amount:</span>
                    <span className="font-medium">৳ {order.quotation.totalAmount.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ordered Quantity:</span>
                    <span className="font-medium">{summary?.totalOrderedQuantity || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivered Quantity:</span>
                    <span className="font-medium">{summary?.totalDeliveredQuantity || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Challans Created:</span>
                    <span className="font-medium">{summary?.challanCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bills Created:</span>
                    <span className="font-medium">{summary?.billCount || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Order Products</CardTitle>
                <CardDescription>Products included in this order</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Ordered Qty</TableHead>
                      <TableHead>Delivered Qty</TableHead>
                      <TableHead>Remaining</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.length > 0 ? products.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{product.productName}</p>
                            <p className="text-sm text-muted-foreground">{product.productCode}</p>
                          </div>
                        </TableCell>
                        <TableCell>{product.orderedQuantity}</TableCell>
                        <TableCell>{product.deliveredQuantity}</TableCell>
                        <TableCell>{product.remainingQuantity}</TableCell>
                        <TableCell>৳ {product.unitPrice.toLocaleString()}</TableCell>
                        <TableCell>৳ {product.totalPrice.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={
                            product.status === 'DELIVERED' ? 'default' : 
                            product.status === 'PARTIAL' ? 'secondary' : 'outline'
                          }>
                            {product.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                          No product data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Investor Profits Tab */}
          <TabsContent value="profits">
            <Card>
              <CardHeader>
                <CardTitle>Investor Profit Distribution</CardTitle>
                <CardDescription>Calculated and actual profit distributions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Investor</TableHead>
                      <TableHead>Profit Share</TableHead>
                      <TableHead>Investment</TableHead>
                      <TableHead>Calculated Profit</TableHead>
                      <TableHead>Distributed Profit</TableHead>
                      <TableHead>Difference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {investorProfits.length > 0 ? investorProfits.map((profit, index) => (
                      <TableRow key={profit.investorId}>
                        <TableCell className="font-medium">{profit.investorName}</TableCell>
                        <TableCell>{profit.totalProfitPercentage}%</TableCell>
                        <TableCell>৳ {profit.totalInvestmentAmount.toLocaleString()}</TableCell>
                        <TableCell>৳ {profit.calculatedProfit.toLocaleString()}</TableCell>
                        <TableCell>৳ {profit.actualDistributedProfit.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={
                            profit.calculatedProfit - profit.actualDistributedProfit > 0 
                              ? "text-red-600" 
                              : "text-green-600"
                          }>
                            ৳ {(profit.calculatedProfit - profit.actualDistributedProfit).toLocaleString()}
                          </span>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                          No profit distribution data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Order Timeline</CardTitle>
                <CardDescription>Complete history of order events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeline.length > 0 ? timeline.map((event, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-primary rounded-full" />
                        {index < timeline.length - 1 && <div className="w-0.5 h-full bg-muted mt-1" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{event.description}</p>
                          <Badge variant="outline">{event.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(event.date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CircleDot className="w-12 h-12 mx-auto mb-4" />
                      <p>No timeline events available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Order Documents</CardTitle>
                <CardDescription>Related documents and files</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.pdfUrl && (
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-red-500" />
                        <div>
                          <p className="font-medium">Purchase Order PDF</p>
                          <p className="text-sm text-muted-foreground">Official purchase order document</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={order.pdfUrl} target="_blank" rel="noopener noreferrer">
                          Download
                        </a>
                      </Button>
                    </div>
                  )}

                  {order.externalUrl && (
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-blue-500" />
                        <div>
                          <p className="font-medium">External Reference</p>
                          <p className="text-sm text-muted-foreground">External order tracking link</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={order.externalUrl} target="_blank" rel="noopener noreferrer">
                          View
                        </a>
                      </Button>
                    </div>
                  )}

                  {order.bills.map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-green-500" />
                        <div>
                          <p className="font-medium">Bill: {bill.billNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            Amount: ৳ {bill.totalAmount.toLocaleString()} • {bill.status}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Bill
                      </Button>
                    </div>
                  ))}

                  {!order.pdfUrl && !order.externalUrl && order.bills.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4" />
                      <p>No documents available for this order</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}