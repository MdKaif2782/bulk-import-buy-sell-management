"use client"

import { Edit2, Trash2 } from "lucide-react"
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

interface Purchase {
  id: string
  poNumber: string
  supplier: string
  orderDate: string
  expectedDelivery: string
  status: "pending" | "shipped" | "delivered" | "cancelled"
  totalAmount: number
  items: number
  notes: string
}

interface PurchaseTableProps {
  purchases: Purchase[]
  onEdit: (purchase: Purchase) => void
  onDelete: (id: string) => void
}

export function PurchaseTable({ purchases, onEdit, onDelete }: PurchaseTableProps) {
  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: "bg-yellow-100 text-yellow-800",
      shipped: "bg-blue-100 text-blue-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    }
    return statusStyles[status as keyof typeof statusStyles] || statusStyles.pending
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
            <th className="text-left py-3 px-4 font-semibold">PO Number</th>
            <th className="text-left py-3 px-4 font-semibold">Supplier</th>
            <th className="text-left py-3 px-4 font-semibold">Order Date</th>
            <th className="text-left py-3 px-4 font-semibold">Expected Delivery</th>
            <th className="text-center py-3 px-4 font-semibold">Status</th>
            <th className="text-right py-3 px-4 font-semibold">Amount</th>
            <th className="text-center py-3 px-4 font-semibold">Items</th>
            <th className="text-center py-3 px-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((purchase) => (
            <tr key={purchase.id} className="border-b border-border hover:bg-muted/50 transition-colors">
              <td className="py-3 px-4 font-medium">{purchase.poNumber}</td>
              <td className="py-3 px-4">{purchase.supplier}</td>
              <td className="py-3 px-4 text-muted-foreground">{formatDate(purchase.orderDate)}</td>
              <td className="py-3 px-4 text-muted-foreground">{formatDate(purchase.expectedDelivery)}</td>
              <td className="py-3 px-4 text-center">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(purchase.status)}`}
                >
                  {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                </span>
              </td>
              <td className="py-3 px-4 text-right font-semibold">৳ {purchase.totalAmount.toLocaleString()}</td>
              <td className="py-3 px-4 text-center">{purchase.items}</td>
              <td className="py-3 px-4">
                <div className="flex justify-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(purchase)} className="h-8 w-8 p-0">
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
                        <AlertDialogTitle>Delete Purchase Order</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {purchase.poNumber}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="flex gap-3 justify-end">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(purchase.id)}
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
      {purchases.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No purchase orders found. Try adjusting your search or create a new order.
        </div>
      )}
    </div>
  )
}
