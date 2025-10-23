"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, TrendingUp } from "lucide-react"
import { PurchaseDialog } from "@/components/purchase-dialog"
import { PurchaseTable } from "@/components/purchase-table"

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

const initialPurchases: Purchase[] = [
  {
    id: "1",
    poNumber: "PO-2025-001",
    supplier: "Supplier A",
    orderDate: "2025-01-15",
    expectedDelivery: "2025-02-15",
    status: "delivered",
    totalAmount: 125000,
    items: 5,
    notes: "Cotton fabric shipment",
  },
  {
    id: "2",
    poNumber: "PO-2025-002",
    supplier: "Supplier B",
    orderDate: "2025-01-20",
    expectedDelivery: "2025-02-20",
    status: "shipped",
    totalAmount: 85000,
    items: 3,
    notes: "Thread and accessories",
  },
  {
    id: "3",
    poNumber: "PO-2025-003",
    supplier: "Supplier C",
    orderDate: "2025-01-25",
    expectedDelivery: "2025-02-25",
    status: "pending",
    totalAmount: 250000,
    items: 8,
    notes: "Silk blend fabric bulk order",
  },
  {
    id: "4",
    poNumber: "PO-2025-004",
    supplier: "Supplier A",
    orderDate: "2025-01-10",
    expectedDelivery: "2025-01-30",
    status: "delivered",
    totalAmount: 95000,
    items: 4,
    notes: "Button and zipper supplies",
  },
]

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null)

  const filteredPurchases = purchases.filter(
    (purchase) =>
      purchase.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.notes.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddPurchase = (newPurchase: Omit<Purchase, "id">) => {
    const purchase: Purchase = {
      ...newPurchase,
      id: Date.now().toString(),
    }
    setPurchases([...purchases, purchase])
    setIsDialogOpen(false)
  }

  const handleEditPurchase = (updatedPurchase: Purchase) => {
    setPurchases(purchases.map((p) => (p.id === updatedPurchase.id ? updatedPurchase : p)))
    setEditingPurchase(null)
    setIsDialogOpen(false)
  }

  const handleDeletePurchase = (id: string) => {
    setPurchases(purchases.filter((p) => p.id !== id))
  }

  const handleOpenDialog = (purchase?: Purchase) => {
    if (purchase) {
      setEditingPurchase(purchase)
    } else {
      setEditingPurchase(null)
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingPurchase(null)
  }

  const stats = {
    totalOrders: purchases.length,
    pendingOrders: purchases.filter((p) => p.status === "pending").length,
    totalValue: purchases.reduce((sum, p) => sum + p.totalAmount, 0),
    shippedOrders: purchases.filter((p) => p.status === "shipped").length,
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground">Purchases & Imports</h1>
            <p className="text-muted-foreground mt-2">Manage purchase orders and track imports</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <TrendingUp className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">All time purchase orders</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">Awaiting shipment</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Transit</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.shippedOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">Currently shipped</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">৳ {(stats.totalValue / 100000).toFixed(1)}L</div>
                <p className="text-xs text-muted-foreground mt-1">Total purchase value</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Add */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by PO number, supplier, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="w-4 h-4" />
              New Purchase Order
            </Button>
          </div>

          {/* Purchases Table */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>{filteredPurchases.length} orders found</CardDescription>
            </CardHeader>
            <CardContent>
              <PurchaseTable purchases={filteredPurchases} onEdit={handleOpenDialog} onDelete={handleDeletePurchase} />
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Purchase Dialog */}
      <PurchaseDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSave={editingPurchase ? handleEditPurchase : handleAddPurchase}
        purchase={editingPurchase}
      />
    </div>
  )
}
