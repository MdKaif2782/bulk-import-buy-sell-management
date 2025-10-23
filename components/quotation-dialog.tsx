"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"

interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

interface Quotation {
  id: string
  quoteNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  issueDate: string
  dueDate: string
  status: "draft" | "sent" | "accepted" | "rejected" | "invoiced"
  lineItems: LineItem[]
  taxPercentage: number
  notes: string
}

interface QuotationDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (quotation: Quotation | Omit<Quotation, "id">) => void
  quotation?: Quotation | null
}

export function QuotationDialog({ isOpen, onClose, onSave, quotation }: QuotationDialogProps) {
  const [formData, setFormData] = useState<Omit<Quotation, "id">>({
    quoteNumber: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    issueDate: "",
    dueDate: "",
    status: "draft",
    lineItems: [{ id: "1", description: "", quantity: 1, unitPrice: 0 }],
    taxPercentage: 15,
    notes: "",
  })

  useEffect(() => {
    if (quotation) {
      const { id, ...rest } = quotation
      setFormData(rest)
    } else {
      setFormData({
        quoteNumber: "",
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        issueDate: "",
        dueDate: "",
        status: "draft",
        lineItems: [{ id: "1", description: "", quantity: 1, unitPrice: 0 }],
        taxPercentage: 15,
        notes: "",
      })
    }
  }, [quotation, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "taxPercentage" ? Number(value) : value,
    }))
  }

  const handleLineItemChange = (index: number, field: string, value: string | number) => {
    const newLineItems = [...formData.lineItems]
    newLineItems[index] = {
      ...newLineItems[index],
      [field]: field === "description" ? value : Number(value),
    }
    setFormData((prev) => ({
      ...prev,
      lineItems: newLineItems,
    }))
  }

  const addLineItem = () => {
    setFormData((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, { id: Date.now().toString(), description: "", quantity: 1, unitPrice: 0 }],
    }))
  }

  const removeLineItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index),
    }))
  }

  const calculateSubtotal = () => {
    return formData.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  }

  const calculateTax = () => {
    return (calculateSubtotal() * formData.taxPercentage) / 100
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (quotation) {
      onSave({ ...formData, id: quotation.id } as Quotation)
    } else {
      onSave(formData)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{quotation ? "Edit Quotation" : "Create New Quotation"}</DialogTitle>
          <DialogDescription>
            {quotation ? "Update the quotation details." : "Fill in the details to create a new quotation."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Information */}
          <div className="space-y-3 border-b pb-4">
            <h3 className="font-semibold">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quoteNumber">Quote Number</Label>
                <Input
                  id="quoteNumber"
                  name="quoteNumber"
                  value={formData.quoteNumber}
                  onChange={handleChange}
                  placeholder="e.g., QT-2025-001"
                  required
                />
              </div>
              <div>
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="e.g., ABC Retail Store"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  name="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  placeholder="customer@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Phone</Label>
                <Input
                  id="customerPhone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  placeholder="+880-1700-000000"
                  required
                />
              </div>
            </div>
          </div>

          {/* Dates and Status */}
          <div className="space-y-3 border-b pb-4">
            <h3 className="font-semibold">Quotation Details</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="issueDate">Issue Date</Label>
                <Input
                  id="issueDate"
                  name="issueDate"
                  type="date"
                  value={formData.issueDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="invoiced">Invoiced</option>
                </select>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-3 border-b pb-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Line Items</h3>
              <Button type="button" variant="outline" size="sm" onClick={addLineItem} className="gap-2 bg-transparent">
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            </div>
            <div className="space-y-2">
              {formData.lineItems.map((item, index) => (
                <div key={item.id} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label className="text-xs">Description</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => handleLineItemChange(index, "description", e.target.value)}
                      placeholder="Product description"
                      required
                    />
                  </div>
                  <div className="w-20">
                    <Label className="text-xs">Qty</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(index, "quantity", e.target.value)}
                      placeholder="1"
                      required
                    />
                  </div>
                  <div className="w-24">
                    <Label className="text-xs">Unit Price</Label>
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleLineItemChange(index, "unitPrice", e.target.value)}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="w-24">
                    <Label className="text-xs">Total</Label>
                    <div className="px-3 py-2 border border-input rounded-md bg-muted text-sm font-semibold">
                      ৳ {(item.quantity * item.unitPrice).toLocaleString()}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLineItem(index)}
                    className="h-10 w-10 p-0 text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-3 border-b pb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="taxPercentage">Tax Percentage</Label>
                <Input
                  id="taxPercentage"
                  name="taxPercentage"
                  type="number"
                  step="0.1"
                  value={formData.taxPercentage}
                  onChange={handleChange}
                  placeholder="15"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-semibold">৳ {calculateSubtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax ({formData.taxPercentage}%):</span>
                  <span className="font-semibold">৳ {calculateTax().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>৳ {calculateTotal().toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any additional notes..."
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground min-h-20"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{quotation ? "Update Quotation" : "Create Quotation"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
