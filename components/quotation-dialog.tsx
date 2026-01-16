// components/create-quotation-dialog.tsx
"use client"

import { useState, useMemo, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useCreateQuotationMutation } from "@/lib/store/api/quotationApi"
import { Plus, Minus, Trash2, Upload, X } from "lucide-react"
import { ProductSelectionDialog } from "@/components/seletc-product-dialogue"
import { Inventory } from "@/types/inventory"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"

interface CreateQuotationDialogProps {
  isOpen: boolean
  onClose: () => void
}

// Default templates
const DEFAULT_TERMS = `1. Goods will be supplied as per Quotation.
2. Prices are exclusive of VAT/Tax unless mentioned.
3. Delivery within ${15} working days from the date of Purchase Order.
4. Payment Terms: 50% advance with PO, 50% before delivery.
5. Warranty: 1 year from the date of delivery.
6. Any changes in specification may affect price and delivery time.
7. Quotation valid for 30 days from the date of issue.`

const DEFAULT_PAYMENT_TERMS = `1. 50% advance payment with Purchase Order.
2. 50% payment before delivery/dispatch of goods.
3. Payment through Bank Transfer/Cheque in favor of our company.
4. All payments must be cleared before goods are dispatched.`

export function CreateQuotationDialog({ isOpen, onClose }: CreateQuotationDialogProps) {
  const { toast } = useToast()
  const [createQuotation, { isLoading }] = useCreateQuotationMutation()

  const [formData, setFormData] = useState({
    companyName: "",
    companyAddress: "",
    companyContact: "",
    contactPersonName: "",
    deliveryTerms: "",
    deliveryDays: 15,
    moneyInWords: "",
    validUntil: "",
    subject: "",
    generalTerms: DEFAULT_TERMS,
    paymentTerms: DEFAULT_PAYMENT_TERMS,
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
  const [useDefaultTerms, setUseDefaultTerms] = useState(true)
  const [useDefaultPaymentTerms, setUseDefaultPaymentTerms] = useState(true)

  // Auto-generate subject when items change
  useEffect(() => {
    if (items.length > 0) {
      const productNames = items.map(item => item.productName).join(", ")
      setFormData(prev => ({
        ...prev,
        subject: `Quotation for ${productNames}`
      }))
    }
  }, [items])

  // Calculate totals using useMemo
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

  // Auto-fill money in words when finalTotal changes
  useEffect(() => {
    if (finalTotal > 0) {
      setFormData(prev => ({
        ...prev,
        moneyInWords: convertNumberToWords(finalTotal)
      }))
    }
  }, [finalTotal])

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
        moneyInWords: formData.moneyInWords,
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
      contactPersonName: "",
      deliveryTerms: "",
      deliveryDays: 15,
      moneyInWords: "",
      validUntil: "",
      subject: "",
      generalTerms: DEFAULT_TERMS,
      paymentTerms: DEFAULT_PAYMENT_TERMS,
    })
    setItems([])
    setUseDefaultTerms(true)
    setUseDefaultPaymentTerms(true)
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
      imageUrl: product.imageUrl,
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

  const convertNumberToWords = (num: number): string => {
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
    
    const convertHundreds = (n: number): string => {
      let result = ''
      if (n >= 100) {
        result += units[Math.floor(n / 100)] + ' Hundred '
        n %= 100
      }
      if (n >= 20) {
        result += tens[Math.floor(n / 10)] + ' '
        n %= 10
      } else if (n >= 10) {
        result += teens[n - 10] + ' '
        n = 0
      }
      if (n > 0) {
        result += units[n] + ' '
      }
      return result.trim()
    }

    let words = ''
    const crore = Math.floor(num / 10000000)
    if (crore > 0) {
      words += convertHundreds(crore) + ' Crore '
      num %= 10000000
    }

    const lakh = Math.floor(num / 100000)
    if (lakh > 0) {
      words += convertHundreds(lakh) + ' Lakh '
      num %= 100000
    }

    const thousand = Math.floor(num / 1000)
    if (thousand > 0) {
      words += convertHundreds(thousand) + ' Thousand '
      num %= 1000
    }

    if (num > 0) {
      words += convertHundreds(num) + ' '
    }

    const decimal = Math.round((finalTotal - Math.floor(finalTotal)) * 100)
    if (decimal > 0) {
      words += `and ${decimal}/100`
    }

    return words.trim() + ' Taka Only'
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-[85vw]! max-h-[95vh] overflow-y-auto">
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
                <Label htmlFor="companyContact">Company Contact (Phone)</Label>
                <Input
                  id="companyContact"
                  type="tel"
                  placeholder="+880XXXXXXXXXX"
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
                <Label htmlFor="contactPersonName">Contact Person</Label>
                <Input
                  id="contactPersonName"
                  value={formData.contactPersonName}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPersonName: e.target.value }))}
                />
              </div>
            </div>

            {/* Items Section - moved here after company address */}
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
                  <p className="text-muted-foreground">No items added yet. Select items to auto-fill the subject.</p>
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
              ) : null}
            </div>

            {/* Subject - auto-filled after items selected */}
            {items.length > 0 && (
              <div>
                <Label htmlFor="subject">Subject (Auto-filled)</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  readOnly
                  className="bg-muted"
                />
              </div>
            )}

            {/* Delivery and Validity Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>

            {/* Terms and Conditions Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="generalTerms" className="text-lg">Terms & Conditions</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="useDefaultTerms"
                      checked={useDefaultTerms}
                      onCheckedChange={(checked) => {
                        setUseDefaultTerms(checked as boolean)
                        if (checked) {
                          setFormData(prev => ({ ...prev, generalTerms: DEFAULT_TERMS }))
                        }
                      }}
                    />
                    <Label htmlFor="useDefaultTerms" className="text-sm">Use Default</Label>
                  </div>
                </div>
                <Textarea
                  id="generalTerms"
                  value={formData.generalTerms}
                  onChange={(e) => setFormData(prev => ({ ...prev, generalTerms: e.target.value }))}
                  className="min-h-[200px]"
                />

                <div className="flex items-center justify-between">
                  <Label htmlFor="paymentTerms" className="text-lg">Payment Terms</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="useDefaultPaymentTerms"
                      checked={useDefaultPaymentTerms}
                      onCheckedChange={(checked) => {
                        setUseDefaultPaymentTerms(checked as boolean)
                        if (checked) {
                          setFormData(prev => ({ ...prev, paymentTerms: DEFAULT_PAYMENT_TERMS }))
                        }
                      }}
                    />
                    <Label htmlFor="useDefaultPaymentTerms" className="text-sm">Use Default</Label>
                  </div>
                </div>
                <Textarea
                  id="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>
            </div>

            {/* Items details rendering - shown only when items exist */}
            {items.length > 0 && (
              <div className="space-y-4">
                  {items.map((item, index) => {
                    const itemTotal = itemTotals[index] || 0
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
                              <h4 className="font-medium">
                                {item.productName || "Unnamed Product"}
                              </h4>
                              {item.productCode && (
                                <p className="text-sm text-muted-foreground">
                                  Code: {item.productCode}
                                </p>
                              )}
                              {item.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {item.description}
                                </p>
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
                      </div>
                    )
                  })}
              </div>
            )}

            {/* Summary and Money in Words */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Summary Section */}
              {items.length > 0 && (
                <div className="border rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-lg mb-2">Summary</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">৳ {grandTotal.toLocaleString('en-BD')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Tax:</span>
                    <span className="font-medium">৳ {taxTotal.toLocaleString('en-BD')}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
                    <span>Grand Total:</span>
                    <span>৳ {finalTotal.toLocaleString('en-BD')}</span>
                  </div>
                </div>
              )}

              {/* Money in Words Section */}
              <div className="space-y-3">
                <Label htmlFor="moneyInWords" className="text-lg">Amount in Words (Auto-filled)</Label>
                <Textarea
                  id="moneyInWords"
                  value={formData.moneyInWords}
                  onChange={(e) => setFormData(prev => ({ ...prev, moneyInWords: e.target.value }))}
                  className="min-h-[100px] bg-muted"
                  placeholder="Will be auto-filled when amount is calculated..."
                  readOnly
                />
                {formData.moneyInWords && (
                  <p className="text-sm text-green-600">✓ Amount in words auto-filled</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || items.length === 0 || !formData.companyName || !formData.companyAddress}
              >
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