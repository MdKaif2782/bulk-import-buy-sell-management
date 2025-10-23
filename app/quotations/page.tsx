"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, FileText, DollarSign } from "lucide-react"
import { QuotationDialog } from "@/components/quotation-dialog"
import { QuotationTable } from "@/components/quotation-table"

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

const initialQuotations: Quotation[] = [
  {
    id: "1",
    quoteNumber: "QT-2025-001",
    customerName: "ABC Retail Store",
    customerEmail: "abc@retail.com",
    customerPhone: "+880-1700-111111",
    issueDate: "2025-01-20",
    dueDate: "2025-02-20",
    status: "accepted",
    lineItems: [
      { id: "1", description: "Cotton Fabric Roll", quantity: 10, unitPrice: 450 },
      { id: "2", description: "Polyester Thread", quantity: 20, unitPrice: 85 },
    ],
    taxPercentage: 15,
    notes: "Bulk order for retail store",
  },
  {
    id: "2",
    quoteNumber: "QT-2025-002",
    customerName: "XYZ Fashion House",
    customerEmail: "xyz@fashion.com",
    customerPhone: "+880-1700-222222",
    issueDate: "2025-01-25",
    dueDate: "2025-02-25",
    status: "sent",
    lineItems: [
      { id: "1", description: "Silk Blend Fabric", quantity: 5, unitPrice: 850 },
      { id: "2", description: "Buttons (Plastic)", quantity: 500, unitPrice: 12 },
    ],
    taxPercentage: 15,
    notes: "Premium fabric collection",
  },
  {
    id: "3",
    quoteNumber: "QT-2025-003",
    customerName: "Fashion Boutique",
    customerEmail: "boutique@fashion.com",
    customerPhone: "+880-1700-333333",
    issueDate: "2025-01-15",
    dueDate: "2025-02-15",
    status: "invoiced",
    lineItems: [
      { id: "1", description: "Zippers", quantity: 100, unitPrice: 35 },
      { id: "2", description: "Cotton Fabric Roll", quantity: 8, unitPrice: 450 },
    ],
    taxPercentage: 15,
    notes: "Regular order",
  },
]

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>(initialQuotations)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null)

  const filteredQuotations = quotations.filter(
    (q) =>
      q.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddQuotation = (newQuotation: Omit<Quotation, "id">) => {
    const quotation: Quotation = {
      ...newQuotation,
      id: Date.now().toString(),
    }
    setQuotations([...quotations, quotation])
    setIsDialogOpen(false)
  }

  const handleEditQuotation = (updatedQuotation: Quotation) => {
    setQuotations(quotations.map((q) => (q.id === updatedQuotation.id ? updatedQuotation : q)))
    setEditingQuotation(null)
    setIsDialogOpen(false)
  }

  const handleDeleteQuotation = (id: string) => {
    setQuotations(quotations.filter((q) => q.id !== id))
  }

  const handleOpenDialog = (quotation?: Quotation) => {
    if (quotation) {
      setEditingQuotation(quotation)
    } else {
      setEditingQuotation(null)
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingQuotation(null)
  }

  const calculateTotal = (lineItems: LineItem[], taxPercentage: number) => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    const tax = (subtotal * taxPercentage) / 100
    return subtotal + tax
  }

  const stats = {
    totalQuotations: quotations.length,
    acceptedQuotations: quotations.filter((q) => q.status === "accepted").length,
    totalValue: quotations.reduce((sum, q) => sum + calculateTotal(q.lineItems, q.taxPercentage), 0),
    pendingQuotations: quotations.filter((q) => q.status === "sent").length,
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground">Quotations & Billing</h1>
            <p className="text-muted-foreground mt-2">Create quotations and manage customer billing</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Quotations</CardTitle>
                <FileText className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalQuotations}</div>
                <p className="text-xs text-muted-foreground mt-1">All quotations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Accepted</CardTitle>
                <FileText className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.acceptedQuotations}</div>
                <p className="text-xs text-muted-foreground mt-1">Accepted quotations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <FileText className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingQuotations}</div>
                <p className="text-xs text-muted-foreground mt-1">Awaiting response</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">৳ {(stats.totalValue / 100000).toFixed(1)}L</div>
                <p className="text-xs text-muted-foreground mt-1">Combined value</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Add */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by quote number, customer name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="w-4 h-4" />
              New Quotation
            </Button>
          </div>

          {/* Quotations Table */}
          <Card>
            <CardHeader>
              <CardTitle>Quotations & Invoices</CardTitle>
              <CardDescription>{filteredQuotations.length} quotations found</CardDescription>
            </CardHeader>
            <CardContent>
              <QuotationTable
                quotations={filteredQuotations}
                onEdit={handleOpenDialog}
                onDelete={handleDeleteQuotation}
                calculateTotal={calculateTotal}
              />
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Quotation Dialog */}
      <QuotationDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSave={editingQuotation ? handleEditQuotation : handleAddQuotation}
        quotation={editingQuotation}
      />
    </div>
  )
}
