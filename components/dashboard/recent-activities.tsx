"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/useStatistics";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Activity, DollarSign, Package, Users, CreditCard, AlertTriangle } from "lucide-react";

export function RecentActivities() {
  const { data: dashboardData, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dashboardData?.recentActivities?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No recent activities
          </div>
        </CardContent>
      </Card>
    );
  }

  const getActivityIcon = (type: string) => {
    const iconConfig = {
      sale: { icon: DollarSign, color: "text-green-600" },
      purchase: { icon: Package, color: "text-blue-600" },
      payment: { icon: CreditCard, color: "text-purple-600" },
      investment: { icon: Users, color: "text-indigo-600" },
      expense: { icon: DollarSign, color: "text-red-600" },
      inventory: { icon: Package, color: "text-orange-600" },
    };
    
    return iconConfig[type as keyof typeof iconConfig] || { icon: Activity, color: "text-gray-600" };
  };

  const getActivityBadge = (type: string) => {
    const badgeConfig = {
      sale: { variant: "default" as const, label: "Sale" },
      purchase: { variant: "secondary" as const, label: "Purchase" },
      payment: { variant: "outline" as const, label: "Payment" },
      investment: { variant: "default" as const, label: "Investment" },
      expense: { variant: "destructive" as const, label: "Expense" },
      inventory: { variant: "secondary" as const, label: "Inventory" },
    };
    
    return badgeConfig[type as keyof typeof badgeConfig] || { variant: "outline" as const, label: type };
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <Activity className="h-5 w-5 mr-2 text-muted-foreground" />
        <CardTitle className="text-lg">Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {dashboardData.recentActivities.map((activity) => {
            const iconConfig = getActivityIcon(activity.type);
            const badge = getActivityBadge(activity.type);
            const IconComponent = iconConfig.icon;
            
            return (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className={cn("p-2 rounded-lg bg-muted", iconConfig.color)}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate">
                      {activity.description}
                    </p>
                    <Badge variant={badge.variant} className="text-xs">
                      {badge.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {activity.user} •{" "}
                    {new Date(activity.timestamp).toLocaleDateString("en-BD", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {activity.amount && (
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm">
                      ৳{activity.amount.toLocaleString("en-BD")}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}