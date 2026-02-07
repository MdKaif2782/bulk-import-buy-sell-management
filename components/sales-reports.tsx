"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  useGetSalesSummaryQuery, 
  useGetPeriodicSalesQuery 
} from "@/lib/store/api/reportApi"
import { Download, TrendingUp, BarChart3, ShoppingCart, Store } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

interface SalesReportsProps {
  preview?: boolean
}

export function SalesReports({ preview = false }: SalesReportsProps) {
  const { data: salesSummary, isLoading: summaryLoading } = useGetSalesSummaryQuery({})
  const { data: periodicSales, isLoading: periodicLoading } = useGetPeriodicSalesQuery({})

  if (preview) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Sales Overview
          </CardTitle>
          <CardDescription>Revenue and profit performance</CardDescription>
        </CardHeader>
        <CardContent>
          {summaryLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : salesSummary ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold">৳{(salesSummary.totalSales ?? 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Net Profit</p>
                <p className="text-2xl font-bold text-green-600">৳{(salesSummary.netProfit ?? 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Corporate Sales</p>
                <p className="text-xl font-semibold">৳{(salesSummary.corporateSales ?? 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Retail Sales</p>
                <p className="text-xl font-semibold">৳{(salesSummary.retailSales ?? 0).toLocaleString()}</p>
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
        <h2 className="text-2xl font-bold tracking-tight">Sales Reports</h2>
        <p className="text-muted-foreground">
          Revenue analysis, profit margins, and sales performance
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Sales Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Sales Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {summaryLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : salesSummary ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Sales</p>
                    <p className="text-2xl font-bold">৳{(salesSummary.totalSales ?? 0).toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Net Profit</p>
                    <p className="text-2xl font-bold text-green-600">
                      ৳{(salesSummary.netProfit ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Corporate Sales</p>
                    <p className="text-xl font-semibold">
                      ৳{(salesSummary.corporateSales ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Retail Sales</p>
                    <p className="text-xl font-semibold">
                      ৳{(salesSummary.retailSales ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Cost of Goods Sold</p>
                    <p className="text-xl font-semibold">
                      ৳{(salesSummary.cogs ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Gross Profit</p>
                    <p className="text-xl font-semibold text-blue-600">
                      ৳{(salesSummary.grossProfit ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Profit Margins</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between items-center">
                      <span>Gross Margin</span>
                      <Badge variant="outline" className="text-blue-600">
                        {(salesSummary.grossMargin ?? 0).toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Net Margin</span>
                      <Badge variant="default" className="text-green-600">
                        {(salesSummary.netMargin ?? 0).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        {/* Sales Channels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Sales Channels
            </CardTitle>
            <CardDescription>Revenue distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            ) : salesSummary ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-blue-600" />
                    <span>Corporate</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">৳{(salesSummary.corporateSales ?? 0).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {(salesSummary.totalSales ? (((salesSummary.corporateSales ?? 0) / salesSummary.totalSales) * 100) : 0).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-green-600" />
                    <span>Retail</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">৳{(salesSummary.retailSales ?? 0).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {(salesSummary.totalSales ? (((salesSummary.retailSales ?? 0) / salesSummary.totalSales) * 100) : 0).toFixed(1)}%
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Profitability</span>
                    <Badge variant={
                      (salesSummary.netProfit ?? 0) > 0 ? "success" : "destructive"
                    }>
                      {(salesSummary.netProfit ?? 0) > 0 ? "Profitable" : "Loss"}
                    </Badge>
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Periodic Sales Performance */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Periodic Sales Performance</CardTitle>
            <CardDescription>Sales trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            {periodicLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            ) : periodicSales && periodicSales.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Total Sales</TableHead>
                    <TableHead>COGS</TableHead>
                    <TableHead>Gross Profit</TableHead>
                    <TableHead>Expenses</TableHead>
                    <TableHead>Net Profit</TableHead>
                    <TableHead>Margin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {periodicSales.map((period) => (
                    <TableRow key={period.period}>
                      <TableCell className="font-medium">{period.period}</TableCell>
                      <TableCell>৳{(period.totalSales ?? 0).toLocaleString()}</TableCell>
                      <TableCell>৳{(period.cogs ?? 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-blue-600">
                          ৳{(period.grossProfit ?? 0).toLocaleString()}
                        </Badge>
                      </TableCell>
                      <TableCell>৳{(period.expenses ?? 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={(period.netProfit ?? 0) > 0 ? "success" : "destructive"}>
                          ৳{(period.netProfit ?? 0).toLocaleString()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {(period.totalSales ? (((period.netProfit ?? 0) / period.totalSales) * 100) : 0).toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No periodic sales data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}