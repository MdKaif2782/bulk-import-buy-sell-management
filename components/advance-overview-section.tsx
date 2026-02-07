"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  Wallet,
  Banknote,
  Users,
  History,
  ArrowUpRight,
  ArrowDownLeft,
  Settings2,
} from "lucide-react"
import { format } from "date-fns"
import { useGetAdvanceOverviewQuery } from "@/lib/store/api/employeeApi"
import type { AdvanceType } from "@/types/employee"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

function formatCurrency(value: number): string {
  return `৳${value.toLocaleString("en-BD")}`
}

function TypeIcon({ type }: { type: AdvanceType }) {
  switch (type) {
    case "GIVEN":
      return <ArrowUpRight className="h-3 w-3 text-red-500" />
    case "RECOVERED":
      return <ArrowDownLeft className="h-3 w-3 text-green-500" />
    case "ADJUSTMENT":
      return <Settings2 className="h-3 w-3 text-blue-500" />
  }
}

// ── Main Section ──

interface AdvanceOverviewSectionProps {
  onGiveAdvance: (employee: { id: string; name: string; advanceBalance: number }) => void
  onViewHistory: (employee: { id: string; name: string; advanceBalance: number }) => void
}

export function AdvanceOverviewSection({ onGiveAdvance, onViewHistory }: AdvanceOverviewSectionProps) {
  const { data, isLoading, error } = useGetAdvanceOverviewQuery()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
          <Skeleton className="h-40" />
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return null
  }

  const { summary, employees } = data

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-orange-600" />
          Advance Balance Overview
        </CardTitle>
        <CardDescription>
          Track outstanding advance balances across all employees
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <Wallet className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Outstanding</p>
                <p className="text-lg font-bold text-red-600">
                  {formatCurrency(summary.totalOutstandingAdvance)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Employees with Advance</p>
                <p className="text-lg font-bold">
                  {summary.employeesWithAdvance}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    / {summary.totalActiveEmployees}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Banknote className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg. Advance / Employee</p>
                <p className="text-lg font-bold">
                  {summary.employeesWithAdvance > 0
                    ? formatCurrency(summary.totalOutstandingAdvance / summary.employeesWithAdvance)
                    : "৳0"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employee table */}
        {employees.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Advance Balance</TableHead>
                <TableHead>Last Transaction</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{emp.name}</div>
                      <div className="text-xs text-muted-foreground">{emp.employeeId}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{emp.designation}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`font-semibold ${emp.advanceBalance > 0 ? "text-red-600" : "text-green-600"}`}>
                      {formatCurrency(emp.advanceBalance)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {emp.lastAdvanceTransaction ? (
                      <div className="flex items-center gap-1.5 text-sm">
                        <TypeIcon type={emp.lastAdvanceTransaction.type} />
                        <span>{formatCurrency(emp.lastAdvanceTransaction.amount)}</span>
                        <span className="text-muted-foreground text-xs">
                          ({format(new Date(emp.lastAdvanceTransaction.createdAt), "dd MMM")})
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <TooltipProvider>
                      <div className="flex justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                onGiveAdvance({
                                  id: emp.id,
                                  name: emp.name,
                                  advanceBalance: emp.advanceBalance,
                                })
                              }
                            >
                              <Banknote className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Give Advance</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                onViewHistory({
                                  id: emp.id,
                                  name: emp.name,
                                  advanceBalance: emp.advanceBalance,
                                })
                              }
                            >
                              <History className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View History</TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Wallet className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No outstanding advances</p>
            <p className="text-sm">All employees have zero advance balance.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
