// components/create-quotation-dialog.tsx
"use client"

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useCreateQuotationMutation } from "@/lib/store/api/quotationApi"
import { Plus, Minus, Trash2 } from "lucide-react"
import { ProductSelectionDialog } from "@/components/seletc-product-dialogue"
import { Inventory } from "@/types/inventory"

interface CreateQuotationDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateQuotationDialog({ isOpen, onClose }: CreateQuotationDialogProps) {
  const { toast } = useToast()
  const [createQuotation, { isLoading }] = useCreateQuotationMutation()

  const [formData, setFormData] = useState({
    companyName: "",
    companyAddress: "",
    companyContact: "",
    deliveryTerms: "",
    deliveryDays: 0,
    moneyInWords: "",
    validUntil: "",
  })

  const [items, setItems] = useState<Array<{
    id: string
    inventoryId: string
    productCode: string
    productName: string
    description?: string
    quantity: number
    mrp: number
    unitPrice: number
    packagePrice: number
    taxPercentage: number
  }>>([])

  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)

  // Calculate totals using useMemo to avoid unnecessary recalculations
  const { itemTotals, grandTotal, taxTotal, finalTotal } = useMemo(() => {
    const itemTotals = items.map(item => item.quantity * item.unitPrice)
    const grandTotal = itemTotals.reduce((total, current) => total + current, 0)

    const taxTotal = items.reduce((total, item) => {
      const itemTotal = item.quantity * item.unitPrice
      const taxAmount = itemTotal * (item.taxPercentage / 100)
      return total + taxAmount
    }, 0)

    const finalTotal = grandTotal + taxTotal

    return { itemTotals, grandTotal, taxTotal, finalTotal }
  }, [items])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await createQuotation({
        ...formData,
        validUntil: formData.validUntil
          ? new Date(formData.validUntil).toISOString()
          : undefined,
        items: items.map(item => ({
          inventoryId: item.inventoryId,
          quantity: item.quantity,
          mrp: item.mrp,
          unitPrice: item.unitPrice,
          packagePrice: item.packagePrice,
          taxPercentage: item.taxPercentage || 0,
        })),
        totalAmount: finalTotal,
        taxAmount: taxTotal,
      }).unwrap()


      toast({
        title: "Success",
        description: "Quotation created successfully",
        variant: "default",
      })

      handleClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create quotation",
        variant: "destructive",
      })
    }
  }

  const handleClose = () => {
    setFormData({
      companyName: "",
      companyAddress: "",
      companyContact: "",
      deliveryTerms: "",
      deliveryDays: 0,
      moneyInWords: "",
      validUntil: "",
    })
    setItems([])
    onClose()
  }

  const addEmptyItem = () => {
    const newItem = {
      id: `temp-${Date.now()}`,
      inventoryId: "",
      productCode: "",
      productName: "",
      description: "",
      quantity: 1,
      mrp: 0,
      unitPrice: 0,
      packagePrice: 0,
      taxPercentage: 0,
    }
    setItems(prev => [...prev, newItem])
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const updateItem = (id: string, field: string, value: any) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const handleProductSelect = (product: Inventory) => {
    const newItem = {
      id: `temp-${Date.now()}`,
      inventoryId: product.id,
      productCode: product.productCode,
      productName: product.productName,
      description: product.description,
      quantity: 1,
      mrp: product.expectedSalePrice * 1.2, // 20% markup for MRP
      unitPrice: product.expectedSalePrice,
      packagePrice: 0,
      taxPercentage: 0,
    }
    setItems(prev => [...prev, newItem])
    setIsProductDialogOpen(false)
  }

  const getSelectedProductIds = () => {
    return items.map(item => item.inventoryId).filter(id => id)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="!max-w-[70vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Quotation</DialogTitle>
            <DialogDescription>
              Fill in the quotation details and add items from your inventory.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="companyContact">Company Contact</Label>
                <Input
                  id="companyContact"
                  value={formData.companyContact}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyContact: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="companyAddress">Company Address *</Label>
                <Textarea
                  id="companyAddress"
                  value={formData.companyAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyAddress: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="deliveryTerms">Delivery Terms</Label>
                <Input
                  id="deliveryTerms"
                  value={formData.deliveryTerms}
                  onChange={(e) => setFormData(prev => ({ ...prev, deliveryTerms: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="deliveryDays">Delivery Days</Label>
                <Input
                  id="deliveryDays"
                  type="number"
                  min="0"
                  value={formData.deliveryDays}
                  onChange={(e) => setFormData(prev => ({ ...prev, deliveryDays: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="validUntil">Valid Until</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="moneyInWords">Amount in Words</Label>
                <Textarea
                  id="moneyInWords"
                  value={formData.moneyInWords}
                  onChange={(e) => setFormData(prev => ({ ...prev, moneyInWords: e.target.value }))}
                  placeholder="e.g., Five Thousand Taka Only"
                />
              </div>
            </div>

            {/* Items Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-lg">Quotation Items</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => setIsProductDialogOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add from Inventory
                  </Button>
                </div>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">No items added yet</p>
                  <Button
                    type="button"
                    onClick={() => setIsProductDialogOpen(true)}
                    variant="outline"
                    className="mt-2 gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Select Products
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => {
                    const itemTotal = itemTotals[index] || 0
                    return (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-medium">
                              {item.productName || "Unnamed Product"}
                            </h4>
                            {item.productCode && (
                              <p className="text-sm text-muted-foreground">
                                Code: {item.productCode}
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-destructive h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                              required
                            />
                          </div>

                          <div>
                            <Label>Unit Price (৳)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                              required
                            />
                          </div>

                          <div>
                            <Label>MRP (৳)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.mrp}
                              onChange={(e) => updateItem(item.id, 'mrp', Number(e.target.value))}
                              required
                            />
                          </div>

                          <div>
                            <Label>Package Price (৳)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.packagePrice}
                              onChange={(e) => updateItem(item.id, 'packagePrice', Number(e.target.value))}
                            />
                          </div>

                          <div>
                            <Label>Tax Percentage (%)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              value={item.taxPercentage}
                              onChange={(e) => updateItem(item.id, 'taxPercentage', Number(e.target.value))}
                            />
                          </div>

                          <div className="md:col-span-2">
                            <Label>Total (৳)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={itemTotal}
                              readOnly
                              className="bg-muted font-medium"
                            />
                          </div>
                        </div>

                        {item.description && (
                          <div className="mt-2">
                            <Label>Description</Label>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Summary Section */}
            {items.length > 0 && (
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">৳ {grandTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tax:</span>
                  <span className="font-medium">৳ {taxTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
                  <span>Grand Total:</span>
                  <span>৳ {finalTotal.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || items.length === 0}>
                {isLoading ? "Creating..." : "Create Quotation"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Product Selection Dialog */}
      <ProductSelectionDialog
        isOpen={isProductDialogOpen}
        onClose={() => setIsProductDialogOpen(false)}
        onSelect={handleProductSelect}
        selectedProducts={getSelectedProductIds()}
      />
    </>
  )
}