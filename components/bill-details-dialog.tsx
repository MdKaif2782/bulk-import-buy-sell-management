// components/bill-details-dialog.tsx
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Bill, AddPaymentRequest } from "@/types/bill"
import { Calendar, Building, DollarSign, Download, CheckCircle } from "lucide-react"

interface BillDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  bill: Bill | null
  onAddPayment: (billId: string, paymentData: AddPaymentRequest) => void
  onDownload: (bill: Bill) => void
  isLoading: boolean
}

export function BillDetailsDialog({ 
  isOpen, 
  onClose, 
  bill, 
  onAddPayment,
  onDownload,
  isLoading
}: BillDetailsDialogProps) {
  const [isRecordingPayment, setIsRecordingPayment] = useState(false)
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    paymentMethod: 'CASH' as 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'CARD',
    reference: "",
    notes: ""
  })

  if (!bill) return null

  const handleRecordPayment = () => {
    if (paymentData.amount > 0 && paymentData.amount <= bill.dueAmount) {
      onAddPayment(bill.id, paymentData)
      setIsRecordingPayment(false)
      setPaymentData({
        amount: 0,
        paymentMethod: 'CASH',
        reference: "",
        notes: ""
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: "secondary" as const, label: "Pending" },
      PARTIALLY_PAID: { variant: "default" as const, label: "Partially Paid" },
      PAID: { variant: "default" as const, label: "Paid" },
      OVERDUE: { variant: "destructive" as const, label: "Overdue" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return `৳ ${amount.toLocaleString()}`
  }

  const totalPaid = bill.payments.reduce((sum, payment) => sum + payment.amount, 0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              Bill - {bill.billNumber}
              <Badge className="ml-2">
                {getStatusBadge(bill.status)}
              </Badge>
            </div>
            <Button variant="outline" size="sm" onClick={() => onDownload(bill)} className="gap-1">
              <Download className="w-4 h-4" />
              PDF
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Bill To
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-semibold text-lg">
                  {bill.buyerPO?.quotation?.companyName || "N/A"}
                </p>
                {bill.buyerPO?.quotation?.companyContact && (
                  <p className="text-sm text-muted-foreground">
                    {bill.buyerPO.quotation.companyContact}
                  </p>
                )}
                <div className="flex justify-between text-sm mt-3">
                  <span className="text-muted-foreground">PO Reference:</span>
                  <span className="font-medium">{bill.buyerPO?.poNumber || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Vendor No:</span>
                  <span className="font-medium">{bill.vendorNo}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Bill Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bill Date:</span>
                  <span className="font-medium">{formatDate(bill.billDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VAT Reg No:</span>
                  <span className="font-medium">{bill.vatRegNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Code:</span>
                  <span className="font-medium">{bill.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created By:</span>
                  <span className="font-medium">{bill.user?.name || "N/A"}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Bill Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium">Description</th>
                      <th className="text-right py-3 px-4 font-medium">Quantity</th>
                      <th className="text-right py-3 px-4 font-medium">Unit Price</th>
                      <th className="text-right py-3 px-4 font-medium">Total Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bill.items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{item.productDescription}</p>
                            {item.packagingDescription && (
                              <p className="text-sm text-muted-foreground">
                                {item.packagingDescription}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">{item.quantity}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="py-3 px-4 text-right font-medium">
                          {formatCurrency(item.totalPrice)}
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
              <CardTitle>Bill Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-w-xs ml-auto">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-medium">{formatCurrency(bill.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax Amount:</span>
                  <span className="font-medium">{formatCurrency(bill.taxAmount)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">Amount Paid:</span>
                  <span className="text-green-600 font-medium">{formatCurrency(totalPaid)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-bold text-lg">
                  <span>Due Amount:</span>
                  <span className={bill.dueAmount > 0 ? "text-orange-600" : "text-green-600"}>
                    {formatCurrency(bill.dueAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payments */}
          {bill.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bill.payments.map((payment) => (
                    <div key={payment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{formatCurrency(payment.amount)}</p>
                          <p className="text-sm text-muted-foreground">
                            {payment.paymentMethod} • {formatDate(payment.paymentDate)}
                          </p>
                          {payment.reference && (
                            <p className="text-sm text-muted-foreground">
                              Reference: {payment.reference}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Paid
                        </Badge>
                      </div>
                      {payment.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{payment.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Actions */}
          {bill.dueAmount > 0 && !isRecordingPayment && (
            <Card>
              <CardHeader>
                <CardTitle>Bill Actions</CardTitle>
                <CardDescription>
                  Record a payment for this bill
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => {
                    setIsRecordingPayment(true)
                    setPaymentData(prev => ({ ...prev, amount: bill.dueAmount }))
                  }}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  <DollarSign className="w-5 h-5" />
                  Record Payment
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Payment Recording */}
          {isRecordingPayment && (
            <Card>
              <CardHeader>
                <CardTitle>Record Payment</CardTitle>
                <CardDescription>
                  Enter payment details received from the customer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="paymentAmount">Amount *</Label>
                    <Input
                      id="paymentAmount"
                      type="number"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                      max={bill.dueAmount}
                      min="0.01"
                      step="0.01"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Max: {formatCurrency(bill.dueAmount)}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="paymentMethod">Payment Method *</Label>
                    <select 
                      id="paymentMethod"
                      value={paymentData.paymentMethod}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="CASH">Cash</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="CHEQUE">Cheque</option>
                      <option value="CARD">Card</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="reference">Reference</Label>
                    <Input
                      id="reference"
                      value={paymentData.reference}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, reference: e.target.value }))}
                      placeholder="e.g., Transaction ID"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={paymentData.notes}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional payment notes..."
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <Button variant="outline" onClick={() => setIsRecordingPayment(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleRecordPayment}
                    disabled={isLoading || !paymentData.amount || paymentData.amount <= 0 || paymentData.amount > bill.dueAmount}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {isLoading ? "Recording..." : "Record Payment"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}