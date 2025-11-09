"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import type { Order, CreateOrderData } from "@/types/order"

interface OrderDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateOrderData) => void
  order?: Order | null
  isLoading?: boolean
}

export function OrderDialog({ isOpen, onClose, onSave, order, isLoading = false }: OrderDialogProps) {
  const [formData, setFormData] = useState<CreateOrderData>({
    quotationId: "",
    poDate: new Date().toISOString().split('T')[0],
    pdfUrl: "",
    externalUrl: ""
  })

  useEffect(() => {
    if (order) {
      setFormData({
        quotationId: order.quotation.id,
        poDate: order.poDate.split('T')[0],
        pdfUrl: order.pdfUrl || "",
        externalUrl: order.externalUrl || ""
      })
    } else {
      setFormData({
        quotationId: "",
        poDate: new Date().toISOString().split('T')[0],
        pdfUrl: "",
        externalUrl: ""
      })
    }
  }, [order, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {order ? "Edit Order" : "Create New Order"}
          </DialogTitle>
          <DialogDescription>
            {order ? "Update order details" : "Create a new order from quotation"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quotationId">Quotation ID</Label>
            <Input
              id="quotationId"
              value={formData.quotationId}
              onChange={(e) => setFormData(prev => ({ ...prev, quotationId: e.target.value }))}
              placeholder="Enter quotation ID"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="poDate">PO Date</Label>
            <Input
              id="poDate"
              type="date"
              value={formData.poDate}
              onChange={(e) => setFormData(prev => ({ ...prev, poDate: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pdfUrl">PDF URL (Optional)</Label>
            <Input
              id="pdfUrl"
              value={formData.pdfUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, pdfUrl: e.target.value }))}
              placeholder="https://example.com/document.pdf"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="externalUrl">External URL (Optional)</Label>
            <Input
              id="externalUrl"
              value={formData.externalUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, externalUrl: e.target.value }))}
              placeholder="https://example.com"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {order ? "Update Order" : "Create Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}