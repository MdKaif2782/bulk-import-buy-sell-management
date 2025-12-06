"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAcceptQuotationMutation } from "@/lib/store/api/quotationApi"
import { Quotation } from "@/types/quotation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Package, Percent, Edit, Save, X, PlusCircle, MinusCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface AcceptQuotationDialogProps {
  isOpen: boolean
  onClose: () => void
  quotation: Quotation | null
}

interface EditableItem {
  id: string
  inventoryId: string
  productName: string
  productCode: string
  originalQuantity: number
  quantity: number
  originalUnitPrice: number
  unitPrice: number
  originalPackagePrice: number
  packagePrice: number
  originalMrp: number
  mrp: number
  originalTaxPercentage: number
  taxPercentage: number
  isChanged: boolean
}

export function AcceptQuotationDialog({ isOpen, onClose, quotation }: AcceptQuotationDialogProps) {
  const { toast } = useToast()
  const [acceptQuotation, { isLoading }] = useAcceptQuotationMutation()

  // Form states
  const [poDate, setPoDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [pdfUrl, setPdfUrl] = useState<string>("")
  const [externalUrl, setExternalUrl] = useState<string>("")
  const [commissionEnabled, setCommissionEnabled] = useState<boolean>(false)
  const [commission, setCommission] = useState<number>(0)
  const [commissionNotes, setCommissionNotes] = useState<string>("")
  const [commissionPaymentMethod, setCommissionPaymentMethod] = useState<string>("CASH")
  
  // Items state
  const [editableItems, setEditableItems] = useState<EditableItem[]>([])
  const [itemChanges, setItemChanges] = useState<boolean>(false)

  // Initialize items when quotation changes
  useEffect(() => {
    if (quotation) {
      const items: EditableItem[] = quotation.items.map(item => ({
        id: item.id,
        inventoryId: item.inventoryId,
        productName: item.inventory?.productName || "Unknown Product",
        productCode: item.inventory?.productCode || "",
        originalQuantity: item.quantity,
        quantity: item.quantity,
        originalUnitPrice: item.unitPrice,
        unitPrice: item.unitPrice,
        originalPackagePrice: item.packagePrice,
        packagePrice: item.packagePrice,
        originalMrp: item.mrp,
        mrp: item.mrp,
        originalTaxPercentage: item.taxPercentage || 0,
        taxPercentage: item.taxPercentage || 0,
        isChanged: false
      }))
      setEditableItems(items)
      
      // Reset other form fields
      setPoDate(new Date().toISOString().split('T')[0])
      setPdfUrl("")
      setExternalUrl("")
      setCommissionEnabled(false)
      setCommission(0)
      setCommissionNotes("")
      setCommissionPaymentMethod("CASH")
    }
  }, [quotation])

  // Calculate totals
  const calculateTotals = () => {
    let subtotal = 0
    let taxTotal = 0
    let grandTotal = 0

    editableItems.forEach(item => {
      const itemTotal = item.quantity * item.unitPrice
      subtotal += itemTotal
      const itemTax = itemTotal * (item.taxPercentage / 100)
      taxTotal += itemTax
      grandTotal += itemTotal + itemTax
    })

    return { subtotal, taxTotal, grandTotal }
  }

  const { subtotal, taxTotal, grandTotal } = calculateTotals()

  // Check if any item has been changed
  useEffect(() => {
    const hasChanges = editableItems.some(item => 
      item.quantity !== item.originalQuantity ||
      item.unitPrice !== item.originalUnitPrice ||
      item.packagePrice !== item.originalPackagePrice ||
      item.mrp !== item.originalMrp ||
      item.taxPercentage !== item.originalTaxPercentage
    )
    setItemChanges(hasChanges)
  }, [editableItems])

  // Update item field
  const updateItemField = (itemId: string, field: keyof EditableItem, value: number) => {
    setEditableItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const isChanged = 
          (field === 'quantity' && value !== item.originalQuantity) ||
          (field === 'unitPrice' && value !== item.originalUnitPrice) ||
          (field === 'packagePrice' && value !== item.originalPackagePrice) ||
          (field === 'mrp' && value !== item.originalMrp) ||
          (field === 'taxPercentage' && value !== item.originalTaxPercentage)

        return {
          ...item,
          [field]: value,
          isChanged: isChanged || item.isChanged
        }
      }
      return item
    }))
  }

  // Reset item to original values
  const resetItem = (itemId: string) => {
    setEditableItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity: item.originalQuantity,
          unitPrice: item.originalUnitPrice,
          packagePrice: item.originalPackagePrice,
          mrp: item.originalMrp,
          taxPercentage: item.originalTaxPercentage,
          isChanged: false
        }
      }
      return item
    }))
  }

  // Reset all items
  const resetAllItems = () => {
    setEditableItems(prev => prev.map(item => ({
      ...item,
      quantity: item.originalQuantity,
      unitPrice: item.originalUnitPrice,
      packagePrice: item.originalPackagePrice,
      mrp: item.originalMrp,
      taxPercentage: item.originalTaxPercentage,
      isChanged: false
    })))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quotation) return

    try {
      // Prepare items for submission (only send changed items)
      const itemsToSend = editableItems
        .filter(item => item.isChanged)
        .map(item => ({
          inventoryId: item.inventoryId,
          quantity: item.quantity !== item.originalQuantity ? item.quantity : undefined,
          unitPrice: item.unitPrice !== item.originalUnitPrice ? item.unitPrice : undefined,
          packagePrice: item.packagePrice !== item.originalPackagePrice ? item.packagePrice : undefined,
          mrp: item.mrp !== item.originalMrp ? item.mrp : undefined,
          taxPercentage: item.taxPercentage !== item.originalTaxPercentage ? item.taxPercentage : undefined
        }))

      // Prepare payload
      const payload = {
        id: quotation.id,
        data: {
          poDate: poDate ? new Date(poDate).toISOString() : undefined,
          pdfUrl: pdfUrl || undefined,
          externalUrl: externalUrl || undefined,
          commission: commissionEnabled && commission > 0 ? commission : undefined,
          items: itemsToSend.length > 0 ? itemsToSend : undefined
        }
      }

      await acceptQuotation({
        id: payload.id,
        data: payload.data
      }).unwrap()

      toast({
        title: "Success",
        description: "Quotation accepted successfully",
        variant: "default",
      })

      onClose()
    } catch (error: any) {
      console.error("Error accepting quotation:", error)
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to accept quotation",
        variant: "destructive",
      })
    }
  }

  if (!quotation) return null

  const calculateItemTotal = (item: EditableItem) => {
    return item.quantity * item.unitPrice
  }

  const calculateCommissionPercentage = () => {
    if (commission > 0 && grandTotal > 0) {
      return ((commission / grandTotal) * 100).toFixed(2)
    }
    return "0.00"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[80vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Accept Quotation</DialogTitle>
          <DialogDescription>
            Accept quotation {quotation.quotationNumber} for {quotation.companyName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Purchase Order Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Purchase Order Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="poDate">PO Date</Label>
                <Input
                  id="poDate"
                  type="date"
                  value={poDate}
                  onChange={(e) => setPoDate(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="pdfUrl">PDF URL (Optional)</Label>
                <Input
                  id="pdfUrl"
                  type="url"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  placeholder="https://example.com/po.pdf"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="externalUrl">External URL (Optional)</Label>
                <Input
                  id="externalUrl"
                  type="url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://example.com/po"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Items Section - Editable */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Quotation Items</h3>
              {itemChanges && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetAllItems}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Reset All Changes
                </Button>
              )}
            </div>
            
            <div className="space-y-4">
              {editableItems.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{item.productName}</h4>
                        {item.isChanged && (
                          <Badge variant="outline" className="text-orange-600 border-orange-300">
                            <Edit className="w-3 h-3 mr-1" />
                            Modified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Code: {item.productCode}
                      </p>
                    </div>
                    {item.isChanged && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => resetItem(item.id)}
                        className="gap-2"
                      >
                        <X className="w-4 h-4" />
                        Reset
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div>
                      <Label className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        Quantity
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItemField(item.id, 'quantity', Number(e.target.value))}
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Original: {item.originalQuantity}
                      </p>
                    </div>

                    <div>
                      <Label className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        Unit Price
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => updateItemField(item.id, 'unitPrice', Number(e.target.value))}
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Original: ৳{item.originalUnitPrice.toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <Label>MRP</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.mrp}
                        onChange={(e) => updateItemField(item.id, 'mrp', Number(e.target.value))}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Original: ৳{item.originalMrp.toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <Label>Package Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.packagePrice}
                        onChange={(e) => updateItemField(item.id, 'packagePrice', Number(e.target.value))}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Original: ৳{item.originalPackagePrice.toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <Label className="flex items-center gap-1">
                        <Percent className="w-3 h-3" />
                        Tax %
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={item.taxPercentage}
                        onChange={(e) => updateItemField(item.id, 'taxPercentage', Number(e.target.value))}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Original: {item.originalTaxPercentage}%
                      </p>
                    </div>

                    <div>
                      <Label>Total</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={calculateItemTotal(item)}
                        readOnly
                        className="bg-muted font-medium"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Original: ৳{(item.originalQuantity * item.originalUnitPrice).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Totals Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Totals Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">৳{subtotal.toLocaleString('en-BD')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax:</span>
                <span className="font-medium">৳{taxTotal.toLocaleString('en-BD', { minimumFractionDigits: 2 })}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Grand Total:</span>
                <span className="text-blue-700">৳{grandTotal.toLocaleString('en-BD', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Commission Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="commissionEnabled"
                checked={commissionEnabled}
                onCheckedChange={(checked) => {
                  setCommissionEnabled(checked as boolean)
                  if (!checked) {
                    setCommission(0)
                    setCommissionNotes("")
                  }
                }}
              />
              <Label htmlFor="commissionEnabled" className="text-lg font-semibold">
                Add Commission Expense
              </Label>
            </div>

            {commissionEnabled && (
              <div className="border rounded-lg p-4 bg-blue-50 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Commission Amount (৳)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={commission}
                      onChange={(e) => setCommission(Number(e.target.value))}
                      placeholder="0.00"
                    />
                    {commission > 0 && (
                      <p className="text-sm text-blue-600 mt-1">
                        {calculateCommissionPercentage()}% of total
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Payment Method</Label>
                    <Select
                      value={commissionPaymentMethod}
                      onValueChange={setCommissionPaymentMethod}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                        <SelectItem value="CHEQUE">Cheque</SelectItem>
                        <SelectItem value="CARD">Card</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <Label>Commission Notes (Optional)</Label>
                    <Textarea
                      value={commissionNotes}
                      onChange={(e) => setCommissionNotes(e.target.value)}
                      placeholder="Notes about the commission..."
                      className="min-h-[80px]"
                    />
                  </div>
                </div>

                {commission > 0 && (
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">
                      A commission expense of ৳{commission.toLocaleString('en-BD')} 
                      will be created with category "COMMISSIONS" and payment method "{commissionPaymentMethod}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3">Acceptance Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Quotation:</span>
                <span className="font-medium">{quotation.quotationNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Company:</span>
                <span className="font-medium">{quotation.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span>Items Modified:</span>
                <span className="font-medium">
                  {editableItems.filter(item => item.isChanged).length} of {editableItems.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Commission Added:</span>
                <span className="font-medium">
                  {commissionEnabled && commission > 0 ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {isLoading ? "Accepting..." : "Accept Quotation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}