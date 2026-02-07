"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  useGetInventorySummaryQuery, 
  useGetCompanyWiseStockQuery, 
  useGetLowStockReportQuery 
} from "@/lib/store/api/reportApi"
import { Download, Package, AlertTriangle, TrendingUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

interface InventoryReportsProps {
  preview?: boolean
}

export function InventoryReports({ preview = false }: InventoryReportsProps) {
  const { data: summary, isLoading: summaryLoading } = useGetInventorySummaryQuery()
  const { data: companyStock, isLoading: companyLoading } = useGetCompanyWiseStockQuery()
  const { data: lowStock, isLoading: lowStockLoading } = useGetLowStockReportQuery()

  if (preview) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Overview
          </CardTitle>
          <CardDescription>Stock levels and inventory valuation</CardDescription>
        </CardHeader>
        <CardContent>
          {summaryLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : summary ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{summary.totalItems}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">৳{(summary.totalInventoryValue ?? 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Low Stock Items</p>
                <p className="text-2xl font-bold text-orange-600">{summary.lowStockItemsCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Expected Sale Value</p>
                <p className="text-2xl font-bold text-green-600">৳{(summary.totalExpectedSaleValue ?? 0).toLocaleString()}</p>
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
        <h2 className="text-2xl font-bold tracking-tight">Inventory Reports</h2>
        <p className="text-muted-foreground">
          Comprehensive inventory analysis and stock management
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Inventory Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Inventory Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {summaryLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : summary ? (
              <>
                <div className="flex justify-between">
                  <span>Total Items</span>
                  <span className="font-semibold">{summary.totalItems}</span>
                </div>
                <div className="flex justify-between">
                  <span>Inventory Value</span>
                  <span className="font-semibold">৳{(summary.totalInventoryValue ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expected Sale Value</span>
                  <span className="font-semibold text-green-600">
                    ৳{(summary.totalExpectedSaleValue ?? 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Average Stock Value</span>
                  <span className="font-semibold">৳{(summary.averageStockValue ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-600">Low Stock Items</span>
                  <span className="font-semibold text-orange-600">{summary.lowStockItemsCount}</span>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        {/* Company-wise Stock */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Company-wise Stock Value</CardTitle>
            <CardDescription>Inventory distribution by vendor</CardDescription>
          </CardHeader>
          <CardContent>
            {companyLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            ) : companyStock ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Stock Value</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companyStock.map((company) => (
                    <TableRow key={company.companyName}>
                      <TableCell className="font-medium">{company.companyName}</TableCell>
                      <TableCell>৳{(company.stockValue ?? 0).toLocaleString()}</TableCell>
                      <TableCell>{company.itemCount}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {(company.percentageOfTotal ?? 0).toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null}
          </CardContent>
        </Card>

        {/* Low Stock Report */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
            <CardDescription>Items that need immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            ) : lowStock && lowStock.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Min Level</TableHead>
                    <TableHead>Purchase Price</TableHead>
                    <TableHead>Sale Price</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStock.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell>{item.productCode}</TableCell>
                      <TableCell>
                        <Badge variant={item.currentQuantity === 0 ? "destructive" : "outline"}>
                          {item.currentQuantity}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.minStockLevel || 10}</TableCell>
                      <TableCell>৳{(item.purchasePrice ?? 0).toLocaleString()}</TableCell>
                      <TableCell>৳{(item.expectedSalePrice ?? 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={
                          item.currentQuantity === 0 ? "destructive" : 
                          item.currentQuantity < (item.minStockLevel || 10) ? "default" : "secondary"
                        }>
                          {item.currentQuantity === 0 ? "Out of Stock" : "Low Stock"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No low stock items found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}