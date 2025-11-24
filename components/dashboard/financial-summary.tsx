"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/useStatistics";
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function FinancialSummary() {
  const { data: dashboardData, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <Skeleton className="h-4 w-20 mx-auto mb-2" />
                <Skeleton className="h-6 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dashboardData) return null;

  const { financialSummary } = dashboardData;

  const metrics = [
    {
      label: "Total Revenue",
      value: `৳${financialSummary.totalRevenue.toLocaleString("en-BD")}`,
      growth: financialSummary.revenueGrowth,
      trend: financialSummary.revenueGrowth >= 0 ? "up" : financialSummary.revenueGrowth < 0 ? "down" : "stable",
      icon: TrendingUp,
    },
    {
      label: "Net Profit",
      value: `৳${financialSummary.netProfit.toLocaleString("en-BD")}`,
      growth: ((financialSummary.netProfit / financialSummary.totalRevenue) * 100) || 0,
      trend: financialSummary.netProfit >= 0 ? "up" : "down",
      icon: TrendingUp,
    },
    {
      label: "Profit Margin",
      value: `${financialSummary.profitMargin.toFixed(1)}%`,
      growth: financialSummary.profitMargin,
      trend: financialSummary.profitMargin >= 20 ? "up" : financialSummary.profitMargin >= 10 ? "stable" : "down",
      icon: BarChart3,
    },
    {
      label: "Expense Growth",
      value: `${financialSummary.expenseGrowth.toFixed(1)}%`,
      growth: financialSummary.expenseGrowth,
      trend: financialSummary.expenseGrowth <= 5 ? "down" : financialSummary.expenseGrowth <= 15 ? "stable" : "up",
      icon: TrendingDown,
    },
  ];

  const TrendIcon = ({ trend }: { trend: string }) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <BarChart3 className="h-5 w-5 mr-2 text-muted-foreground" />
        <CardTitle className="text-lg">Financial Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="text-center p-4 border rounded-lg bg-muted/50"
            >
              <p className="text-sm font-medium text-muted-foreground mb-2">
                {metric.label}
              </p>
              <div className="flex items-center justify-center gap-2">
                <TrendIcon trend={metric.trend} />
                <p className="text-xl font-bold">{metric.value}</p>
              </div>
              <p
                className={`text-xs mt-1 ${
                  metric.growth > 0
                    ? "text-green-500"
                    : metric.growth < 0
                    ? "text-red-500"
                    : "text-gray-500"
                }`}
              >
                {metric.growth > 0 ? "+" : ""}
                {metric.growth.toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Gross Profit</p>
            <p className="text-lg font-semibold text-green-600">
              ৳{financialSummary.grossProfit.toLocaleString("en-BD")}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Expenses</p>
            <p className="text-lg font-semibold text-orange-600">
              ৳{financialSummary.totalExpenses.toLocaleString("en-BD")}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Operating Margin</p>
            <p className="text-lg font-semibold text-blue-600">
              {((financialSummary.grossProfit / financialSummary.totalRevenue) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}