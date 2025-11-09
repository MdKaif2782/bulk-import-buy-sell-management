// components/quotation-details-dialog.tsx
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Building, Calendar, Package, DollarSign } from "lucide-react"
import { Quotation } from "@/types/quotation"
import { JSX } from "react"

interface QuotationDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  quotation: Quotation | null
  getStatusBadge: (status: string) => JSX.Element
}

export function QuotationDetailsDialog({ 
  isOpen, 
  onClose, 
  quotation, 
  getStatusBadge 
}: QuotationDetailsDialogProps) {
  if (!quotation) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const calculateItemTotal = (item: typeof quotation.items[0]) => {
    return item.quantity * item.unitPrice
  }

  const grandTotal = quotation.items.reduce((total, item) => total + calculateItemTotal(item), 0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Quotation Details - {quotation.quotationNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Header Information */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Quotation Number</label>
                  <p className="text-lg font-semibold">{quotation.quotationNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(quotation.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created Date</label>
                  <p className="text-sm">{formatDate(quotation.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                <p className="text-sm">{quotation.companyName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Contact</label>
                <p className="text-sm">{quotation.companyContact || "N/A"}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Address</label>
                <p className="text-sm">{quotation.companyAddress}</p>
              </div>
              {quotation.deliveryTerms && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Delivery Terms</label>
                  <p className="text-sm">{quotation.deliveryTerms}</p>
                </div>
              )}
              {quotation.deliveryDays && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Delivery Days</label>
                  <p className="text-sm">{quotation.deliveryDays} days</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Quotation Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quotation.items.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Product</label>
                        <p className="text-sm font-medium">
                          {item.inventory?.productName || "N/A"}
                        </p>
                        {item.inventory?.productCode && (
                          <p className="text-xs text-muted-foreground">
                            Code: {item.inventory.productCode}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Quantity</label>
                        <p className="text-sm">{item.quantity}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Unit Price</label>
                        <p className="text-sm">{formatCurrency(item.unitPrice)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Total</label>
                        <p className="text-sm font-medium">
                          {formatCurrency(calculateItemTotal(item))}
                        </p>
                      </div>
                    </div>
                    {item.inventory?.description && (
                      <div className="mt-2">
                        <label className="text-sm font-medium text-muted-foreground">Description</label>
                        <p className="text-sm">{item.inventory.description}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
                {quotation.moneyInWords && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    {quotation.moneyInWords}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Validity */}
          {quotation.validUntil && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Quotation Validity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  This quotation is valid until <strong>{formatDate(quotation.validUntil)}</strong>
                </p>
              </CardContent>
            </Card>
          )}

          {/* Buyer PO Information */}
          {quotation.buyerPO && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Purchase Order Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">PO Number</label>
                    <p className="text-sm font-medium">{quotation.buyerPO.poNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">PO Date</label>
                    <p className="text-sm">{formatDate(quotation.buyerPO.poDate)}</p>
                  </div>
                  {quotation.buyerPO.pdfUrl && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">PDF Document</label>
                      <p className="text-sm">
                        <a href={quotation.buyerPO.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          View PDF
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}