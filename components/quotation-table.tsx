"use client"

import { Edit2, Trash2, Eye, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

interface Quotation {
  id: string
  quoteNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  issueDate: string
  dueDate: string
  status: "draft" | "sent" | "accepted" | "rejected" | "invoiced"
  lineItems: LineItem[]
  taxPercentage: number
  notes: string
}

interface QuotationTableProps {
  quotations: Quotation[]
  onEdit: (quotation: Quotation) => void
  onDelete: (id: string) => void
  calculateTotal: (lineItems: LineItem[], taxPercentage: number) => number
  onMarkAccepted?: (quotationId: string, purchaseOrderFile?: File) => void
}

export function QuotationTable({ 
  quotations, 
  onEdit, 
  onDelete, 
  calculateTotal, 
  onMarkAccepted 
}: QuotationTableProps) {
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null)
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false)
  const [purchaseOrderFile, setPurchaseOrderFile] = useState<File | null>(null)
  const { toast } = useToast()

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      draft: "bg-gray-100 text-gray-800",
      sent: "bg-blue-100 text-blue-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      invoiced: "bg-purple-100 text-purple-800",
    }
    return statusStyles[status as keyof typeof statusStyles] || statusStyles.draft
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleMarkAccepted = (quotation: Quotation) => {
    setSelectedQuotation(quotation)
    setIsAcceptDialogOpen(true)
  }

  const handleConfirmAccept = () => {
    if (selectedQuotation) {
      // Check if onMarkAccepted function exists before calling it
      if (onMarkAccepted) {
        onMarkAccepted(selectedQuotation.id, purchaseOrderFile || undefined)
      }
      
      toast({
        title: "Purchase Order Created",
        description: `Purchase order has been created for quotation ${selectedQuotation.quoteNumber}`,
        duration: 5000,
      })
      
      setIsAcceptDialogOpen(false)
      setSelectedQuotation(null)
      setPurchaseOrderFile(null)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setPurchaseOrderFile(file)
    } else if (file) {
      toast({
        title: "Invalid File",
        description: "Please upload a PDF file only.",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const calculateSubtotal = (lineItems: LineItem[]) => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  }

  const calculateTaxAmount = (subtotal: number, taxPercentage: number) => {
    return (subtotal * taxPercentage) / 100
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold">Quote #</th>
              <th className="text-left py-3 px-4 font-semibold">Customer</th>
              <th className="text-left py-3 px-4 font-semibold">Issue Date</th>
              <th className="text-left py-3 px-4 font-semibold">Due Date</th>
              <th className="text-center py-3 px-4 font-semibold">Status</th>
              <th className="text-right py-3 px-4 font-semibold">Total Amount</th>
              <th className="text-center py-3 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotations.map((quotation) => (
              <tr key={quotation.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="py-3 px-4 font-medium">{quotation.quoteNumber}</td>
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium">{quotation.customerName}</p>
                    <p className="text-xs text-muted-foreground">{quotation.customerEmail}</p>
                  </div>
                </td>
                <td className="py-3 px-4 text-muted-foreground">{formatDate(quotation.issueDate)}</td>
                <td className="py-3 px-4 text-muted-foreground">{formatDate(quotation.dueDate)}</td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(quotation.status)}`}
                  >
                    {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-semibold">
                  ৳ {calculateTotal(quotation.lineItems, quotation.taxPercentage).toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(quotation)} className="h-8 w-8 p-0">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    
                    {/* Mark Accepted Button - Only show for sent/draft quotations */}
                    {(quotation.status === "sent" || quotation.status === "draft") && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleMarkAccepted(quotation)}
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                        title="Mark as Accepted"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Quotation</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {quotation.quoteNumber}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex gap-3 justify-end">
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(quotation.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {quotations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No quotations found. Try adjusting your search or create a new quotation.
          </div>
        )}
      </div>

      {/* Mark Accepted Confirmation Dialog */}
      <Dialog open={isAcceptDialogOpen} onOpenChange={setIsAcceptDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Mark Quotation as Accepted</DialogTitle>
            <DialogDescription>
              Confirm the quotation details and upload the purchase order PDF from the client. A new purchase order will be created based on this quotation.
            </DialogDescription>
          </DialogHeader>

          {selectedQuotation && (
            <div className="flex-1 overflow-y-auto space-y-6 px-1">
              {/* Quotation Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold mb-2">Quotation Details</h4>
                  <p className="text-sm"><strong>Quote #:</strong> {selectedQuotation.quoteNumber}</p>
                  <p className="text-sm"><strong>Customer:</strong> {selectedQuotation.customerName}</p>
                  <p className="text-sm"><strong>Email:</strong> {selectedQuotation.customerEmail}</p>
                  <p className="text-sm"><strong>Phone:</strong> {selectedQuotation.customerPhone}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Financial Summary</h4>
                  <p className="text-sm"><strong>Subtotal:</strong> ৳ {calculateSubtotal(selectedQuotation.lineItems).toLocaleString()}</p>
                  <p className="text-sm"><strong>Tax ({selectedQuotation.taxPercentage}%):</strong> ৳ {calculateTaxAmount(calculateSubtotal(selectedQuotation.lineItems), selectedQuotation.taxPercentage).toLocaleString()}</p>
                  <p className="text-sm font-semibold"><strong>Total:</strong> ৳ {calculateTotal(selectedQuotation.lineItems, selectedQuotation.taxPercentage).toLocaleString()}</p>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <h4 className="font-semibold mb-3">Line Items</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left py-2 px-4 font-medium">Description</th>
                        <th className="text-right py-2 px-4 font-medium">Quantity</th>
                        <th className="text-right py-2 px-4 font-medium">Unit Price</th>
                        <th className="text-right py-2 px-4 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedQuotation.lineItems.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="py-2 px-4">{item.description}</td>
                          <td className="py-2 px-4 text-right">{item.quantity}</td>
                          <td className="py-2 px-4 text-right">৳ {item.unitPrice.toLocaleString()}</td>
                          <td className="py-2 px-4 text-right">৳ {(item.quantity * item.unitPrice).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-3">
                <Label htmlFor="purchase-order">Upload Purchase Order PDF (Optional)</Label>
                <Input
                  id="purchase-order"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                />
                <p className="text-sm text-muted-foreground">
                  Upload the signed purchase order document from the client. This is optional but recommended for record keeping.
                </p>
                {purchaseOrderFile && (
                  <p className="text-sm text-green-600">
                    File selected: {purchaseOrderFile.name}
                  </p>
                )}
              </div>

              {/* Confirmation Text */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Confirmation:</strong> By proceeding, you are confirming that all quantities, amounts, and prices are correct. 
                  A new purchase order will be created based on this quotation and the status will be updated to "accepted".
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex-shrink-0 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsAcceptDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmAccept} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Create Purchase Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}