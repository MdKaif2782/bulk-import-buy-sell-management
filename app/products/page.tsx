"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Eye } from "lucide-react"
import { ProductDialog } from "@/components/product-dialog"
import { ProductTable } from "@/components/product-table"
import { useLanguage } from "@/components/language-provider"
import { ProductDetailsDialog } from "@/components/product-details-dialog"

interface Investor {
  id: string
  name: string
  email: string
  phone: string
  sharePercentage: number
  investmentAmount: number
  joinDate: string
  status: "active" | "inactive"
  notes: string
}

interface RecentOrder {
  id: string
  company: string
  orderDate: string
  quantity: number
  status: "pending" | "completed" | "cancelled"
  amount: number
}

interface Product {
  id: string
  name: string
  sku: string
  category: string
  quantity: number
  reorderLevel: number
  unitPrice: number
  supplier: string
  poNo?: string
  investors: Investor[]
  recentOrders: RecentOrder[]
}

const initialProducts: Product[] = [
  {
    id: "1",
    name: "Cotton Fabric Roll",
    sku: "CF-001",
    category: "Textiles",
    quantity: 150,
    reorderLevel: 50,
    unitPrice: 450,
    supplier: "Supplier A",
    poNo: "PO-2024-001",
    investors: [
      {
        id: "inv1",
        name: "John Smith",
        email: "john@example.com",
        phone: "+1-555-0101",
        sharePercentage: 40,
        investmentAmount: 18000,
        joinDate: "2024-01-15",
        status: "active",
        notes: "Lead investor"
      },
      {
        id: "inv2",
        name: "Sarah Johnson",
        email: "sarah@example.com",
        phone: "+1-555-0102",
        sharePercentage: 30,
        investmentAmount: 13500,
        joinDate: "2024-01-20",
        status: "active",
        notes: "Silent partner"
      }
    ],
    recentOrders: [
      {
        id: "ord1",
        company: "Fashion Inc.",
        orderDate: "2024-03-15",
        quantity: 50,
        status: "completed",
        amount: 22500
      },
      {
        id: "ord2",
        company: "Textile World",
        orderDate: "2024-03-10",
        quantity: 25,
        status: "pending",
        amount: 11250
      }
    ]
  },
  {
    id: "2",
    name: "Polyester Thread",
    sku: "PT-002",
    category: "Accessories",
    quantity: 320,
    reorderLevel: 100,
    unitPrice: 85,
    supplier: "Supplier B",
    poNo: "PO-2024-002",
    investors: [
      {
        id: "inv3",
        name: "Mike Wilson",
        email: "mike@example.com",
        phone: "+1-555-0103",
        sharePercentage: 60,
        investmentAmount: 16320,
        joinDate: "2024-02-01",
        status: "active",
        notes: "Strategic investor"
      }
    ],
    recentOrders: [
      {
        id: "ord3",
        company: "Sewing Co.",
        orderDate: "2024-03-14",
        quantity: 100,
        status: "completed",
        amount: 8500
      }
    ]
  },
  {
    id: "3",
    name: "Silk Blend Fabric",
    sku: "SB-003",
    category: "Textiles",
    quantity: 45,
    reorderLevel: 60,
    unitPrice: 850,
    supplier: "Supplier C",
    poNo: "PO-2024-003",
    investors: [
      {
        id: "inv4",
        name: "Emma Davis",
        email: "emma@example.com",
        phone: "+1-555-0104",
        sharePercentage: 25,
        investmentAmount: 9562.5,
        joinDate: "2024-01-10",
        status: "active",
        notes: "Angel investor"
      },
      {
        id: "inv5",
        name: "Robert Brown",
        email: "robert@example.com",
        phone: "+1-555-0105",
        sharePercentage: 25,
        investmentAmount: 9562.5,
        joinDate: "2024-01-12",
        status: "active",
        notes: "VC firm representative"
      }
    ],
    recentOrders: [
      {
        id: "ord4",
        company: "Luxury Fabrics Ltd.",
        orderDate: "2024-03-12",
        quantity: 10,
        status: "completed",
        amount: 8500
      },
      {
        id: "ord5",
        company: "Boutique Designs",
        orderDate: "2024-03-08",
        quantity: 15,
        status: "completed",
        amount: 12750
      }
    ]
  },
  {
    id: "4",
    name: "Buttons (Plastic)",
    sku: "BP-004",
    category: "Accessories",
    quantity: 1200,
    reorderLevel: 300,
    unitPrice: 12,
    supplier: "Supplier A",
    investors: [],
    recentOrders: []
  },
  {
    id: "5",
    name: "Zippers",
    sku: "ZP-005",
    category: "Accessories",
    quantity: 280,
    reorderLevel: 100,
    unitPrice: 35,
    supplier: "Supplier B",
    investors: [
      {
        id: "inv6",
        name: "Lisa Wang",
        email: "lisa@example.com",
        phone: "+1-555-0106",
        sharePercentage: 100,
        investmentAmount: 9800,
        joinDate: "2024-02-15",
        status: "active",
        notes: "Sole investor"
      }
    ],
    recentOrders: [
      {
        id: "ord6",
        company: "Garment Makers",
        orderDate: "2024-03-13",
        quantity: 80,
        status: "pending",
        amount: 2800
      }
    ]
  },
]

export default function ProductsPage() {
  const { t } = useLanguage()
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddProduct = (newProduct: Omit<Product, "id">) => {
    const product: Product = {
      ...newProduct,
      id: Date.now().toString(),
    }
    setProducts([...products, product])
    setIsDialogOpen(false)
  }

  const handleEditProduct = (updatedProduct: Product) => {
    setProducts(products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)))
    setEditingProduct(null)
    setIsDialogOpen(false)
  }

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id))
  }

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
    } else {
      setEditingProduct(null)
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingProduct(null)
  }

  const handleViewDetails = (product: Product) => {
    setViewingProduct(product)
    setIsDetailsDialogOpen(true)
  }

  const handleCloseDetailsDialog = () => {
    setIsDetailsDialogOpen(false)
    setViewingProduct(null)
  }

  const lowStockProducts = products.filter((p) => p.quantity <= p.reorderLevel)

  return (
    <div className="flex min-h-screen bg-background flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 overflow-auto w-full">
        <div className="sticky top-0 z-30 bg-card border-b border-border p-4 md:p-6">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground">{t("products")}</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Manage your product inventory and stock levels
          </p>
        </div>

        <div className="p-4 md:p-8">
          {/* Stock Alert */}
          {lowStockProducts.length > 0 && (
            <Card className="mb-6 border-destructive/50 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive">Low Stock Alert</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {lowStockProducts.length} product(s) are below reorder level. Please consider placing new orders.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Search and Add */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, SKU, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => handleOpenDialog()} className="gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </div>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Product Inventory</CardTitle>
              <CardDescription>{filteredProducts.length} products found</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <ProductTable 
                products={filteredProducts} 
                onEdit={handleOpenDialog} 
                onDelete={handleDeleteProduct}
                onViewDetails={handleViewDetails}
              />
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Product Dialog */}
      <ProductDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSave={editingProduct ? handleEditProduct : handleAddProduct}
        product={editingProduct}
      />

      {/* Product Details Dialog */}
      <ProductDetailsDialog
        isOpen={isDetailsDialogOpen}
        onClose={handleCloseDetailsDialog}
        product={viewingProduct}
      />
    </div>
  )
}