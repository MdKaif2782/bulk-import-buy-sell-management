"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  History,
  ArrowUpRight,
  ArrowDownLeft,
  Settings2,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Calendar,
} from "lucide-react"
import { format } from "date-fns"
import { useGetAdvanceHistoryQuery } from "@/lib/store/api/employeeApi"
import type { Employee, AdvanceRecord, AdvanceType } from "@/types/employee"

function formatCurrency(value: number): string {
  return `৳${value.toLocaleString("en-BD")}`
}

function AdvanceTypeBadge({ type }: { type: AdvanceType }) {
  switch (type) {
    case "GIVEN":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400">
          <ArrowUpRight className="h-3 w-3 mr-1" />
          Given
        </Badge>
      )
    case "RECOVERED":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400">
          <ArrowDownLeft className="h-3 w-3 mr-1" />
          Recovered
        </Badge>
      )
    case "ADJUSTMENT":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400">
          <Settings2 className="h-3 w-3 mr-1" />
          Adjustment
        </Badge>
      )
  }
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-16 w-full" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}

// ── Main Dialog ──

interface AdvanceHistoryDialogProps {
  isOpen: boolean
  onClose: () => void
  employee: Employee | null
}

export function AdvanceHistoryDialog({ isOpen, onClose, employee }: AdvanceHistoryDialogProps) {
  const [page, setPage] = useState(1)

  const { data, isLoading, isFetching, error } = useGetAdvanceHistoryQuery(
    { id: employee?.id ?? "", page, limit: 10 },
    { skip: !employee || !isOpen }
  )

  const advances = data?.advances ?? []
  const pagination = data?.pagination
  const currentBalance = data?.employee?.advanceBalance ?? employee?.advanceBalance ?? 0

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Advance History
          </DialogTitle>
          <DialogDescription>
            {employee ? `Transaction history for ${employee.name}` : "Advance transaction history"}
          </DialogDescription>
        </DialogHeader>

        {/* Balance strip */}
        <Card>
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Current Advance Balance</span>
            </div>
            <span className={`font-bold text-sm ${currentBalance > 0 ? "text-red-600" : "text-green-600"}`}>
              {formatCurrency(currentBalance)}
            </span>
          </CardContent>
        </Card>

        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-destructive">Failed to load advance history.</p>
          </div>
        ) : advances.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">No advance transactions yet</p>
            <p className="text-sm">Transactions will appear here once an advance is given.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Balance After</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {advances.map((adv: AdvanceRecord) => (
                  <TableRow key={adv.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {format(new Date(adv.createdAt), "dd MMM yyyy")}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(adv.createdAt), "hh:mm a")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <AdvanceTypeBadge type={adv.type} />
                    </TableCell>
                    <TableCell>
                      <span
                        className={`font-semibold ${
                          adv.type === "GIVEN"
                            ? "text-red-600"
                            : adv.type === "RECOVERED"
                            ? "text-green-600"
                            : "text-blue-600"
                        }`}
                      >
                        {adv.type === "RECOVERED" ? "-" : "+"}
                        {formatCurrency(adv.amount)}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(adv.balanceAfter)}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        {adv.description && (
                          <p className="text-sm truncate">{adv.description}</p>
                        )}
                        {adv.salary && (
                          <p className="text-xs text-muted-foreground">
                            Salary: {format(new Date(adv.salary.year, adv.salary.month - 1), "MMM yyyy")}
                          </p>
                        )}
                        {adv.reference && (
                          <p className="text-xs font-mono text-muted-foreground truncate">
                            Ref: {adv.reference}
                          </p>
                        )}
                        {!adv.description && !adv.salary && !adv.reference && (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Page {pagination.page} of {pagination.pages} ({pagination.total} records)
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={pagination.page <= 1 || isFetching}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={pagination.page >= pagination.pages || isFetching}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
