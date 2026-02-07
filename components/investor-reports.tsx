"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  useGetInvestorSummaryQuery, 
  useGetInvestmentBreakdownQuery 
} from "@/lib/store/api/reportApi"
import { Download, Users, TrendingUp, DollarSign, PieChart } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

interface InvestorReportsProps {
  preview?: boolean
}

export function InvestorReports({ preview = false }: InvestorReportsProps) {
  const { data: investors, isLoading: investorsLoading } = useGetInvestorSummaryQuery()
  const [selectedInvestor, setSelectedInvestor] = useState<string>("")
  
  const { data: breakdown, isLoading: breakdownLoading } = useGetInvestmentBreakdownQuery(
    selectedInvestor,
    { skip: !selectedInvestor }
  )

  if (preview) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Investor Overview
          </CardTitle>
          <CardDescription>Investment performance and payouts</CardDescription>
        </CardHeader>
        <CardContent>
          {investorsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : investors && investors.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Investment</p>
                  <p className="text-2xl font-bold">
                    ৳{investors.reduce((sum, inv) => sum + inv.totalInvestment, 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Due</p>
                  <p className="text-2xl font-bold text-orange-600">
                    ৳{investors.reduce((sum, inv) => sum + inv.totalDue, 0).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {investors.length} active investors • {investors.filter(inv => inv.activeInvestments > 0).length} with active investments
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-4">
              No investor data available
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Investor Reports</h2>
        <p className="text-muted-foreground">
          Investment performance, profit distribution, and payouts
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Investor Summary */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Investor Summary
            </CardTitle>
            <CardDescription>Performance overview for all investors</CardDescription>
          </CardHeader>
          <CardContent>
            {investorsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            ) : investors && investors.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Investor</TableHead>
                    <TableHead>Total Investment</TableHead>
                    <TableHead>Profit Earned</TableHead>
                    <TableHead>Total Paid</TableHead>
                    <TableHead>Total Due</TableHead>
                    <TableHead>ROI</TableHead>
                    <TableHead>Active Investments</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investors.map((investor) => (
                    <TableRow 
                      key={investor.investorId}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedInvestor(investor.investorId)}
                    >
                      <TableCell className="font-medium">{investor.investorName}</TableCell>
                      <TableCell>৳{(investor.totalInvestment ?? 0).toLocaleString()}</TableCell>
                      <TableCell>৳{(investor.totalProfitEarned ?? 0).toLocaleString()}</TableCell>
                      <TableCell>৳{(investor.totalPaid ?? 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={(investor.totalDue ?? 0) > 0 ? "destructive" : "success"}>
                          ৳{(investor.totalDue ?? 0).toLocaleString()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={(investor.overallROI ?? 0) > 0 ? "default" : "secondary"}>
                          {(investor.overallROI ?? 0).toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={investor.activeInvestments > 0 ? "default" : "secondary"}>
                          {investor.activeInvestments}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No investor data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Investment Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {investorsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : investors && investors.length > 0 ? (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Investors</span>
                    <span className="font-semibold">{investors.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Active Investors</span>
                    <span className="font-semibold">
                      {investors.filter(inv => inv.activeInvestments > 0).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Investment</span>
                    <span className="font-semibold">
                      ৳{investors.reduce((sum, inv) => sum + inv.totalInvestment, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Profit Earned</span>
                    <span className="font-semibold text-green-600">
                      ৳{investors.reduce((sum, inv) => sum + inv.totalProfitEarned, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-orange-600">Total Due</span>
                    <span className="font-semibold text-orange-600">
                      ৳{investors.reduce((sum, inv) => sum + inv.totalDue, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                {/* Investor Selector for Breakdown */}
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">View Investment Breakdown</p>
                  <Select value={selectedInvestor} onValueChange={setSelectedInvestor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select investor" />
                    </SelectTrigger>
                    <SelectContent>
                      {investors.map((investor) => (
                        <SelectItem key={investor.investorId} value={investor.investorId}>
                          {investor.investorName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        {/* Investment Breakdown */}
        {selectedInvestor && (
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Investment Breakdown - {investors?.find(inv => inv.investorId === selectedInvestor)?.investorName}
              </CardTitle>
              <CardDescription>Detailed investment performance</CardDescription>
            </CardHeader>
            <CardContent>
              {breakdownLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
              ) : breakdown && breakdown.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PO Number</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Investment</TableHead>
                      <TableHead>Profit %</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Collected</TableHead>
                      <TableHead>Profit Earned</TableHead>
                      <TableHead>Payable Now</TableHead>
                      <TableHead>ROI</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {breakdown.map((investment) => (
                      <TableRow key={investment.investmentId}>
                        <TableCell className="font-medium">{investment.poNumber}</TableCell>
                        <TableCell>{investment.vendorName}</TableCell>
                        <TableCell>৳{(investment.investmentAmount ?? 0).toLocaleString()}</TableCell>
                        <TableCell>{investment.profitPercentage}%</TableCell>
                        <TableCell>৳{(investment.totalRevenue ?? 0).toLocaleString()}</TableCell>
                        <TableCell>৳{(investment.totalCollected ?? 0).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="success">
                            ৳{(investment.profitEarned ?? 0).toLocaleString()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">
                            ৳{(investment.payableNow ?? 0).toLocaleString()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={(investment.roi ?? 0) > 0 ? "default" : "secondary"}>
                            {(investment.roi ?? 0).toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            investment.status === 'RECEIVED' ? 'success' :
                            investment.status === 'CANCELLED' ? 'destructive' : 'secondary'
                          }>
                            {investment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No investment breakdown available</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}