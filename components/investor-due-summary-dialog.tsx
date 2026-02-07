"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  DollarSign,
  TrendingUp,
  Wallet,
  CreditCard,
  BarChart3,
  Package,
  History,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  Ban,
  Truck,
  ShoppingCart,
  Phone,
  Mail,
  Building2,
  Receipt,
} from "lucide-react"
import { useGetInvestorDueSummaryQuery } from "@/lib/store/api/investorsApi"
import type { DueSummary, InvestmentBreakdown, PaymentHistoryItem, RecentActivity, ProductSale } from "@/types/investor"

// ── Helpers ──

function formatCurrency(value: number): string {
  return `৳${value.toLocaleString("en-BD", { minimumFractionDigits: 0 })}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function poStatusConfig(status: string) {
  switch (status) {
    case "RECEIVED":
      return { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30", label: "Received" }
    case "SHIPPED":
      return { icon: Truck, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30", label: "Shipped" }
    case "ORDERED":
      return { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30", label: "Ordered" }
    case "CANCELLED":
      return { icon: Ban, color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30", label: "Cancelled" }
    default:
      return { icon: Clock, color: "text-muted-foreground", bg: "bg-muted", label: status }
  }
}

function paymentMethodLabel(method?: string | null): string {
  switch (method) {
    case "BANK_TRANSFER": return "Bank Transfer"
    case "CASH": return "Cash"
    case "CHEQUE": return "Cheque"
    case "CARD": return "Card"
    default: return "—"
  }
}

// ── Sub-components ──

function SummaryCards({ summary }: { summary: DueSummary["summary"] }) {
  const cards = [
    {
      title: "Total Investment",
      value: formatCurrency(summary.totalInvestment),
      icon: Wallet,
      color: "text-blue-600",
      subtitle: `${summary.activeInvestments} active investment${summary.activeInvestments !== 1 ? "s" : ""}`,
    },
    {
      title: "Total Revenue",
      value: formatCurrency(summary.totalRevenue),
      icon: TrendingUp,
      color: "text-indigo-600",
      subtitle: `${formatCurrency(summary.totalCollected)} collected`,
    },
    {
      title: "Profit Earned",
      value: formatCurrency(summary.totalProfitEarned),
      icon: BarChart3,
      color: "text-green-600",
      subtitle: `${summary.overallROI.toFixed(1)}% ROI`,
    },
    {
      title: "Total Paid",
      value: formatCurrency(summary.totalPaid),
      icon: CreditCard,
      color: "text-teal-600",
      subtitle: `${summary.collectionEfficiency.toFixed(1)}% collected`,
    },
    {
      title: "Total Due",
      value: formatCurrency(summary.totalDue),
      icon: Receipt,
      color: "text-red-600",
      subtitle: "Outstanding balance",
    },
    {
      title: "Payable Now",
      value: formatCurrency(summary.payableNow),
      icon: DollarSign,
      color: "text-orange-600",
      subtitle: "From collected cash",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {cards.map((card) => (
        <Card key={card.title} className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">{card.title}</span>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
            <div className="text-lg font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function InvestorInfoHeader({ investor, summary, onPay }: { investor: DueSummary["investor"]; summary: DueSummary["summary"]; onPay: () => void }) {
  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-bold">{investor.name}</h3>
          <Badge variant={investor.status === "Active" ? "default" : "secondary"}>
            {investor.status}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {investor.email && (
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {investor.email}
            </span>
          )}
          {investor.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {investor.phone}
            </span>
          )}
          {investor.bankName && (
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {investor.bankName} {investor.bankAccount ? `— ${investor.bankAccount}` : ""}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Joined {formatDate(investor.joinDate)}
          {investor.taxId ? ` • Tax ID: ${investor.taxId}` : ""}
        </p>
      </div>

      {summary.payableNow > 0 && (
        <Button onClick={onPay} size="lg" className="gap-2 shrink-0">
          <DollarSign className="h-4 w-4" />
          Pay {formatCurrency(summary.payableNow)}
        </Button>
      )}
    </div>
  )
}

function InvestmentBreakdownTab({ investments }: { investments: InvestmentBreakdown[] }) {
  if (!investments.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No investments found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {investments.map((inv) => {
        const statusCfg = poStatusConfig(inv.poStatus)
        const StatusIcon = statusCfg.icon
        return (
          <Card key={inv.investmentId}>
            <CardContent className="p-4 space-y-3">
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{inv.poNumber}</h4>
                    <Badge variant="outline" className={`${statusCfg.bg} ${statusCfg.color} border-none text-xs`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusCfg.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{inv.vendorName}</p>
                  <p className="text-xs text-muted-foreground">
                    Ordered {formatDate(inv.orderDate)}
                    {inv.receivedDate ? ` • Received ${formatDate(inv.receivedDate)}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{formatCurrency(inv.investmentAmount)}</p>
                  <p className="text-sm text-muted-foreground">{inv.profitPercentage}% profit share</p>
                </div>
              </div>

              <Separator />

              {/* Metrics grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">PO Revenue</span>
                  <p className="font-medium">{formatCurrency(inv.poRevenue)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Collected</span>
                  <p className="font-medium">{formatCurrency(inv.poCollected)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Profit Earned</span>
                  <p className="font-medium text-green-600">{formatCurrency(inv.profitEarned)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Payable Now</span>
                  <p className="font-medium text-orange-600">{formatCurrency(inv.payableNow)}</p>
                </div>
              </div>

              {/* ROI badge */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {inv.roi >= 0 ? (
                    <ArrowUpRight className="h-3 w-3 mr-1 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1 text-red-600" />
                  )}
                  ROI: {inv.roi.toFixed(1)}%
                </Badge>
              </div>

              {/* Products */}
              {inv.products && inv.products.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Products</p>
                    <div className="space-y-1">
                      {inv.products.map((p, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span>{p.productName} × {p.quantity}</span>
                          <span className="font-medium">{formatCurrency(p.totalPrice)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function ProductSalesTab({ products }: { products: ProductSale[] }) {
  if (!products.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No product sales data available</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>PO</TableHead>
            <TableHead className="text-right">Purchase Price</TableHead>
            <TableHead className="text-right">Sale Price</TableHead>
            <TableHead className="text-right">Sold</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            <TableHead>Customers</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p, i) => (
            <TableRow key={i}>
              <TableCell>
                <div>
                  <p className="font-medium">{p.productName}</p>
                  <p className="text-xs text-muted-foreground">{p.productCode}</p>
                </div>
              </TableCell>
              <TableCell className="text-xs">{p.poNumber}</TableCell>
              <TableCell className="text-right">{formatCurrency(p.purchasePrice)}</TableCell>
              <TableCell className="text-right">{formatCurrency(p.expectedSalePrice)}</TableCell>
              <TableCell className="text-right">{p.totalSold}</TableCell>
              <TableCell className="text-right font-medium">{formatCurrency(p.totalRevenue)}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {p.customers.slice(0, 3).map((c, ci) => (
                    <Badge key={ci} variant="outline" className="text-xs">
                      {c}
                    </Badge>
                  ))}
                  {p.customers.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{p.customers.length - 3}
                    </Badge>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function PaymentHistoryTab({ payments }: { payments: PaymentHistoryItem[] }) {
  if (!payments.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No payment history yet</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell className="whitespace-nowrap">{formatDate(payment.paymentDate)}</TableCell>
              <TableCell className="max-w-[200px] truncate">{payment.description || "—"}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs whitespace-nowrap">
                  {paymentMethodLabel(payment.paymentMethod)}
                </Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{payment.reference || "—"}</TableCell>
              <TableCell className="text-right font-semibold text-green-600 whitespace-nowrap">
                {formatCurrency(payment.amount)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function RecentActivityTab({ activities }: { activities: RecentActivity[] }) {
  if (!activities.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No recent activity</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {activities.map((act, i) => {
        const isPayment = act.type === "PAYMENT_RECEIVED"
        return (
          <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
            <div className={`p-2 rounded-full shrink-0 ${isPayment ? "bg-green-100 dark:bg-green-900/30" : "bg-blue-100 dark:bg-blue-900/30"}`}>
              {isPayment ? (
                <DollarSign className="h-4 w-4 text-green-600" />
              ) : (
                <Package className="h-4 w-4 text-blue-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{act.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">{formatDate(act.date)}</span>
                {act.method && (
                  <Badge variant="outline" className="text-xs">
                    {paymentMethodLabel(act.method)}
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className={`font-semibold text-sm ${isPayment ? "text-green-600" : "text-blue-600"}`}>
                {formatCurrency(act.amount)}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {act.type.toLowerCase().replace(/_/g, " ")}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  )
}

// ── Main dialog ──

interface InvestorDueSummaryDialogProps {
  isOpen: boolean
  onClose: () => void
  investorId: string | null
  onOpenPayDialog: () => void
}

export function InvestorDueSummaryDialog({
  isOpen,
  onClose,
  investorId,
  onOpenPayDialog,
}: InvestorDueSummaryDialogProps) {
  const { data: dueSummary, isLoading, error } = useGetInvestorDueSummaryQuery(investorId!, {
    skip: !investorId || !isOpen,
  })

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="!max-w-5xl max-h-[92vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Investor Due Summary</DialogTitle>
          <DialogDescription>
            Comprehensive financial breakdown and payment details
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 pt-4">
          {isLoading && <LoadingSkeleton />}

          {error && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-10 w-10 text-destructive mb-3" />
              <p className="font-medium">Failed to load investor summary</p>
              <p className="text-sm text-muted-foreground mt-1">Please try again later</p>
            </div>
          )}

          {!isLoading && !error && dueSummary && (
            <div className="space-y-6">
              {/* Investor header + pay button */}
              <InvestorInfoHeader
                investor={dueSummary.investor}
                summary={dueSummary.summary}
                onPay={onOpenPayDialog}
              />

              <Separator />

              {/* Summary cards */}
              <SummaryCards summary={dueSummary.summary} />

              {/* Progress: collection efficiency */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Collection Efficiency</span>
                    <span className="text-sm font-bold">{dueSummary.summary.collectionEfficiency.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="bg-green-600 h-2.5 rounded-full transition-all"
                      style={{ width: `${Math.min(dueSummary.summary.collectionEfficiency, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>Collected: {formatCurrency(dueSummary.summary.totalCollected)}</span>
                    <span>Total Revenue: {formatCurrency(dueSummary.summary.totalRevenue)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Tabbed content */}
              <Tabs defaultValue="investments" className="w-full">
                <TabsList className="w-full grid grid-cols-4">
                  <TabsTrigger value="investments" className="text-xs sm:text-sm">
                    <Package className="h-3.5 w-3.5 mr-1 hidden sm:inline" />
                    Investments
                  </TabsTrigger>
                  <TabsTrigger value="products" className="text-xs sm:text-sm">
                    <ShoppingCart className="h-3.5 w-3.5 mr-1 hidden sm:inline" />
                    Sales
                  </TabsTrigger>
                  <TabsTrigger value="payments" className="text-xs sm:text-sm">
                    <History className="h-3.5 w-3.5 mr-1 hidden sm:inline" />
                    Payments
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="text-xs sm:text-sm">
                    <Activity className="h-3.5 w-3.5 mr-1 hidden sm:inline" />
                    Activity
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="investments" className="mt-4">
                  <InvestmentBreakdownTab investments={dueSummary.investmentBreakdown} />
                </TabsContent>

                <TabsContent value="products" className="mt-4">
                  <ProductSalesTab products={dueSummary.productSales} />
                </TabsContent>

                <TabsContent value="payments" className="mt-4">
                  <PaymentHistoryTab payments={dueSummary.paymentHistory} />
                </TabsContent>

                <TabsContent value="activity" className="mt-4">
                  <RecentActivityTab activities={dueSummary.recentActivity} />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
