"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, CheckCircle, XCircle, Clock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { QuotationTable } from "@/components/quotation-table"
import { CreateQuotationDialog } from "@/components/quotation-dialog"
import { EditQuotationDialog } from "@/components/edit-quotation-dialog"
import { QuotationDetailsDialog } from "@/components/quotation-detail-dialog"
import { AcceptQuotationDialog } from "@/components/accept-quotation-dialog"
import {
  useGetQuotationsQuery,
  useDeleteQuotationMutation,
  useUpdateQuotationStatusMutation,
} from "@/lib/store/api/quotationApi"
import { Quotation, QuotationSearchParams } from "@/types/quotation"
import { ProtectedRoute } from "@/components/ProtectedRoute"

export default function QuotationsPage() {
  const router = useRouter()
  const { toast } = useToast()

  // ✅ Initialize with defaults (no more undefined errors)
  const [searchParams, setSearchParams] = useState<QuotationSearchParams>({
    page: 1,
    limit: 10,
    search: "",
    status: undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  })

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false)
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null)

  // API calls
  const {
    data: quotationsResponse,
    isLoading,
    isError,
    refetch,
  } = useGetQuotationsQuery(searchParams)

  const [deleteQuotation] = useDeleteQuotationMutation()
  const [updateQuotationStatus] = useUpdateQuotationStatusMutation()

  // ✅ Handlers
  const handleSearch = (searchTerm: string) => {
    setSearchParams(prev => ({
      ...prev,
      search: searchTerm,
      page: 1,
    }))
  }

  const handleDownload = (quotation: Quotation) => {
    const pdfUrl = `https://genuine.inovate.it.com/api/quotations/${quotation.id}/pdf`;
    window.open(pdfUrl, '_blank');
    toast({
      title: "Opening PDF",
      description: "Quotation PDF will open in a new tab.",
    });
  };


  const handleStatusFilter = (
    status: "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED" | ""
  ) => {
    setSearchParams(prev => ({
      ...prev,
      status: status || undefined,
      page: 1,
    }))
  }

  const handlePageChange = (page: number) => {
    setSearchParams(prev => ({
      ...prev,
      page,
    }))
  }

  const handleCreateQuotation = () => setIsCreateDialogOpen(true)

  const handleEditQuotation = (quotation: Quotation) => {
    setSelectedQuotation(quotation)
    setIsEditDialogOpen(true)
  }

  const handleViewDetails = (quotation: Quotation) => {
    setSelectedQuotation(quotation)
    setIsDetailsDialogOpen(true)
  }

  const handleAcceptQuotation = (quotation: Quotation) => {
    setSelectedQuotation(quotation)
    setIsAcceptDialogOpen(true)
  }

  const handleDeleteQuotation = async (id: string) => {
    try {
      await deleteQuotation(id).unwrap()
      toast({
        title: "Success",
        description: "Quotation deleted successfully",
      })
      refetch()
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete quotation",
        variant: "destructive",
      })
    }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateQuotationStatus({ id, status }).unwrap()
      toast({
        title: "Success",
        description: `Quotation status updated to ${status.toLowerCase()}`,
      })
      refetch()
    } catch {
      toast({
        title: "Error",
        description: "Failed to update quotation status",
        variant: "destructive",
      })
    }
  }

  const handleCloseDialogs = () => {
    setIsCreateDialogOpen(false)
    setIsEditDialogOpen(false)
    setIsDetailsDialogOpen(false)
    setIsAcceptDialogOpen(false)
    setSelectedQuotation(null)
  }

  // ✅ Safe status badge renderer
  const getStatusBadge = (status: string) => {
    const configMap = {
      PENDING: { variant: "secondary" as const, icon: Clock },
      ACCEPTED: { variant: "default" as const, icon: CheckCircle },
      REJECTED: { variant: "destructive" as const, icon: XCircle },
      EXPIRED: { variant: "outline" as const, icon: Clock },
    }

    const config = configMap[status as keyof typeof configMap] || configMap.PENDING
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    )
  }

  const stats = {
    total: quotationsResponse?.meta?.total ?? 0,
    pending: quotationsResponse?.data?.filter(q => q.status === "PENDING").length ?? 0,
    accepted: quotationsResponse?.data?.filter(q => q.status === "ACCEPTED").length ?? 0,
    rejected: quotationsResponse?.data?.filter(q => q.status === "REJECTED").length ?? 0,
  }

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="flex min-h-screen bg-background flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 overflow-auto w-full">
          <div className="sticky top-0 z-30 bg-card border-b border-border p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl md:text-4xl font-bold text-foreground">Quotations</h1>
                <p className="text-sm md:text-base text-muted-foreground mt-1">
                  Manage customer quotations and track their status
                </p>
              </div>
              <Button onClick={handleCreateQuotation} className="mt-2 sm:mt-0 gap-2">
                <Plus className="w-4 h-4" />
                Create Quotation
              </Button>
            </div>
          </div>

          <div className="p-4 md:p-8">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[{
                label: "Total",
                value: stats.total
              },
              {
                label: "Pending",
                value: stats.pending,
                color: "text-yellow-600"
              },
              {
                label: "Accepted",
                value: stats.accepted,
                color: "text-green-600"
              },
              {
                label: "Rejected",
                value: stats.rejected,
                color: "text-red-600"
              },
              ].map(({ label, value, color }) => (
                <Card key={label}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${color ?? ""}`}>{value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Search + Filter */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by quotation number, company name..."
                      value={searchParams.search ?? ""}
                      onChange={e => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    {["", "PENDING", "ACCEPTED", "REJECTED"].map(s => (
                      <Button
                        key={s || "ALL"}
                        variant={searchParams.status === s || (!s && !searchParams.status) ? "default" : "outline"}
                        onClick={() =>
                          handleStatusFilter(s as "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "")
                        }
                      >
                        {s || "All"}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Table */}
            <Card>
              <CardHeader>
                <CardTitle>Quotation Management</CardTitle>
                <CardDescription>
                  {isError
                    ? "Error loading quotations"
                    : isLoading
                    ? "Loading..."
                    : `${quotationsResponse?.meta?.total ?? 0} quotations found`}
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <QuotationTable
                  quotations={quotationsResponse?.data ?? []}
                  isLoading={isLoading}
                  onEdit={handleEditQuotation}
                  onViewDetails={handleViewDetails}
                  onAccept={handleAcceptQuotation}
                  onDelete={handleDeleteQuotation}
                  onUpdateStatus={handleUpdateStatus}
                  pagination={quotationsResponse?.meta}
                  onPageChange={handlePageChange}
                  currentPage={searchParams.page}
                  getStatusBadge={getStatusBadge}
                  onDownload={handleDownload}
                />
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Dialogs */}
        <CreateQuotationDialog isOpen={isCreateDialogOpen} onClose={handleCloseDialogs} />
        <EditQuotationDialog isOpen={isEditDialogOpen} onClose={handleCloseDialogs} quotation={selectedQuotation} />
        <QuotationDetailsDialog
          isOpen={isDetailsDialogOpen}
          onClose={handleCloseDialogs}
          quotation={selectedQuotation}
          getStatusBadge={getStatusBadge}
        />
        <AcceptQuotationDialog isOpen={isAcceptDialogOpen} onClose={handleCloseDialogs} quotation={selectedQuotation} />
      </div>
    </ProtectedRoute>
  )
}