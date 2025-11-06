"use client"

import { Edit2, Trash2, ToggleLeft, ToggleRight, Loader2 } from "lucide-react"
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
import type { Investor as ApiInvestor } from "@/types/investor"

interface InvestorTableProps {
  investors: ApiInvestor[]
  onEdit: (investor: ApiInvestor) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string) => void
  isLoading?: boolean
}

export function InvestorTable({ investors, onEdit, onDelete, onToggleStatus, isLoading = false }: InvestorTableProps) {
  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? "bg-green-100 text-green-800 border border-green-200" 
      : "bg-gray-100 text-gray-800 border border-gray-200"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getTotalInvestment = (investor: ApiInvestor) => {
    return investor.investments?.reduce((sum, inv) => sum + inv.investmentAmount, 0) || 0
  }

  const getActiveInvestments = (investor: ApiInvestor) => {
    return investor.investments?.filter(inv => 
      !['CANCELLED', 'RECEIVED'].includes(inv.purchaseOrder.status)
    ).length || 0
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-semibold">Name</th>
            <th className="text-left py-3 px-4 font-semibold">Contact</th>
            <th className="text-left py-3 px-4 font-semibold">Bank Details</th>
            <th className="text-right py-3 px-4 font-semibold">Total Investment</th>
            <th className="text-right py-3 px-4 font-semibold">Active Investments</th>
            <th className="text-left py-3 px-4 font-semibold">Joined</th>
            <th className="text-center py-3 px-4 font-semibold">Status</th>
            <th className="text-center py-3 px-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {investors.map((investor) => (
            <tr key={investor.id} className="border-b border-border hover:bg-muted/50 transition-colors">
              <td className="py-3 px-4 font-medium">
                <div>
                  <div className="font-semibold">{investor.name}</div>
                  {investor.taxId && (
                    <div className="text-xs text-muted-foreground">Tax ID: {investor.taxId}</div>
                  )}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="text-muted-foreground">
                  <div>{investor.email}</div>
                  {investor.phone && <div className="text-sm">{investor.phone}</div>}
                </div>
              </td>
              <td className="py-3 px-4 text-muted-foreground">
                {investor.bankName && (
                  <div>
                    <div className="text-sm">{investor.bankName}</div>
                    {investor.bankAccount && (
                      <div className="text-xs">Acc: {investor.bankAccount}</div>
                    )}
                  </div>
                )}
              </td>
              <td className="py-3 px-4 text-right font-semibold">
                ৳ {getTotalInvestment(investor).toLocaleString()}
              </td>
              <td className="py-3 px-4 text-right">
                {getActiveInvestments(investor)}
              </td>
              <td className="py-3 px-4 text-muted-foreground">
                {formatDate(investor.createdAt)}
              </td>
              <td className="py-3 px-4 text-center">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(investor.isActive)}`}
                >
                  {investor.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex justify-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onToggleStatus(investor.id)} 
                    className="h-8 w-8 p-0"
                    title={investor.isActive ? "Deactivate" : "Activate"}
                  >
                    {investor.isActive ? (
                      <ToggleRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ToggleLeft className="w-4 h-4 text-gray-600" />
                    )}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onEdit(investor)} 
                    className="h-8 w-8 p-0"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Investor</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {investor.name}? This action cannot be undone.
                          {getTotalInvestment(investor) > 0 && (
                            <span className="block mt-2 text-amber-600 font-semibold">
                              Warning: This investor has active investments. Deleting may cause data inconsistencies.
                            </span>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="flex gap-3 justify-end">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(investor.id)}
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
      {investors.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No investors found. Try adjusting your search or add a new investor.
        </div>
      )}
    </div>
  )
}