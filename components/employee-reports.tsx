"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  useGetSalarySummaryQuery, 
  useGetMonthlySalariesQuery 
} from "@/lib/store/api/reportApi"
import { Download, Users, DollarSign, TrendingUp, Calendar } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

interface EmployeeReportsProps {
  preview?: boolean
}

export function EmployeeReports({ preview = false }: EmployeeReportsProps) {
  const { data: salarySummary, isLoading: summaryLoading } = useGetSalarySummaryQuery()
  const { data: monthlySalaries, isLoading: monthlyLoading } = useGetMonthlySalariesQuery({})

  if (preview) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employee Overview
          </CardTitle>
          <CardDescription>Salary and workforce analytics</CardDescription>
        </CardHeader>
        <CardContent>
          {summaryLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : salarySummary ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{salarySummary.totalEmployees}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Active Employees</p>
                <p className="text-2xl font-bold text-green-600">{salarySummary.activeEmployees}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Salary Expense</p>
                <p className="text-xl font-semibold">৳{(salarySummary.totalSalaryExpense ?? 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Average Salary</p>
                <p className="text-xl font-semibold">৳{(salarySummary.averageSalary ?? 0).toLocaleString()}</p>
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
        <h2 className="text-2xl font-bold tracking-tight">Employee Reports</h2>
        <p className="text-muted-foreground">
          Workforce analytics and salary management
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Salary Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Salary Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {summaryLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : salarySummary ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Employees</p>
                    <p className="text-2xl font-bold">{salarySummary.totalEmployees}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Active Employees</p>
                    <p className="text-2xl font-bold text-green-600">
                      {salarySummary.activeEmployees}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Salary Expense</p>
                    <p className="text-2xl font-bold">৳{(salarySummary.totalSalaryExpense ?? 0).toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Average Salary</p>
                    <p className="text-xl font-semibold">
                      ৳{(salarySummary.averageSalary ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Workforce Metrics</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Active Rate</span>
                      <Badge variant="success">
                        {(salarySummary.totalEmployees ? ((salarySummary.activeEmployees / salarySummary.totalEmployees) * 100) : 0).toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Salary Cost</span>
                      <span className="font-semibold">
                        ৳{((salarySummary.totalSalaryExpense ?? 0) / 12).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        {/* Workforce Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Workforce Overview
            </CardTitle>
            <CardDescription>Employee distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            ) : salarySummary ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span>Total Employees</span>
                  </div>
                  <Badge variant="outline">{salarySummary.totalEmployees}</Badge>
                </div>
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span>Active Employees</span>
                  </div>
                  <Badge variant="success">{salarySummary.activeEmployees}</Badge>
                </div>
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-orange-600" />
                    <span>Inactive Employees</span>
                  </div>
                  <Badge variant="secondary">
                    {salarySummary.totalEmployees - salarySummary.activeEmployees}
                  </Badge>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Utilization Rate</span>
                    <Badge variant="default">
                      {(salarySummary.totalEmployees ? ((salarySummary.activeEmployees / salarySummary.totalEmployees) * 100) : 0).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Monthly Salary Breakdown */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monthly Salary Breakdown
            </CardTitle>
            <CardDescription>Payroll expenses over time</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            ) : monthlySalaries && monthlySalaries.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Total Salary</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Overtime</TableHead>
                    <TableHead>Bonuses</TableHead>
                    <TableHead>Average per Employee</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlySalaries.map((month) => (
                    <TableRow key={month.month}>
                      <TableCell className="font-medium">{month.month}</TableCell>
                      <TableCell>৳{(month.totalSalary ?? 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{month.employeeCount}</Badge>
                      </TableCell>
                      <TableCell>৳{(month.allowances ?? 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          ৳{(month.overtime ?? 0).toLocaleString()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="success">
                          ৳{(month.bonuses ?? 0).toLocaleString()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        ৳{(month.employeeCount ? ((month.totalSalary ?? 0) / month.employeeCount) : 0).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No monthly salary data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}