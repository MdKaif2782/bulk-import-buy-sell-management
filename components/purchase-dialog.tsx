"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Purchase {
  id: string
  poNumber: string
  supplier: string
  orderDate: string
  expectedDelivery: string
  status: "pending" | "shipped" | "delivered" | "cancelled"
  totalAmount: number
  items: number
  notes: string
}

interface PurchaseDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (purchase: Purchase | Omit<Purchase, "id">) => void
  purchase?: Purchase | null
}

export function PurchaseDialog({ isOpen, onClose, onSave, purchase }: PurchaseDialogProps) {
  const [formData, setFormData] = useState<Omit<Purchase, "id">>({
    poNumber: "",
    supplier: "",
    orderDate: "",
    expectedDelivery: "",
    status: "pending",
    totalAmount: 0,
    items: 0,
    notes: "",
  })

  useEffect(() => {
    if (purchase) {
      const { id, ...rest } = purchase
      setFormData(rest)
    } else {
      setFormData({
        poNumber: "",
        supplier: "",
        orderDate: "",
        expectedDelivery: "",
        status: "pending",
        totalAmount: 0,
        items: 0,
        notes: "",
      })
    }
  }, [purchase, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "totalAmount" || name === "items" ? Number(value) : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (purchase) {
      onSave({ ...formData, id: purchase.id } as Purchase)
    } else {
      onSave(formData)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{purchase ? "Edit Purchase Order" : "Create Purchase Order"}</DialogTitle>
          <DialogDescription>
            {purchase ? "Update the purchase order details." : "Fill in the details to create a new purchase order."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="poNumber">PO Number</Label>
            <Input
              id="poNumber"
              name="poNumber"
              value={formData.poNumber}
              onChange={handleChange}
              placeholder="e.g., PO-2025-001"
              required
            />
          </div>

          <div>
            <Label htmlFor="supplier">Supplier</Label>
            <Input
              id="supplier"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              placeholder="e.g., Supplier A"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="orderDate">Order Date</Label>
              <Input
                id="orderDate"
                name="orderDate"
                type="date"
                value={formData.orderDate}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="expectedDelivery">Expected Delivery</Label>
              <Input
                id="expectedDelivery"
                name="expectedDelivery"
                type="date"
                value={formData.expectedDelivery}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <Label htmlFor="items">Number of Items</Label>
              <Input
                id="items"
                name="items"
                type="number"
                value={formData.items}
                onChange={handleChange}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="totalAmount">Total Amount (৳)</Label>
            <Input
              id="totalAmount"
              name="totalAmount"
              type="number"
              value={formData.totalAmount}
              onChange={handleChange}
              placeholder="0"
              required
            />
          </div>

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
            <Button type="submit">{purchase ? "Update Order" : "Create Order"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
