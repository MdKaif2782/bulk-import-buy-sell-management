// components/retail-sale-details-dialog.tsx
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ShoppingCart, Calendar, DollarSign, Phone, User, 
  Package, FileText, CreditCard, AlertCircle 
} from "lucide-react"
import { RetailSale } from "@/types/retailSale"

interface RetailSaleDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  sale: RetailSale | null
}

export function RetailSaleDetailsDialog({ isOpen, onClose, sale }: RetailSaleDetailsDialogProps) {
  if (!sale) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPaymentMethodBadge = (method: string) => {
    const config = {
      CASH: { label: "Cash", variant: "default" as const },
      CARD: { label: "Card", variant: "secondary" as const },
      BANK_TRANSFER: { label: "Bank Transfer", variant: "outline" as const },
      CHEQUE: { label: "Cheque", variant: "outline" as const },
    }
    const { label, variant } = config[method as keyof typeof config] || config.CASH
    return <Badge variant={variant}>{label}</Badge>
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw]! max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Sale Details - {sale.saleNumber}
          </DialogTitle>
          <DialogDescription>
            View complete details of this retail sale
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sale Overview */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4" />
                    Sale Number
                  </label>
                  <p className="text-lg font-bold text-blue-600">{sale.saleNumber}</p>
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4" />
                    Sale Date
                  </label>
                  <p className="text-base">{formatDate(sale.saleDate)}</p>
                </div>

                {sale.customerName && (
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-2">
                      <User className="w-4 h-4" />
                      Customer Name
                    </label>
                    <p className="text-base">{sale.customerName}</p>
                  </div>
                )}

                {sale.customerPhone && (
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-2">
                      <Phone className="w-4 h-4" />
                      Customer Phone
                    </label>
                    <p className="text-base">{sale.customerPhone}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-2">
                    <CreditCard className="w-4 h-4" />
                    Payment Method
                  </label>
                  {getPaymentMethodBadge(sale.paymentMethod)}
                </div>

                {sale.reference && (
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                      Reference Number
                    </label>
                    <p className="text-base font-mono">{sale.reference}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Sale Items
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="pb-3 font-semibold">Product</th>
                      <th className="pb-3 font-semibold text-right">Quantity</th>
                      <th className="pb-3 font-semibold text-right">Unit Price</th>
                      <th className="pb-3 font-semibold text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sale.items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-3">
                          <div>
                            <p className="font-medium">{item.inventory.productName}</p>
                            <p className="text-sm text-muted-foreground">Code: {item.inventory.productCode}</p>
                            {item.inventory.description && (
                              <p className="text-sm text-muted-foreground">{item.inventory.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-right">{item.quantity}</td>
                        <td className="py-3 text-right">৳ {item.unitPrice.toLocaleString('en-BD', { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 text-right font-medium">৳ {item.totalPrice.toLocaleString('en-BD', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Amount Summary */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Amount Summary
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium text-lg">৳ {sale.subtotal.toLocaleString('en-BD', { minimumFractionDigits: 2 })}</span>
                </div>
                
                {sale.discount > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Discount:</span>
                    <span className="font-medium">- ৳ {sale.discount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                {sale.tax > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Tax:</span>
                    <span className="font-medium">৳ {sale.tax.toLocaleString('en-BD', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total Amount:</span>
                  <span className="text-green-600">৳ {sale.totalAmount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {sale.notes && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Notes
                </h3>
                <p className="text-base whitespace-pre-line">{sale.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
