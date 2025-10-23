"use client"

import { Edit2, Trash2 } from "lucide-react"
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

interface InvestorTableProps {
  investors: Investor[]
  onEdit: (investor: Investor) => void
  onDelete: (id: string) => void
}

export function InvestorTable({ investors, onEdit, onDelete }: InvestorTableProps) {
  const getStatusBadge = (status: string) => {
    return status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-semibold">Name</th>
            <th className="text-left py-3 px-4 font-semibold">Email</th>
            <th className="text-left py-3 px-4 font-semibold">Phone</th>
            <th className="text-right py-3 px-4 font-semibold">Share %</th>
            <th className="text-right py-3 px-4 font-semibold">Investment</th>
            <th className="text-left py-3 px-4 font-semibold">Join Date</th>
            <th className="text-center py-3 px-4 font-semibold">Status</th>
            <th className="text-center py-3 px-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {investors.map((investor) => (
            <tr key={investor.id} className="border-b border-border hover:bg-muted/50 transition-colors">
              <td className="py-3 px-4 font-medium">{investor.name}</td>
              <td className="py-3 px-4 text-muted-foreground">{investor.email}</td>
              <td className="py-3 px-4 text-muted-foreground">{investor.phone}</td>
              <td className="py-3 px-4 text-right font-semibold">{investor.sharePercentage}%</td>
              <td className="py-3 px-4 text-right">৳ {investor.investmentAmount.toLocaleString()}</td>
              <td className="py-3 px-4 text-muted-foreground">{formatDate(investor.joinDate)}</td>
              <td className="py-3 px-4 text-center">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(investor.status)}`}
                >
                  {investor.status.charAt(0).toUpperCase() + investor.status.slice(1)}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex justify-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(investor)} className="h-8 w-8 p-0">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Investor</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {investor.name}? This action cannot be undone.
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
