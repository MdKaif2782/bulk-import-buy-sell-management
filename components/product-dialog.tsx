// components/inventory-dialog.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Inventory, UpdateInventoryRequest } from "@/types/inventory"

interface InventoryDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: UpdateInventoryRequest) => void
  inventory?: Inventory | null
  isLoading?: boolean
}

export function InventoryDialog({ isOpen, onClose, onSave, inventory, isLoading = false }: InventoryDialogProps) {
  const [formData, setFormData] = useState<UpdateInventoryRequest>({
    productName: "",
    description: "",
    expectedSalePrice: 0,
    minStockLevel: 0,
    maxStockLevel: 0,
    barcode: "",
  })

  useEffect(() => {
    if (inventory) {
      setFormData({
        productName: inventory.productName,
        description: inventory.description || "",
        expectedSalePrice: inventory.expectedSalePrice,
        minStockLevel: inventory.minStockLevel || 0,
        maxStockLevel: inventory.maxStockLevel || 0,
        barcode: inventory.barcode || "",
      })
    } else {
      setFormData({
        productName: "",
        description: "",
        expectedSalePrice: 0,
        minStockLevel: 0,
        maxStockLevel: 0,
        barcode: "",
      })
    }
  }, [inventory, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "productName" || name === "description" || name === "barcode" ? value : Number(value),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{inventory ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {inventory
              ? "Update the product details below."
              : "Fill in the product information to add it to your inventory."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="productName">Product Name</Label>
            <Input
              id="productName"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              placeholder="e.g., Cotton Fabric Roll"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Product description..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="barcode">Barcode</Label>
            <Input
              id="barcode"
              name="barcode"
              value={formData.barcode}
              onChange={handleChange}
              placeholder="e.g., 123456789012"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expectedSalePrice">Expected Sale Price (৳)</Label>
              <Input
                id="expectedSalePrice"
                name="expectedSalePrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.expectedSalePrice}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="minStockLevel">Min Stock Level</Label>
              <Input
                id="minStockLevel"
                name="minStockLevel"
                type="number"
                min="0"
                value={formData.minStockLevel}
                onChange={handleChange}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="maxStockLevel">Max Stock Level</Label>
            <Input
              id="maxStockLevel"
              name="maxStockLevel"
              type="number"
              min="0"
              value={formData.maxStockLevel}
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : inventory ? "Update Product" : "Add Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}