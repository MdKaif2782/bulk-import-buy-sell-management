// components/quotation-table.tsx
"use client"

import { Eye, Edit, CheckCircle, XCircle, MoreVertical, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Quotation } from "@/types/quotation"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { JSX } from "react"

interface QuotationTableProps {
  quotations: Quotation[]
  isLoading: boolean
  onEdit: (quotation: Quotation) => void
  onViewDetails: (quotation: Quotation) => void
  onAccept: (quotation: Quotation) => void
  onDelete: (id: string) => void
  onUpdateStatus: (id: string, status: string) => void
  onDownload: (quotation: Quotation) => void // Add this line
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  onPageChange?: (page: number) => void
  currentPage?: number
  getStatusBadge: (status: string) => JSX.Element
}

export function QuotationTable({
  quotations,
  isLoading,
  onEdit,
  onViewDetails,
  onAccept,
  onDelete,
  onUpdateStatus,
  onDownload, // Add this line
  pagination,
  onPageChange,
  currentPage = 1,
  getStatusBadge
}: QuotationTableProps) {
  if (isLoading) {
    return <TableSkeleton />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT'
    }).format(amount)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-semibold">Quotation #</th>
            <th className="text-left py-3 px-4 font-semibold">Company</th>
            <th className="text-left py-3 px-4 font-semibold">Total Amount</th>
            <th className="text-left py-3 px-4 font-semibold">Status</th>
            <th className="text-left py-3 px-4 font-semibold">Created</th>
            <th className="text-left py-3 px-4 font-semibold">Valid Until</th>
            <th className="text-center py-3 px-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {quotations.map((quotation) => (
            <tr key={quotation.id} className="border-b border-border hover:bg-muted/50 transition-colors">
              <td className="py-3 px-4">
                <div className="font-medium">{quotation.quotationNumber}</div>
              </td>
              <td className="py-3 px-4">
                <div>
                  <div className="font-medium">{quotation.companyName}</div>
                  {quotation.companyContact && (
                    <div className="text-xs text-muted-foreground">{quotation.companyContact}</div>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 font-medium">
                {formatCurrency(quotation.totalAmount)}
              </td>
              <td className="py-3 px-4">
                {getStatusBadge(quotation.status)}
              </td>
              <td className="py-3 px-4 text-muted-foreground">
                {formatDate(quotation.createdAt)}
              </td>
              <td className="py-3 px-4 text-muted-foreground">
                {quotation.validUntil ? formatDate(quotation.validUntil) : 'N/A'}
              </td>
              <td className="py-3 px-4">
                <div className="flex justify-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(quotation)}
                    className="h-8 px-2 gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(quotation)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => onDownload(quotation)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </DropdownMenuItem>
                      
                      {quotation.status === 'PENDING' && (
                        <>
                          <DropdownMenuItem onClick={() => onAccept(quotation)}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Accept
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdateStatus(quotation.id, 'REJECTED')}>
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </DropdownMenuItem>
                        </>
                      )}
                      
                      {quotation.status === 'REJECTED' && (
                        <DropdownMenuItem onClick={() => onUpdateStatus(quotation.id, 'PENDING')}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark as Pending
                        </DropdownMenuItem>
                      )}
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                            <XCircle className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Quotation</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete quotation {quotation.quotationNumber}? 
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDelete(quotation.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {quotations.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No quotations found. Try adjusting your search or create a new quotation.
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