// components/retail-sale-dialog.tsx
"use client"

import { useState, useMemo, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useCreateRetailSaleMutation } from "@/lib/store/api/retailSaleApi"
import { Plus, Trash2, ShoppingCart } from "lucide-react"
import { ProductSelectionDialog } from "@/components/seletc-product-dialogue"
import { Inventory } from "@/types/inventory"
import { PaymentMethod, CreateRetailSaleItemRequest, RetailSale } from "@/types/retailSale"

interface CreateRetailSaleDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (sale: RetailSale) => void
}

interface SaleItem extends CreateRetailSaleItemRequest {
  id: string
  productCode: string
  productName: string
  description?: string
  imageUrl?: string
}

export function CreateRetailSaleDialog({ isOpen, onClose, onSuccess }: CreateRetailSaleDialogProps) {
  const { toast } = useToast()
  const [createRetailSale, { isLoading }] = useCreateRetailSaleMutation()

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    paymentMethod: "CASH" as PaymentMethod,
    reference: "",
    discount: 0,
    tax: 0,
    notes: "",
  })

  const [items, setItems] = useState<SaleItem[]>([])
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)

  // Calculate totals
  const { subtotal, totalAmount } = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    const totalAmount = subtotal - formData.discount + formData.tax
    return { subtotal, totalAmount }
  }, [items, formData.discount, formData.tax])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item",
        variant: "destructive",
      })
      return
    }

    try {
      const sale = await createRetailSale({
        items: items.map(item => ({
          inventoryId: item.inventoryId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        paymentMethod: formData.paymentMethod,
        discount: formData.discount,
        tax: formData.tax,
        customerName: formData.customerName || undefined,
        customerPhone: formData.customerPhone || undefined,
        reference: formData.reference || undefined,
        notes: formData.notes || undefined,
      }).unwrap()

      toast({
        title: "Success",
        description: "Sale completed successfully",
        variant: "default",
      })

      handleClose()
      
      // Trigger success dialog
      if (onSuccess) {
        onSuccess(sale)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to complete sale",
        variant: "destructive",
      })
    }
  }

  const handleClose = () => {
    setFormData({
      customerName: "",
      customerPhone: "",
      paymentMethod: "CASH",
      reference: "",
      discount: 0,
      tax: 0,
      notes: "",
    })
    setItems([])
    onClose()
  }

  const handleProductSelect = (product: Inventory) => {
    const newItem: SaleItem = {
      id: `temp-${Date.now()}`,
      inventoryId: product.id,
      productCode: product.productCode,
      productName: product.productName,
      description: product.description,
      imageUrl: product.imageUrl,
      quantity: 1,
      unitPrice: product.expectedSalePrice,
    }
    setItems(prev => [...prev, newItem])
    setIsProductDialogOpen(false)
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const updateItem = (id: string, field: keyof SaleItem, value: any) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const getSelectedProductIds = () => {
    return items.map(item => item.inventoryId)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="!max-w-[90vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Retail Sale</DialogTitle>
            <DialogDescription>
              Create a new retail sale and process payment
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Customer Name (Optional)</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Customer Phone (Optional)</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                  placeholder="+880XXXXXXXXXX"
                />
              </div>
            </div>

            {/* Items Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-lg">Sale Items *</Label>
                <Button
                  type="button"
                  onClick={() => setIsProductDialogOpen(true)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </Button>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
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
                  {items.map((item) => {
                    const itemTotal = item.quantity * item.unitPrice
                    return (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-start gap-3">
                            {item.imageUrl && (
                              <img 
                                src={item.imageUrl} 
                                alt={item.productName}
                                className="w-16 h-16 object-cover rounded border"
                              />
                            )}
                            <div>
                              <h4 className="font-medium">{item.productName}</h4>
                              <p className="text-sm text-muted-foreground">Code: {item.productCode}</p>
                              {item.description && (
                                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                              )}
                            </div>
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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Payment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value: PaymentMethod) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.paymentMethod !== "CASH" && (
                <div>
                  <Label htmlFor="reference">Reference Number</Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                    placeholder="Transaction/Cheque reference"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="discount">Discount (৳)</Label>
                <Input
                  id="discount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.discount}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount: Number(e.target.value) }))}
                />
              </div>

              <div>
                <Label htmlFor="tax">Tax (৳)</Label>
                <Input
                  id="tax"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.tax}
                  onChange={(e) => setFormData(prev => ({ ...prev, tax: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes..."
                className="min-h-20"
              />
            </div>

            {/* Summary */}
            {items.length > 0 && (
              <div className="border rounded-lg p-4 bg-muted/50 space-y-2">
                <h3 className="font-semibold text-lg mb-3">Payment Summary</h3>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">৳ {subtotal.toLocaleString('en-BD', { minimumFractionDigits: 2 })}</span>
                </div>
                {formData.discount > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Discount:</span>
                    <span>- ৳ {formData.discount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {formData.tax > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Tax:</span>
                    <span className="font-medium">৳ {formData.tax.toLocaleString('en-BD', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xl font-bold border-t pt-2 mt-2">
                  <span>Total Amount:</span>
                  <span className="text-green-600">৳ {totalAmount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || items.length === 0}
                className="gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                {isLoading ? "Processing..." : "Complete Sale"}
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
