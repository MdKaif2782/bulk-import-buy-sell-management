"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PurchaseOrder } from "@/types/po"
import { Calendar, Mail, Phone, MapPin, Download, Truck, Package, CheckCircle } from "lucide-react"

interface PurchaseOrderDialogProps {
  isOpen: boolean
  onClose: () => void
  order: PurchaseOrder | null
  onStatusUpdate: (orderId: string, newStatus: PurchaseOrder["status"]) => void
  onDownload: (order: PurchaseOrder) => void
}

export function PurchaseOrderDialog({ isOpen, onClose, order, onStatusUpdate, onDownload }: PurchaseOrderDialogProps) {
  if (!order) return null

  const calculateSubtotal = (lineItems: any[]) => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  }

  const calculateTaxAmount = (subtotal: number, taxPercentage: number) => {
    return (subtotal * taxPercentage) / 100
  }

  const calculateTotal = (lineItems: any[], taxPercentage: number, shippingCharges: number) => {
    const subtotal = calculateSubtotal(lineItems)
    const taxAmount = calculateTaxAmount(subtotal, taxPercentage)
    return subtotal + taxAmount + shippingCharges
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", class: "bg-yellow-100 text-yellow-800" },
      confirmed: { label: "Confirmed", class: "bg-blue-100 text-blue-800" },
      challan_processed: { label: "Challan Processed", class: "bg-purple-100 text-purple-800" },
      dispatched: { label: "Dispatched", class: "bg-orange-100 text-orange-800" },
      delivered: { label: "Delivered", class: "bg-green-100 text-green-800" },
      cancelled: { label: "Cancelled", class: "bg-red-100 text-red-800" }
    }
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
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
      month: "long",
      day: "numeric",
    })
  }

  const subtotal = calculateSubtotal(order.lineItems)
  const taxAmount = calculateTaxAmount(subtotal, order.taxPercentage)
  const total = calculateTotal(order.lineItems, order.taxPercentage, order.shippingCharges)
  const statusInfo = getStatusBadge(order.status)
  const nextAction = getNextStatusAction(order.status)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              Purchase Order - {order.poNumber}
              <Badge className={`ml-2 ${statusInfo.class}`}>
                {statusInfo.label}
              </Badge>
            </div>
            <Button variant="outline" size="sm" onClick={() => onDownload(order)} className="gap-2">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Company Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-semibold text-lg">{order.companyName}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{order.companyEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{order.companyPhone}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <span>{order.companyAddress}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PO Number:</span>
                  <span className="font-medium">{order.poNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quotation Ref:</span>
                  <span className="font-medium">{order.quotationNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Issue Date:</span>
                  <span className="font-medium">{formatDate(order.issueDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Date:</span>
                  <span className="font-medium">{formatDate(order.deliveryDate)}</span>
                </div>
                {order.challanNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Challan Number:</span>
                    <span className="font-medium">{order.challanNumber}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium">Description</th>
                      <th className="text-right py-3 px-4 font-medium">Quantity</th>
                      <th className="text-right py-3 px-4 font-medium">Unit Price</th>
                      <th className="text-right py-3 px-4 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.lineItems.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{item.description}</p>
                            <p className="text-sm text-muted-foreground">Unit: {item.unit}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">{item.quantity.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">৳ {item.unitPrice.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-medium">
                          ৳ {(item.quantity * item.unitPrice).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-w-xs ml-auto">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>৳ {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax ({order.taxPercentage}%):</span>
                  <span>৳ {taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping:</span>
                  <span>৳ {order.shippingCharges.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-bold text-lg">
                  <span>Total:</span>
                  <span>৳ {total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {order.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{order.notes}</p>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.terms}</p>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          {nextAction && (
            <Card>
              <CardHeader>
                <CardTitle>Order Actions</CardTitle>
                <CardDescription>
                  Update the order status to proceed with fulfillment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => onStatusUpdate(order.id, nextAction.status)}
                  className="gap-2"
                  size="lg"
                >
                  <nextAction.icon className="w-5 h-5" />
                  {nextAction.label}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}