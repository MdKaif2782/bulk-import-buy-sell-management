"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { ProductDialog } from "@/components/product-dialog"
import { ProductTable } from "@/components/product-table"
import { useLanguage } from "@/components/language-provider"

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
  },
]

export default function ProductsPage() {
  const { t } = useLanguage()
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

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
              <ProductTable products={filteredProducts} onEdit={handleOpenDialog} onDelete={handleDeleteProduct} />
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
    </div>
  )
}
