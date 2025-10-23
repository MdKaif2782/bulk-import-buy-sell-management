"use client"

import { Edit2, Trash2, Eye } from "lucide-react"
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
}

export function QuotationTable({ quotations, onEdit, onDelete, calculateTotal }: QuotationTableProps) {
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

  return (
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
  )
}
