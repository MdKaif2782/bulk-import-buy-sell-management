"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PurchaseOrder, Challan } from "@/types/challan"
import { Calendar, MapPin, FileText } from "lucide-react"
import { useState } from "react"

interface ChallanDialogProps {
  isOpen: boolean
  onClose: () => void
  purchaseOrder: PurchaseOrder | null
  onSave: (challanData: Omit<Challan, "id" | "challanNumber">) => void
}

export function ChallanDialog({ isOpen, onClose, purchaseOrder, onSave }: ChallanDialogProps) {
  const [formData, setFormData] = useState({
    vehicleNumber: "",
    driverName: "",
    driverPhone: "",
    notes: "",
    deliveryDate: purchaseOrder?.deliveryDate || ""
  })

  if (!purchaseOrder) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const challanData: Omit<Challan, "id" | "challanNumber"> = {
      poNumber: purchaseOrder.poNumber,
      companyName: purchaseOrder.companyName,
      companyAddress: purchaseOrder.companyAddress,
      issueDate: new Date().toISOString().split('T')[0],
      deliveryDate: formData.deliveryDate,
      status: "draft",
      items: purchaseOrder.lineItems.map(item => ({
        ...item,
        deliveredQuantity: 0
      })),
      vehicleNumber: formData.vehicleNumber,
      driverName: formData.driverName,
      driverPhone: formData.driverPhone,
      notes: formData.notes,
      createdFromPO: purchaseOrder.id
    }

    onSave(challanData)
  }

  const calculateTotalItems = () => {
    return purchaseOrder.lineItems.reduce((sum, item) => sum + item.quantity, 0)
  }

  const calculateTotalValue = () => {
    return purchaseOrder.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Delivery Challan</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PO Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Purchase Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>PO Number</Label>
                <Input value={purchaseOrder.poNumber} disabled />
              </div>
              <div>
                <Label>Company Name</Label>
                <Input value={purchaseOrder.companyName} disabled />
              </div>
              <div className="md:col-span-2">
                <Label>Company Address</Label>
                <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{purchaseOrder.companyAddress}</span>
                </div>
              </div>
              <div>
                <Label>Total Items</Label>
                <Input value={calculateTotalItems()} disabled />
              </div>
              <div>
                <Label>Order Value</Label>
                <Input value={`৳ ${calculateTotalValue().toLocaleString()}`} disabled />
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deliveryDate">Delivery Date *</Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                <Input
                  id="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                  placeholder="e.g., DHK-12345"
                />
              </div>
              <div>
                <Label htmlFor="driverName">Driver Name</Label>
                <Input
                  id="driverName"
                  value={formData.driverName}
                  onChange={(e) => setFormData(prev => ({ ...prev, driverName: e.target.value }))}
                  placeholder="Enter driver name"
                />
              </div>
              <div>
                <Label htmlFor="driverPhone">Driver Phone</Label>
                <Input
                  id="driverPhone"
                  value={formData.driverPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, driverPhone: e.target.value }))}
                  placeholder="Enter driver phone number"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any special instructions or notes for delivery..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>
                Items to be delivered as per purchase order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium">Description</th>
                      <th className="text-right py-3 px-4 font-medium">Quantity</th>
                      <th className="text-right py-3 px-4 font-medium">Unit</th>
                      <th className="text-right py-3 px-4 font-medium">Unit Price</th>
                      <th className="text-right py-3 px-4 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrder.lineItems.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-3 px-4">{item.description}</td>
                        <td className="py-3 px-4 text-right">{item.quantity}</td>
                        <td className="py-3 px-4 text-right">{item.unit}</td>
                        <td className="py-3 px-4 text-right">৳ {item.unitPrice.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-medium">
                          ৳ {(item.quantity * item.unitPrice).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Challan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}