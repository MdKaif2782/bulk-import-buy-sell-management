// components/inventory-table.tsx
"use client"

import { Edit2, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Inventory } from "@/types/inventory"
import { Skeleton } from "@/components/ui/skeleton"

interface InventoryTableProps {
  inventory: Inventory[]
  isLoading: boolean
  onEdit: (inventory: Inventory) => void
  onViewDetails: (inventory: Inventory) => void
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  onPageChange?: (page: number) => void
  currentPage?: number
}

export function InventoryTable({ 
  inventory, 
  isLoading, 
  onEdit, 
  onViewDetails,
  pagination,
  onPageChange,
  currentPage = 1
}: InventoryTableProps) {
  const getStockStatus = (quantity: number, minStockLevel?: number) => {
    const minLevel = minStockLevel || 0
    if (quantity <= minLevel) return "text-destructive"
    if (quantity <= minLevel * 1.5) return "text-yellow-600"
    return "text-green-600"
  }

  if (isLoading) {
    return <TableSkeleton />
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-semibold">Product Name</th>
            <th className="text-left py-3 px-4 font-semibold">Product Code</th>
            <th className="text-left py-3 px-4 font-semibold">Barcode</th>
            <th className="text-right py-3 px-4 font-semibold">Stock</th>
            <th className="text-right py-3 px-4 font-semibold">Purchase Price</th>
            <th className="text-right py-3 px-4 font-semibold">Sale Price</th>
            <th className="text-left py-3 px-4 font-semibold">Vendor</th>
            <th className="text-center py-3 px-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-colors">
              <td className="py-3 px-4">
                <div>
                  <div className="font-medium">{item.productName}</div>
                  {item.description && (
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {item.description}
                    </div>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-muted-foreground font-mono text-xs">
                {item.productCode}
              </td>
              <td className="py-3 px-4 text-muted-foreground font-mono text-xs">
                {item.barcode || "N/A"}
              </td>
              <td
                className={`py-3 px-4 text-right font-semibold ${getStockStatus(item.quantity, item.minStockLevel)}`}
              >
                {item.quantity}
                {item.minStockLevel && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({item.minStockLevel} min)
                  </span>
                )}
              </td>
              <td className="py-3 px-4 text-right">
                ৳ {item.purchasePrice.toLocaleString()}
              </td>
              <td className="py-3 px-4 text-right">
                ৳ {item.expectedSalePrice.toLocaleString()}
              </td>
              <td className="py-3 px-4">
                {item.purchaseOrder?.vendorName || "N/A"}
              </td>
              <td className="py-3 px-4">
                <div className="flex justify-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onEdit(item)} 
                    className="h-8 w-8 p-0"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(item)}
                    className="h-8 px-2 gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    Details
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {inventory.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No products found. Try adjusting your search.
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-4">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pagination.limit) + 1} to{" "}
            {Math.min(currentPage * pagination.limit, pagination.total)} of{" "}
            {pagination.total} entries
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum: number
              if (pagination.totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange?.(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= pagination.totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 w-20" />
          <Skeleton className="h-12 w-20" />
        </div>
      ))}
    </div>
  )
}