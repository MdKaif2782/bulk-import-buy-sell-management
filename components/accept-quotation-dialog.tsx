"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAcceptQuotationMutation } from "@/lib/store/api/quotationApi"
import { Quotation } from "@/types/quotation"

interface AcceptQuotationDialogProps {
  isOpen: boolean
  onClose: () => void
  quotation: Quotation | null
}

export function AcceptQuotationDialog({ isOpen, onClose, quotation }: AcceptQuotationDialogProps) {
  const { toast } = useToast()
  const [acceptQuotation, { isLoading }] = useAcceptQuotationMutation()

  // 🧠 Store ISO internally, display only date portion in input
  const [formData, setFormData] = useState({
    poDate: new Date().toISOString(),
    pdfUrl: "",
    externalUrl: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quotation) return

    try {
      // 🔥 Convert back to ISO when submitting
      const payload = {
        id: quotation.id,
        data: {
          ...formData,
          poDate: new Date(formData.poDate).toISOString(),
        },
      }

      await acceptQuotation(payload).unwrap()

      toast({
        title: "Success",
        description: "Quotation accepted and purchase order created successfully",
        variant: "default",
      })

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept quotation",
        variant: "destructive",
      })
    }
  }

  if (!quotation) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Accept Quotation</DialogTitle>
          <DialogDescription>
            Accept quotation {quotation.quotationNumber} and create a purchase order.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 🗓 Date Input */}
          <div>
            <Label htmlFor="poDate">Purchase Order Date</Label>
            <Input
              id="poDate"
              type="date"
              value={formData.poDate.split("T")[0]} // ✅ only YYYY-MM-DD for display
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  poDate: new Date(e.target.value).toISOString(), // ✅ convert immediately to ISO
                }))
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="pdfUrl">PDF URL (Optional)</Label>
            <Input
              id="pdfUrl"
              type="url"
              value={formData.pdfUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, pdfUrl: e.target.value }))}
              placeholder="https://example.com/po.pdf"
            />
          </div>

          <div>
            <Label htmlFor="externalUrl">External URL (Optional)</Label>
            <Input
              id="externalUrl"
              type="url"
              value={formData.externalUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, externalUrl: e.target.value }))}
              placeholder="https://example.com/po"
            />
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Summary</h4>
            <p className="text-sm">Quotation: {quotation.quotationNumber}</p>
            <p className="text-sm">Company: {quotation.companyName}</p>
            <p className="text-sm">Total Amount: ${quotation.totalAmount}</p>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Accepting..." : "Accept Quotation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
