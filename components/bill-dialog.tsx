"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PurchaseOrder, Bill } from "@/types/billing"
import { Calendar, Building, DollarSign } from "lucide-react"
import { useState } from "react"

interface BillDialogProps {
  isOpen: boolean
  onClose: () => void
  purchaseOrder: PurchaseOrder | null
  onSave: (billData: Omit<Bill, "id" | "billNumber">) => void
}

export function BillDialog({ isOpen, onClose, purchaseOrder, onSave }: BillDialogProps) {
  const [formData, setFormData] = useState({
    dueDate: "",
    notes: "Thank you for your business. Please make payment within 30 days.",
    terms: "Net 30 days"
  })

  if (!purchaseOrder) return null

  const calculateSubtotal = () => {
    return purchaseOrder.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  }

  const calculateTaxAmount = (subtotal: number) => {
    return (subtotal * purchaseOrder.taxPercentage) / 100
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const taxAmount = calculateTaxAmount(subtotal)
    return subtotal + taxAmount + purchaseOrder.shippingCharges
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const subtotal = calculateSubtotal()
    const taxAmount = calculateTaxAmount(subtotal)
    const totalAmount = calculateTotal()

    const billData: Omit<Bill, "id" | "billNumber"> = {
      poNumber: purchaseOrder.poNumber,
      companyName: purchaseOrder.companyName,
      companyEmail: purchaseOrder.companyEmail,
      companyAddress: purchaseOrder.companyAddress,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: formData.dueDate,
      status: "draft",
      items: purchaseOrder.lineItems.map(item => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: purchaseOrder.taxPercentage,
        amount: item.quantity * item.unitPrice
      })),
      subtotal,
      taxAmount,
      totalAmount,
      amountPaid: 0,
      balanceDue: totalAmount,
      notes: formData.notes,
      terms: formData.terms,
      createdFromPO: purchaseOrder.id
    }

    onSave(billData)
  }

  const subtotal = calculateSubtotal()
  const taxAmount = calculateTaxAmount(subtotal)
  const totalAmount = calculateTotal()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PO Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Purchase Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>PO Number</Label>
                <Input value={purchaseOrder.poNumber} disabled />
              </div>
              <div>
                <Label>Company Name</Label>
                <Input value={purchaseOrder.companyName} disabled />
              </div>
              <div>
                <Label>Company Email</Label>
                <Input value={purchaseOrder.companyEmail} disabled />
              </div>
              <div>
                <Label>Total Order Value</Label>
                <Input value={`৳ ${purchaseOrder.totalAmount.toLocaleString()}`} disabled />
              </div>
            </CardContent>
          </Card>

          {/* Billing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Billing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label>Issue Date</Label>
                <Input value={new Date().toISOString().split('T')[0]} disabled />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any notes for the customer..."
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Input
                  id="terms"
                  value={formData.terms}
                  onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                  placeholder="e.g., Net 30 days"
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Items</CardTitle>
              <CardDescription>
                Items to be billed as per purchase order
              </CardDescription>
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
                    {purchaseOrder.lineItems.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-3 px-4">{item.description}</td>
                        <td className="py-3 px-4 text-right">{item.quantity}</td>
                        <td className="py-3 px-4 text-right">৳ {item.unitPrice.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">{purchaseOrder.taxPercentage}%</td>
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
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-w-xs ml-auto">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>৳ {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax ({purchaseOrder.taxPercentage}%):</span>
                  <span>৳ {taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping:</span>
                  <span>৳ {purchaseOrder.shippingCharges.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-bold text-lg">
                  <span>Total:</span>
                  <span>৳ {totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Invoice
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}