"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  useGetBillingSummaryQuery, 
  useGetCompanyReceivablesQuery,
  useGetReceivableAgingQuery 
} from "@/lib/store/api/reportApi"
import { Download, CreditCard, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

interface FinancialReportsProps {
  preview?: boolean
}

export function FinancialReports({ preview = false }: FinancialReportsProps) {
  const { data: billing, isLoading: billingLoading } = useGetBillingSummaryQuery()
  const { data: receivables, isLoading: receivablesLoading } = useGetCompanyReceivablesQuery()
  const { data: aging, isLoading: agingLoading } = useGetReceivableAgingQuery()

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      partially_paid: "default",
      paid: "success",
      overdue: "destructive"
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  if (preview) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Financial Overview
          </CardTitle>
          <CardDescription>Billing and receivables summary</CardDescription>
        </CardHeader>
        <CardContent>
          {billingLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : billing ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Billed</p>
                <p className="text-2xl font-bold">৳{billing.totalBilledAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Due</p>
                <p className="text-2xl font-bold text-orange-600">৳{billing.totalDue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Collection Rate</p>
                <p className="text-2xl font-bold text-green-600">{billing.collectionRate.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Bills</p>
                <p className="text-2xl font-bold">{billing.totalBills}</p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Financial Reports</h2>
        <p className="text-muted-foreground">
          Billing, receivables, and financial performance
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Billing Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Billing Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {billingLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : billing ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Billed Amount</p>
                    <p className="text-2xl font-bold">৳{billing.totalBilledAmount.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Collected</p>
                    <p className="text-2xl font-bold text-green-600">
                      ৳{billing.totalCollected.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Due</p>
                    <p className="text-2xl font-bold text-orange-600">
                      ৳{billing.totalDue.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Collection Rate</p>
                    <p className="text-2xl font-bold">{billing.collectionRate.toFixed(1)}%</p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Bills by Status</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Pending</span>
                      <Badge variant="secondary">{billing.billsByStatus.pending}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Partially Paid</span>
                      <Badge variant="default">{billing.billsByStatus.partiallyPaid}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Paid</span>
                      <Badge variant="success">{billing.billsByStatus.paid}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Overdue</span>
                      <Badge variant="destructive">{billing.billsByStatus.overdue}</Badge>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        {/* Receivable Aging */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Receivable Aging
            </CardTitle>
            <CardDescription>Due amounts by age</CardDescription>
          </CardHeader>
          <CardContent>
            {agingLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            ) : aging ? (
              <div className="space-y-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">
                    ৳{aging.totalReceivable.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Receivable</p>
                </div>
                <div className="space-y-2">
                  {aging.agingBuckets.map((bucket) => (
                    <div key={bucket.bucket} className="flex justify-between items-center">
                      <span className="text-sm">{bucket.bucket}</span>
                      <div className="text-right">
                        <p className="font-semibold">৳{bucket.amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {bucket.count} bills • {bucket.percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Company Receivables */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Company-wise Receivables</CardTitle>
            <CardDescription>Outstanding amounts by company</CardDescription>
          </CardHeader>
          <CardContent>
            {receivablesLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            ) : receivables ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Total Billed</TableHead>
                    <TableHead>Total Collected</TableHead>
                    <TableHead>Total Due</TableHead>
                    <TableHead>Collection Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receivables.map((company) => (
                    <TableRow key={company.companyName}>
                      <TableCell className="font-medium">{company.companyName}</TableCell>
                      <TableCell>৳{company.totalBilled.toLocaleString()}</TableCell>
                      <TableCell>৳{company.totalCollected.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={company.totalDue > 0 ? "destructive" : "success"}>
                          ৳{company.totalDue.toLocaleString()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-secondary rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${company.collectionRate}%` }}
                            />
                          </div>
                          <span className="text-sm">{company.collectionRate.toFixed(1)}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}