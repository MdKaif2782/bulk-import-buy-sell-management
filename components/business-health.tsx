"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  useGetBusinessHealthQuery, 
  useGetCorporateSummaryQuery 
} from "@/lib/store/api/reportApi"
import { Download, Heart, TrendingUp, Activity, Shield, Zap } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

export function BusinessHealth() {
  const { data: businessHealth, isLoading: healthLoading } = useGetBusinessHealthQuery({})
  const { data: corporateSummary, isLoading: summaryLoading } = useGetCorporateSummaryQuery({})

  const getHealthScore = (health: any) => {
    if (!health) return 0
    let score = 0
    if (health.profitabilityIndex > 0) score += 25
    if (health.operatingMargin > 10) score += 25
    if (health.cashFlow > 0) score += 25
    if (health.currentRatio > 1.5) score += 25
    return score
  }

  const getHealthVariant = (score: number) => {
    if (score >= 80) return "success"
    if (score >= 60) return "default"
    if (score >= 40) return "secondary"
    return "destructive"
  }

  const healthScore = businessHealth ? getHealthScore(businessHealth) : 0

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Business Health</h2>
        <p className="text-muted-foreground">
          Comprehensive business performance and financial health metrics
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Overall Health Score */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Business Health Score
            </CardTitle>
            <CardDescription>Overall business performance assessment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {healthLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : businessHealth ? (
              <>
                <div className="text-center space-y-4">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 rounded-full border-8 flex items-center justify-center"
                      style={{
                        borderColor: `hsl(var(--${getHealthVariant(healthScore)}))`,
                        background: `conic-gradient(hsl(var(--${getHealthVariant(healthScore)})) ${healthScore}%, hsl(var(--muted)) ${healthScore}% 100%)`
                      }}
                    >
                      <div className="text-center">
                        <div className="text-2xl font-bold">{healthScore}</div>
                        <div className="text-xs text-muted-foreground">SCORE</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Badge variant={getHealthVariant(healthScore)} className="text-lg">
                      {healthScore >= 80 ? "Excellent" : 
                       healthScore >= 60 ? "Good" : 
                       healthScore >= 40 ? "Fair" : "Needs Attention"}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Profitability Index</p>
                    <p className="text-xl font-bold">{businessHealth.profitabilityIndex?.toFixed(2)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Operating Margin</p>
                    <p className="text-xl font-bold">{businessHealth.operatingMargin?.toFixed(1)}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Cash Flow</p>
                    <p className={`text-xl font-bold ${
                      businessHealth.cashFlow > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ৳{businessHealth.cashFlow.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Current Ratio</p>
                    <p className="text-xl font-bold">{businessHealth.currentRatio?.toFixed(2)}</p>
                  </div>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Key Metrics
            </CardTitle>
            <CardDescription>Critical business indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {healthLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            ) : businessHealth ? (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Profitability</span>
                    <Badge variant={
                      businessHealth.profitabilityIndex > 0 ? "success" : "destructive"
                    }>
                      {businessHealth.profitabilityIndex > 0 ? "Healthy" : "Concerning"}
                    </Badge>
                  </div>
                  <Progress value={Math.min(businessHealth.profitabilityIndex * 100, 100)} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Liquidity</span>
                    <Badge variant={
                      businessHealth.currentRatio > 1.5 ? "success" : 
                      businessHealth.currentRatio > 1 ? "default" : "destructive"
                    }>
                      {businessHealth.currentRatio > 1.5 ? "Strong" : 
                       businessHealth.currentRatio > 1 ? "Adequate" : "Weak"}
                    </Badge>
                  </div>
                  <Progress value={Math.min(businessHealth.currentRatio * 33, 100)} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Efficiency</span>
                    <Badge variant={
                      businessHealth.inventoryTurnover > 5 ? "success" : 
                      businessHealth.inventoryTurnover > 2 ? "default" : "destructive"
                    }>
                      {businessHealth.inventoryTurnover > 5 ? "High" : 
                       businessHealth.inventoryTurnover > 2 ? "Moderate" : "Low"}
                    </Badge>
                  </div>
                  <Progress value={Math.min(businessHealth.inventoryTurnover * 20, 100)} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Cash Position</span>
                    <Badge variant={
                      businessHealth.cashFlow > 0 ? "success" : "destructive"
                    }>
                      {businessHealth.cashFlow > 0 ? "Positive" : "Negative"}
                    </Badge>
                  </div>
                  <Progress value={businessHealth.cashFlow > 0 ? 100 : 25} />
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        {/* Corporate Summary */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Corporate Summary
            </CardTitle>
            <CardDescription>Comprehensive business overview</CardDescription>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            ) : corporateSummary ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Financials */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Financial Position</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Revenue</span>
                      <span className="font-semibold">
                        ৳{corporateSummary.financials.totalRevenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Expenses</span>
                      <span className="font-semibold">
                        ৳{corporateSummary.financials.totalExpenses.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Net Profit</span>
                      <span className={`font-semibold ${
                        corporateSummary.financials.netProfit > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ৳{corporateSummary.financials.netProfit.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Assets</span>
                      <span className="font-semibold">
                        ৳{corporateSummary.financials.totalAssets.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Liabilities</span>
                      <span className="font-semibold">
                        ৳{corporateSummary.financials.totalLiabilities.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Equity</span>
                      <span className="font-semibold">
                        ৳{corporateSummary.financials.equity.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sales Performance */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Sales Performance</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Sales</span>
                      <span className="font-semibold">
                        ৳{corporateSummary.sales.totalSales.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gross Profit</span>
                      <span className="font-semibold text-blue-600">
                        ৳{corporateSummary.sales.grossProfit.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Net Profit</span>
                      <span className="font-semibold text-green-600">
                        ৳{corporateSummary.sales.netProfit.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gross Margin</span>
                      <Badge variant="outline">
                        {corporateSummary.sales.grossMargin?.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Net Margin</span>
                      <Badge variant="default">
                        {corporateSummary.sales.netMargin?.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Investors & Inventory */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Investors & Inventory</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Investment</span>
                      <span className="font-semibold">
                        ৳{corporateSummary.investors.totalInvestment?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Due to Investors</span>
                      <span className="font-semibold text-orange-600">
                        ৳{corporateSummary.investors.totalDueToInvestors?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Investors</span>
                      <Badge variant="outline">
                        {corporateSummary.investors.investorCount}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Inventory Value</span>
                      <span className="font-semibold">
                        ৳{corporateSummary.inventory.totalInventoryValue?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Items</span>
                      <Badge variant="secondary">
                        {corporateSummary.inventory.totalItems}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Expenses & Employees */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Expenses & Employees</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Expenses</span>
                      <span className="font-semibold">
                        ৳{corporateSummary.expenses.total?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Salary Expense</span>
                      <span className="font-semibold">
                        ৳{corporateSummary.employees.totalSalaryExpense?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Employees</span>
                      <Badge variant="success">
                        {corporateSummary.employees.activeEmployees}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Employees</span>
                      <Badge variant="outline">
                        {corporateSummary.employees.totalEmployees}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Salary</span>
                      <span className="font-semibold">
                        ৳{corporateSummary.employees.averageSalary?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No corporate summary data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}