"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useGetQuickStatsQuery } from "@/lib/store/api/reportApi"
import { Package, CreditCard, TrendingUp, Users, DollarSign, AlertTriangle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

const StatCard = ({ title, value, subtitle, icon: Icon, trend, className = "" }: {
  title: string
  value: string
  subtitle: string
  icon: any
  trend?: string
  className?: string
}) => (
  <Card className={className}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">
        {subtitle}
        {trend && <span className={trend.includes('+') ? 'text-green-600' : 'text-red-600'}> {trend}</span>}
      </p>
    </CardContent>
  </Card>
)

export function QuickStats() {
  const { data: stats, isLoading, error } = useGetQuickStatsQuery()

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error || !stats || !stats.sales || !stats.inventory || !stats.receivables || !stats.investors) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Failed to load quick stats</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatCard
        title="Total Sales"
        value={`৳${(stats.sales.totalSales ?? 0).toLocaleString()}`}
        subtitle="All time revenue"
        icon={TrendingUp}
        trend="+12.5%"
      />
      <StatCard
        title="Net Profit"
        value={`৳${(stats.sales.netProfit ?? 0).toLocaleString()}`}
        subtitle={`${(stats.sales.profitMargin ?? 0).toFixed(1)}% margin`}
        icon={DollarSign}
        trend="+8.2%"
      />
      <StatCard
        title="Inventory Value"
        value={`৳${(stats.inventory.totalValue ?? 0).toLocaleString()}`}
        subtitle={`${stats.inventory.totalItems ?? 0} items`}
        icon={Package}
      />
      <StatCard
        title="Receivables"
        value={`৳${(stats.receivables.totalDue ?? 0).toLocaleString()}`}
        subtitle={`${(stats.receivables.collectionRate ?? 0).toFixed(1)}% collected`}
        icon={CreditCard}
      />
      <StatCard
        title="Active Investors"
        value={(stats.investors.activeInvestors ?? 0).toString()}
        subtitle={`৳${(stats.investors.totalInvestment ?? 0).toLocaleString()} invested`}
        icon={Users}
      />
    </div>
  )
}