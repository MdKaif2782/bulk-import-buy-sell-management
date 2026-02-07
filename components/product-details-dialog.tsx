// components/inventory-details-dialog.tsx
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Inventory } from "@/types/inventory"
import { FileText, Package, Tag, BarChart3, ImageIcon } from "lucide-react"

interface InventoryDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  inventory: Inventory | null
}

export function InventoryDetailsDialog({ isOpen, onClose, inventory }: InventoryDetailsDialogProps) {
  if (!inventory) return null

  const stockStatus = inventory.quantity <= (inventory.minStockLevel || 0) ? "Low" : 
                     inventory.quantity <= (inventory.minStockLevel || 0) * 2 ? "Medium" : "Good"

  const stockStatusColor = {
    Low: "destructive",
    Medium: "secondary",
    Good: "default"
  }[stockStatus]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Product Details - {inventory.productName}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Product Image */}
          {inventory.imageUrl && (
            <Card>
              <CardContent className="p-4">
                <div className="w-full h-56 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={inventory.imageUrl}
                    alt={inventory.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Product Code</label>
                <p className="text-sm font-mono">{inventory.productCode}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Barcode</label>
                <p className="text-sm font-mono">{inventory.barcode || "N/A"}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-sm">{inventory.description || "No description"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Stock Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Stock Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Current Quantity</label>
                <p className="text-sm">{inventory.quantity} units</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Stock Status</label>
                <Badge variant={stockStatusColor as any} className="mt-1">
                  {stockStatus} Stock
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Min Stock Level</label>
                <p className="text-sm">{inventory.minStockLevel || 0} units</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Max Stock Level</label>
                <p className="text-sm">{inventory.maxStockLevel || "Not set"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Pricing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Purchase Price</label>
                <p className="text-sm">৳ {inventory.purchasePrice.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Expected Sale Price</label>
                <p className="text-sm">৳ {inventory.expectedSalePrice.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Order Information */}
          {inventory.purchaseOrder && (
            <Card>
              <CardHeader>
                <CardTitle>Purchase Order Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">PO Number</label>
                  <p className="text-sm font-mono">{inventory.purchaseOrder.poNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Vendor</label>
                  <p className="text-sm">{inventory.purchaseOrder.vendorName}</p>
                </div>
                {inventory.purchaseOrder.vendorCountry && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Vendor Country</label>
                    <p className="text-sm">{inventory.purchaseOrder.vendorCountry}</p>
                  </div>
                )}
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