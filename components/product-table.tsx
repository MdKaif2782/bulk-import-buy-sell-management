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

interface Product {
  id: string
  name: string
  sku: string
  category: string
  quantity: number
  reorderLevel: number
  unitPrice: number
  supplier: string
}

interface ProductTableProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
}

export function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  const getStockStatus = (quantity: number, reorderLevel: number) => {
    if (quantity <= reorderLevel) return "text-destructive"
    if (quantity <= reorderLevel * 1.5) return "text-yellow-600"
    return "text-green-600"
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-semibold">Product Name</th>
            <th className="text-left py-3 px-4 font-semibold">SKU</th>
            <th className="text-left py-3 px-4 font-semibold">Category</th>
            <th className="text-right py-3 px-4 font-semibold">Stock</th>
            <th className="text-right py-3 px-4 font-semibold">Unit Price</th>
            <th className="text-left py-3 px-4 font-semibold">Supplier</th>
            <th className="text-center py-3 px-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-border hover:bg-muted/50 transition-colors">
              <td className="py-3 px-4">{product.name}</td>
              <td className="py-3 px-4 text-muted-foreground">{product.sku}</td>
              <td className="py-3 px-4">{product.category}</td>
              <td
                className={`py-3 px-4 text-right font-semibold ${getStockStatus(product.quantity, product.reorderLevel)}`}
              >
                {product.quantity}
                <span className="text-xs text-muted-foreground ml-1">({product.reorderLevel} min)</span>
              </td>
              <td className="py-3 px-4 text-right">৳ {product.unitPrice.toLocaleString()}</td>
              <td className="py-3 px-4">{product.supplier}</td>
              <td className="py-3 px-4">
                <div className="flex justify-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(product)} className="h-8 w-8 p-0">
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
                        <AlertDialogTitle>Delete Product</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {product.name}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="flex gap-3 justify-end">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(product.id)}
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
      {products.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No products found. Try adjusting your search or add a new product.
        </div>
      )}
    </div>
  )
}
