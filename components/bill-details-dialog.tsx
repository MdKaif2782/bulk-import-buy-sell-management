"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Bill } from "@/types/billing"
import { Calendar, Building, DollarSign, Download, Edit, CheckCircle } from "lucide-react"
import { useState } from "react"

interface BillDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  bill: Bill | null
  onUpdate: (bill: Bill) => void
  onStatusUpdate: (billId: string, status: Bill["status"], paymentData?: { method: string, date: string, amount: number }) => void
  onDownload: (bill: Bill) => void
}

export function BillDetailsDialog({ 
  isOpen, 
  onClose, 
  bill, 
  onUpdate, 
  onStatusUpdate,
  onDownload 
}: BillDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isRecordingPayment, setIsRecordingPayment] = useState(false)
  const [formData, setFormData] = useState({
    notes: bill?.notes || "",
    terms: bill?.terms || "",
    dueDate: bill?.dueDate || ""
  })
  const [paymentData, setPaymentData] = useState({
    method: "",
    date: new Date().toISOString().split('T')[0],
    amount: bill?.balanceDue || 0
  })

  if (!bill) return null

  const handleSave = () => {
    const updatedBill: Bill = {
      ...bill,
      ...formData
    }
    onUpdate(updatedBill)
    setIsEditing(false)
  }

  const handleRecordPayment = () => {
    if (paymentData.amount > 0 && paymentData.method && paymentData.date) {
      onStatusUpdate(bill.id, "paid", paymentData)
      setIsRecordingPayment(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Draft", class: "bg-gray-100 text-gray-800" },
      sent: { label: "Sent", class: "bg-blue-100 text-blue-800" },
      overdue: { label: "Overdue", class: "bg-red-100 text-red-800" },
      paid: { label: "Paid", class: "bg-green-100 text-green-800" },
      cancelled: { label: "Cancelled", class: "bg-gray-100 text-gray-800" }
    }
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const isOverdue = bill.status === "sent" && new Date(bill.dueDate) < new Date()

  const statusInfo = getStatusBadge(bill.status)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              Invoice - {bill.billNumber}
              <Badge className={`ml-2 ${statusInfo.class}`}>
                {isOverdue ? "Overdue" : statusInfo.label}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onDownload(bill)} className="gap-1">
                <Download className="w-4 h-4" />
                PDF
              </Button>
              {!isEditing && bill.status !== "paid" && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-1">
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
              )}
            </div>
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
                <p className="font-semibold text-lg">{bill.companyName}</p>
                <p className="text-sm text-muted-foreground">{bill.companyEmail}</p>
                <p className="text-sm text-muted-foreground">{bill.companyAddress}</p>
                <div className="flex justify-between text-sm mt-3">
                  <span className="text-muted-foreground">PO Reference:</span>
                  <span className="font-medium">{bill.poNumber}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Invoice Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Issue Date:</span>
                  <span className="font-medium">{formatDate(bill.issueDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date:</span>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="w-40"
                    />
                  ) : (
                    <span className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                      {formatDate(bill.dueDate)}
                    </span>
                  )}
                </div>
                {bill.paymentDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Date:</span>
                    <span className="font-medium">{formatDate(bill.paymentDate)}</span>
                  </div>
                )}
                {bill.paymentMethod && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <span className="font-medium">{bill.paymentMethod}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium">Description</th>
                      <th className="text-right py-3 px-4 font-medium">Quantity</th>
                      <th className="text-right py-3 px-4 font-medium">Unit Price</th>
                      <th className="text-right py-3 px-4 font-medium">Tax Rate</th>
                      <th className="text-right py-3 px-4 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bill.items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-3 px-4">{item.description}</td>
                        <td className="py-3 px-4 text-right">{item.quantity}</td>
                        <td className="py-3 px-4 text-right">৳ {item.unitPrice.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">{item.taxRate}%</td>
                        <td className="py-3 px-4 text-right font-medium">
                          ৳ {item.amount.toLocaleString()}
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
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-w-xs ml-auto">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>৳ {bill.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax:</span>
                  <span>৳ {bill.taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-bold text-lg">
                  <span>Total Amount:</span>
                  <span>৳ {bill.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Paid:</span>
                  <span className="text-green-600">৳ {bill.amountPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-bold text-lg">
                  <span>Balance Due:</span>
                  <span className={bill.balanceDue > 0 ? "text-orange-600" : "text-green-600"}>
                    ৳ {bill.balanceDue.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add any notes for the customer..."
                    rows={3}
                  />
                ) : (
                  <p className="text-sm">{bill.notes}</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Input
                    value={formData.terms}
                    onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                    placeholder="e.g., Net 30 days"
                  />
                ) : (
                  <p className="text-sm">{bill.terms}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          {bill.status !== "paid" && !isRecordingPayment && (
            <Card>
              <CardHeader>
                <CardTitle>Invoice Actions</CardTitle>
                <CardDescription>
                  {bill.status === "draft" 
                    ? "Send this invoice to the customer" 
                    : "Record payment for this invoice"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-3">
                {bill.status === "draft" && (
                  <Button
                    onClick={() => onStatusUpdate(bill.id, "sent")}
                    className="gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Send Invoice
                  </Button>
                )}
                {(bill.status === "sent" || bill.status === "overdue") && (
                  <Button
                    onClick={() => setIsRecordingPayment(true)}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <DollarSign className="w-5 h-5" />
                    Record Payment
                  </Button>
                )}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="paymentAmount">Amount *</Label>
                    <Input
                      id="paymentAmount"
                      type="number"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                      max={bill.balanceDue}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Max: ৳ {bill.balanceDue.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="paymentMethod">Payment Method *</Label>
                    <select 
                      id="paymentMethod"
                      value={paymentData.method}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, method: e.target.value }))}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="">Select method</option>
                      <option value="Cash">Cash</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Check">Check</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Mobile Payment">Mobile Payment</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="paymentDate">Payment Date *</Label>
                    <Input
                      id="paymentDate"
                      type="date"
                      value={paymentData.date}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <Button variant="outline" onClick={() => setIsRecordingPayment(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleRecordPayment}
                    disabled={!paymentData.method || paymentData.amount <= 0 || paymentData.amount > bill.balanceDue}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Record Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Edit Actions */}
          {isEditing && (
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}