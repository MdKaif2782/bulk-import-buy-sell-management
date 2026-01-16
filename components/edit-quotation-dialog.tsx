// components/edit-quotation-dialog.tsx
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useUpdateQuotationMutation } from "@/lib/store/api/quotationApi"
import { Quotation, UpdateQuotationRequest } from "@/types/quotation"

interface EditQuotationDialogProps {
  isOpen: boolean
  onClose: () => void
  quotation: Quotation | null
}

export function EditQuotationDialog({ isOpen, onClose, quotation }: EditQuotationDialogProps) {
  const { toast } = useToast()
  const [updateQuotation, { isLoading }] = useUpdateQuotationMutation()
  
  const [formData, setFormData] = useState<UpdateQuotationRequest>({
    companyName: "",
    companyAddress: "",
    companyContact: "",
    deliveryTerms: "",
    deliveryDays: 0,
    moneyInWords: "",
    validUntil: "",
  })

  useEffect(() => {
    if (quotation) {
      setFormData({
        companyName: quotation.companyName,
        companyAddress: quotation.companyAddress,
        companyContact: quotation.companyContact || "",
        deliveryTerms: quotation.deliveryTerms || "",
        deliveryDays: quotation.deliveryDays || 0,
        moneyInWords: quotation.moneyInWords || "",
        validUntil: quotation.validUntil || "",
      })
    }
  }, [quotation, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!quotation) return

    try {
      await updateQuotation({
        id: quotation.id,
        data: formData
      }).unwrap()

      toast({
        title: "Success",
        description: "Quotation updated successfully",
        variant: "default",
      })

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quotation",
        variant: "destructive",
      })
    }
  }

  if (!quotation) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Quotation</DialogTitle>
          <DialogDescription>
            Update the quotation details for {quotation.quotationNumber}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
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
              <Label htmlFor="companyAddress">Company Address</Label>
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
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Quotation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}