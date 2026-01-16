// components/product-selection-dialog.tsx
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useGetInventoryQuery } from "@/lib/store/api/inventoryApi"
import { Inventory } from "@/types/inventory"
import { Search, ChevronLeft, ChevronRight, Check } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface ProductSelectionDialogProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (product: Inventory) => void
  selectedProducts?: string[] // Array of already selected product IDs
}

export function ProductSelectionDialog({ 
  isOpen, 
  onClose, 
  onSelect,
  selectedProducts = [] 
}: ProductSelectionDialogProps) {
  const [searchParams, setSearchParams] = useState({
    page: 1,
    limit: 10,
    search: "",
    sortBy: 'productName',
    sortOrder: 'asc' as 'asc' | 'desc'
  })

  const { data: inventoryResponse, isLoading } = useGetInventoryQuery(searchParams)

  const handleSearch = (searchTerm: string) => {
    setSearchParams(prev => ({
      ...prev,
      search: searchTerm,
      page: 1
    }))
  }

  const handlePageChange = (page: number) => {
    setSearchParams(prev => ({
      ...prev,
      page
    }))
  }

  const isProductSelected = (productId: string) => {
    return selectedProducts.includes(productId)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Products</DialogTitle>
          <DialogDescription>
            Choose products from your inventory to add to the quotation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name, code, or description..."
              value={searchParams.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Product List */}
          <div className="border rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-4 font-semibold">Select</th>
                  <th className="text-left py-3 px-4 font-semibold">Product Code</th>
                  <th className="text-left py-3 px-4 font-semibold">Product Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Description</th>
                  <th className="text-right py-3 px-4 font-semibold">Stock</th>
                  <th className="text-right py-3 px-4 font-semibold">Sale Price</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <TableSkeleton />
                ) : (
                  inventoryResponse?.data.map((product) => (
                    <tr 
                      key={product.id} 
                      className={`border-b border-border hover:bg-muted/50 transition-colors ${
                        isProductSelected(product.id) ? 'bg-green-50' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <Button
                          variant={isProductSelected(product.id) ? "default" : "outline"}
                          size="sm"
                          onClick={() => onSelect(product)}
                          disabled={isProductSelected(product.id)}
                          className="h-8 w-8 p-0"
                        >
                          {isProductSelected(product.id) ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <span className="text-xs">Add</span>
                          )}
                        </Button>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">
                        {product.productCode}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{product.productName}</div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {product.description || "No description"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={
                          product.quantity <= (product.minStockLevel || 0) 
                            ? "text-destructive font-semibold" 
                            : ""
                        }>
                          {product.quantity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        ৳ {product.expectedSalePrice.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            
            {!isLoading && inventoryResponse?.data.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No products found. Try adjusting your search.
              </div>
            )}
          </div>

          {/* Pagination */}
          {inventoryResponse?.meta && inventoryResponse.meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((searchParams.page - 1) * searchParams.limit) + 1} to{" "}
                {Math.min(searchParams.page * searchParams.limit, inventoryResponse.meta.total)} of{" "}
                {inventoryResponse.meta.total} entries
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(searchParams.page - 1)}
                  disabled={searchParams.page <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: Math.min(5, inventoryResponse.meta.totalPages) }, (_, i) => {
                  let pageNum: number
                  if (inventoryResponse.meta.totalPages <= 5) {
                    pageNum = i + 1
                  } else if (searchParams.page <= 3) {
                    pageNum = i + 1
                  } else if (searchParams.page >= inventoryResponse.meta.totalPages - 2) {
                    pageNum = inventoryResponse.meta.totalPages - 4 + i
                  } else {
                    pageNum = searchParams.page - 2 + i
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={searchParams.page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(searchParams.page + 1)}
                  disabled={searchParams.page >= inventoryResponse.meta.totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <tr key={i} className="border-b border-border">
          <td className="py-3 px-4">
            <Skeleton className="h-8 w-8" />
          </td>
          <td className="py-3 px-4">
            <Skeleton className="h-4 w-16" />
          </td>
          <td className="py-3 px-4">
            <Skeleton className="h-4 w-32" />
          </td>
          <td className="py-3 px-4">
            <Skeleton className="h-4 w-24" />
          </td>
          <td className="py-3 px-4">
            <Skeleton className="h-4 w-12 ml-auto" />
          </td>
          <td className="py-3 px-4">
            <Skeleton className="h-4 w-16 ml-auto" />
          </td>
        </tr>
      ))}
    </>
  )
}