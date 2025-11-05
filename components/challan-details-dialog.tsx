"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Challan } from "@/types/challan"
import { Calendar, MapPin, Truck, User, Phone, Edit, CheckCircle, Package } from "lucide-react"
import { useState } from "react"

interface ChallanDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  challan: Challan | null
  onUpdate: (challan: Challan) => void
  onStatusUpdate: (challanId: string, status: Challan["status"]) => void
}

export function ChallanDetailsDialog({ 
  isOpen, 
  onClose, 
  challan, 
  onUpdate, 
  onStatusUpdate 
}: ChallanDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    vehicleNumber: challan?.vehicleNumber || "",
    driverName: challan?.driverName || "",
    driverPhone: challan?.driverPhone || "",
    notes: challan?.notes || "",
    deliveryDate: challan?.deliveryDate || ""
  })

  if (!challan) return null

  const handleSave = () => {
    const updatedChallan: Challan = {
      ...challan,
      ...formData
    }
    onUpdate(updatedChallan)
    setIsEditing(false)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Draft", class: "bg-gray-100 text-gray-800" },
      dispatched: { label: "Dispatched", class: "bg-blue-100 text-blue-800" },
      in_transit: { label: "In Transit", class: "bg-orange-100 text-orange-800" },
      delivered: { label: "Delivered", class: "bg-green-100 text-green-800" },
      cancelled: { label: "Cancelled", class: "bg-red-100 text-red-800" }
    }
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
  }

  const getNextStatusAction = (currentStatus: Challan["status"]) => {
    const statusFlow = {
      draft: { label: "Dispatch", status: "dispatched", icon: Truck },
      dispatched: { label: "Mark In Transit", status: "in_transit", icon: Package },
      in_transit: { label: "Mark Delivered", status: "delivered", icon: CheckCircle },
      delivered: null,
      cancelled: null
    }
    
    return statusFlow[currentStatus]
  }

  const calculateTotalItems = () => {
    return challan.items.reduce((sum, item) => sum + item.quantity, 0)
  }

  const calculateTotalValue = () => {
    return challan.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const statusInfo = getStatusBadge(challan.status)
  const nextAction = getNextStatusAction(challan.status)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              Delivery Challan - {challan.challanNumber}
              <Badge className={`ml-2 ${statusInfo.class}`}>
                {statusInfo.label}
              </Badge>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-1">
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    Save
                  </Button>
                </>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Company Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-semibold text-lg">{challan.companyName}</p>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <span>{challan.companyAddress}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">PO Reference:</span>
                  <span className="font-medium">{challan.poNumber}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Issue Date:</span>
                  <span className="font-medium">{formatDate(challan.issueDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Date:</span>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={formData.deliveryDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: e.target.value }))}
                      className="w-40"
                    />
                  ) : (
                    <span className="font-medium">{formatDate(challan.deliveryDate)}</span>
                  )}
                </div>
                {challan.receivedDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Received Date:</span>
                    <span className="font-medium">{formatDate(challan.receivedDate)}</span>
                  </div>
                )}
                {challan.receivedBy && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Received By:</span>
                    <span className="font-medium">{challan.receivedBy}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Delivery Personnel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Delivery Personnel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Vehicle Number</Label>
                  {isEditing ? (
                    <Input
                      value={formData.vehicleNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                      placeholder="e.g., DHK-12345"
                    />
                  ) : (
                    <div className="p-2 border rounded-md bg-muted/50">
                      {challan.vehicleNumber || "Not specified"}
                    </div>
                  )}
                </div>
                <div>
                  <Label>Driver Name</Label>
                  {isEditing ? (
                    <Input
                      value={formData.driverName}
                      onChange={(e) => setFormData(prev => ({ ...prev, driverName: e.target.value }))}
                      placeholder="Enter driver name"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{challan.driverName || "Not specified"}</span>
                    </div>
                  )}
                </div>
                <div>
                  <Label>Driver Phone</Label>
                  {isEditing ? (
                    <Input
                      value={formData.driverPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, driverPhone: e.target.value }))}
                      placeholder="Enter driver phone"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{challan.driverPhone || "Not specified"}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Items</CardTitle>
              <CardDescription>
                {calculateTotalItems()} items • Total value: ৳ {calculateTotalValue().toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium">Description</th>
                      <th className="text-right py-3 px-4 font-medium">Ordered Qty</th>
                      <th className="text-right py-3 px-4 font-medium">Delivered Qty</th>
                      <th className="text-right py-3 px-4 font-medium">Unit</th>
                      <th className="text-right py-3 px-4 font-medium">Unit Price</th>
                      <th className="text-right py-3 px-4 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {challan.items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-3 px-4">{item.description}</td>
                        <td className="py-3 px-4 text-right">{item.quantity}</td>
                        <td className="py-3 px-4 text-right">
                          {item.deliveredQuantity || 0}
                        </td>
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

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes & Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any special instructions or notes..."
                  rows={3}
                />
              ) : (
                <p className="text-sm">{challan.notes || "No notes provided"}</p>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {nextAction && !isEditing && (
            <Card>
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
                <CardDescription>
                  Move this challan to the next status in the delivery process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => onStatusUpdate(challan.id, nextAction.status)}
                  className="gap-2"
                  size="lg"
                >
                  <nextAction.icon className="w-5 h-5" />
                  {nextAction.label}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}