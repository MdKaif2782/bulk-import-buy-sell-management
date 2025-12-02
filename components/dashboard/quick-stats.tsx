"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuickStats } from "@/hooks/useStatistics";
import { TrendingUp, TrendingDown, Minus, DollarSign, Package, CreditCard, AlertTriangle, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

const statsConfig = [
  {
    key: "todaySales" as const,
    label: "Today's Sales",
    icon: DollarSign,
    color: "text-blue-600",
    tab: "sales",
    description: "View detailed sales reports"
  },
  {
    key: "weekSales" as const,
    label: "Weekly Sales",
    icon: TrendingUp,
    color: "text-green-600",
    tab: "sales",
    description: "View detailed sales reports"
  },
  {
    key: "monthSales" as const,
    label: "Monthly Sales",
    icon: DollarSign,
    color: "text-purple-600",
    tab: "sales",
    description: "View detailed sales reports"
  },
  {
    key: "pendingOrders" as const,
    label: "Pending Orders",
    icon: Package,
    color: "text-orange-600",
    tab: "inventory",
    description: "View inventory and order reports"
  },
  {
    key: "unpaidBills" as const,
    label: "Unpaid Bills",
    icon: CreditCard,
    color: "text-red-600",
    tab: "financial",
    description: "View financial reports"
  },
  {
    key: "lowStockAlerts" as const,
    label: "Low Stock",
    icon: AlertTriangle,
    color: "text-yellow-600",
    tab: "inventory",
    description: "View inventory reports"
  },
  {
    key: "activeInvestments" as const,
    label: "Active Investments",
    icon: Users,
    color: "text-indigo-600",
    tab: "investors",
    description: "View investor reports"
  },
];

export function QuickStats() {
  const { data: quickStats, isLoading, error } = useQuickStats();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCardClick = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`/reports?${params.toString()}`, { scroll: false });
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            Failed to load quick stats
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsConfig.slice(0, 4).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsConfig.map((stat) => (
        <Card 
          key={stat.key} 
          className="border shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer group"
          onClick={() => handleCardClick(stat.tab)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold mt-2 group-hover:text-primary transition-colors">
                  {stat.key.includes("Sales") 
                    ? `৳${(quickStats?.[stat.key] || 0).toLocaleString("en-BD")}`
                    : quickStats?.[stat.key]?.toLocaleString("en-BD") || 0
                  }
                </p>
              </div>
              <div className={cn("p-3 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors", stat.color)}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            
            {quickStats?.trends && stat.key === "todaySales" && (
              <div className="flex items-center mt-3 text-xs">
                {quickStats.trends.daily > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : quickStats.trends.daily < 0 ? (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                ) : (
                  <Minus className="h-4 w-4 text-gray-500 mr-1" />
                )}
                <span
                  className={
                    quickStats.trends.daily > 0
                      ? "text-green-500"
                      : quickStats.trends.daily < 0
                      ? "text-red-500"
                      : "text-gray-500"
                  }
                >
                  {quickStats.trends.daily > 0 ? "+" : ""}
                  {quickStats.trends.daily.toFixed(1)}% from daily average
                </span>
              </div>
            )}
            
            {/* Link indicator */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t">
              <span className="text-xs text-muted-foreground">
                {stat.description}
              </span>
              <span className="text-xs text-primary font-medium flex items-center">
                View report
                <TrendingUp className="h-3 w-3 ml-1" />
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}