"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/useStatistics";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Heart, TrendingUp, BarChart3, Package, Zap, DollarSign } from "lucide-react";

export function BusinessHealth() {
  const { data: dashboardData, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Business Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dashboardData?.businessHealth) return null;

  const { businessHealth } = dashboardData;

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-blue-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case "excellent":
        return <Heart className="h-6 w-6 text-green-500" />;
      case "good":
        return <TrendingUp className="h-6 w-6 text-blue-500" />;
      case "fair":
        return <BarChart3 className="h-6 w-6 text-yellow-500" />;
      case "poor":
        return <Zap className="h-6 w-6 text-red-500" />;
      default:
        return <Heart className="h-6 w-6 text-gray-500" />;
    }
  };

  const metrics = [
    {
      label: "Profitability Index",
      value: businessHealth.profitabilityIndex.toFixed(2),
      description: "Higher is better",
      icon: TrendingUp,
    },
    {
      label: "Operating Margin",
      value: `${businessHealth.operatingMargin.toFixed(1)}%`,
      description: "Industry avg: 15%",
      icon: BarChart3,
    },
    {
      label: "Inventory Turnover",
      value: businessHealth.inventoryTurnover.toFixed(1),
      description: "Times per year",
      icon: Package,
    },
    {
      label: "Current Ratio",
      value: businessHealth.currentRatio.toFixed(1),
      description: "Ideal: 1.5-2.0",
      icon: DollarSign,
    },
    {
      label: "Quick Ratio",
      value: businessHealth.quickRatio.toFixed(1),
      description: "Ideal: 1.0-1.5",
      icon: Zap,
    },
    {
      label: "Cash Flow",
      value: `৳${businessHealth.cashFlow.toLocaleString("en-BD")}`,
      description: "Monthly",
      icon: DollarSign,
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <Heart className="h-5 w-5 mr-2 text-muted-foreground" />
        <CardTitle className="text-lg">Business Health</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            {getHealthIcon(businessHealth.status)}
            <span className={`text-3xl font-bold ${getHealthColor(businessHealth.healthScore)}`}>
              {businessHealth.healthScore.toFixed(0)}
            </span>
            <span className="text-muted-foreground">/100</span>
          </div>
          <Progress 
            value={businessHealth.healthScore} 
            className="h-2"
          />
          <p className="text-sm text-muted-foreground mt-2 capitalize">
            {businessHealth.status} Health
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="text-center p-3 border rounded-lg bg-muted/30"
            >
              <p className="text-xs font-medium text-muted-foreground mb-1">
                {metric.label}
              </p>
              <p className="text-lg font-semibold">{metric.value}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {metric.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-muted/20 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            {businessHealth.status === "excellent" && "Your business is performing exceptionally well across all metrics."}
            {businessHealth.status === "good" && "Solid performance with room for improvement in some areas."}
            {businessHealth.status === "fair" && "Business needs attention in key areas to improve health."}
            {businessHealth.status === "poor" && "Immediate action required to address critical issues."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}