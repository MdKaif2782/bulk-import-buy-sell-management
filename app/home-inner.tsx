"use client";

import { QuickStats } from "@/components/dashboard/quick-stats";
import { FinancialSummary } from "@/components/dashboard/financial-summary";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { ExpenseChart } from "@/components/dashboard/expense-chart";
import { RecentActivities } from "@/components/dashboard/recent-activities";
import { BusinessHealth } from "@/components/dashboard/business-health";
import { Button } from "@/components/ui/button";
import { useRefreshStatistics } from "@/hooks/useStatistics";
import { RefreshCw } from "lucide-react";
import { Sidebar } from "@/components/sidebar";

export default function DashboardPage() {
  const { refreshAll, isLoading } = useRefreshStatistics();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your business performance and key metrics
            </p>
          </div>
          <Button
            onClick={refreshAll}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Refreshing..." : "Refresh Data"}
          </Button>
        </div>

        <div className="mb-8">
          <QuickStats />
        </div>

        <div className="mb-8">
          <FinancialSummary />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SalesChart />
          <ExpenseChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentActivities />
          </div>
          <div>
            <BusinessHealth />
          </div>
        </div>
      </div>
    </div>
  );
}