// app/products/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Eye, RefreshCw } from "lucide-react"
import { InventoryDialog } from "@/components/product-dialog"
import { InventoryTable } from "@/components/product-table"
import { useLanguage } from "@/components/language-provider"
import { InventoryDetailsDialog } from "@/components/product-details-dialog"
import {
  useGetInventoryQuery,
  useGetLowStockItemsQuery,
  useUpdateInventoryMutation
} from "@/lib/store/api/inventoryApi"
import { Inventory, UpdateInventoryRequest } from "@/types/inventory"

export default function ProductsPage() {
  const { t } = useLanguage()
  const [searchParams, setSearchParams] = useState({
    page: 1,
    limit: 10,
    search: "",
    sortBy: "productName",
    sortOrder: "asc" as "asc" | "desc"
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [editingInventory, setEditingInventory] = useState<Inventory | null>(null)
  const [viewingInventory, setViewingInventory] = useState<Inventory | null>(null)

  // API calls
  const { 
    data: inventoryResponse, 
    isLoading, 
    isError,
    refetch 
  } = useGetInventoryQuery(searchParams)

  const { 
    data: lowStockItems = [], 
    isLoading: lowStockLoading 
  } = useGetLowStockItemsQuery(10)

  const [updateInventory] = useUpdateInventoryMutation()

  const handleSearch = (searchTerm: string) => {
    setSearchParams(prev => ({
      ...prev,
      search: searchTerm,
      page: 1 // Reset to first page when searching
    }))
  }

  const handlePageChange = (page: number) => {
    setSearchParams(prev => ({
      ...prev,
      page
    }))
  }

  const handleUpdateInventory = async (data: UpdateInventoryRequest) => {
    if (!editingInventory) return
    
    try {
      await updateInventory({
        id: editingInventory.id,
        data
      }).unwrap()
      setIsDialogOpen(false)
      setEditingInventory(null)
    } catch (error) {
      console.error('Failed to update inventory:', error)
    }
  }

  const handleOpenDialog = (inventory?: Inventory) => {
    if (inventory) {
      setEditingInventory(inventory)
    } else {
      setEditingInventory(null)
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingInventory(null)
  }

  const handleViewDetails = (inventory: Inventory) => {
    setViewingInventory(inventory)
    setIsDetailsDialogOpen(true)
  }

  const handleCloseDetailsDialog = () => {
    setIsDetailsDialogOpen(false)
    setViewingInventory(null)
  }

  return (
    <div className="flex min-h-screen bg-background flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 overflow-auto w-full">
        <div className="sticky top-0 z-30 bg-card border-b border-border p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-foreground">{t("products")}</h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                Manage your product inventory and stock levels
              </p>
            </div>
            <Button 
              onClick={() => refetch()} 
              variant="outline" 
              className="mt-2 sm:mt-0 gap-2"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="p-4 md:p-8">
          {/* Stock Alert */}
          {lowStockItems.length > 0 && (
            <Card className="mb-6 border-destructive/50 bg-destructive/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-destructive flex items-center gap-2">
                  Low Stock Alert
                </CardTitle>
                <CardDescription>
                  {lowStockItems.length} product(s) are below reorder level. Please consider placing new orders.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {lowStockItems.slice(0, 5).map(item => (
                    <div key={item.id} className="text-sm bg-destructive/10 px-3 py-1 rounded-full">
                      {item.productName} ({item.quantity} left)
                    </div>
                  ))}
                  {lowStockItems.length > 5 && (
                    <div className="text-sm bg-destructive/10 px-3 py-1 rounded-full">
                      +{lowStockItems.length - 5} more...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by product code, name, or description..."
                value={searchParams.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Inventory Table */}
          <Card>
            <CardHeader>
              <CardTitle>Product Inventory</CardTitle>
              <CardDescription>
                {isLoading ? "Loading..." : `${inventoryResponse?.meta.total || 0} products found`}
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <InventoryTable 
                inventory={inventoryResponse?.data || []}
                isLoading={isLoading}
                onEdit={handleOpenDialog}
                onViewDetails={handleViewDetails}
                pagination={inventoryResponse?.meta}
                onPageChange={handlePageChange}
                currentPage={searchParams.page}
              />
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Inventory Dialog */}
      <InventoryDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSave={handleUpdateInventory}
        inventory={editingInventory}
        isLoading={false} // You can track mutation loading state if needed
      />

      {/* Inventory Details Dialog */}
      <InventoryDetailsDialog
        isOpen={isDetailsDialogOpen}
        onClose={handleCloseDetailsDialog}
        inventory={viewingInventory}
      />
    </div>
  )
}