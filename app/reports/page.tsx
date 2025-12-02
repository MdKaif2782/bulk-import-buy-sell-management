"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, BarChart3, PieChart, TrendingUp, Users, Package, CreditCard, FileText } from "lucide-react"
import { toast } from "sonner"

// Import components
import { QuickStats } from "@/components/quick-stats"
import { InventoryReports } from "@/components/inventory-reports"
import { FinancialReports } from "@/components/financial-reports"
import { InvestorReports } from "@/components/investor-reports"
import { SalesReports } from "@/components/sales-reports"
import { EmployeeReports } from "@/components/employee-reports"
import { BusinessHealth } from "@/components/business-health"
import { Sidebar } from "@/components/sidebar"

export default function ReportsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Get tab from URL parameter or default to "overview"
  const urlTab = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState(urlTab || "overview")

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    
    // Update URL with tab parameter
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tab)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  // Sync with URL on initial load and when URL changes externally
  useEffect(() => {
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab)
    }
  }, [urlTab])

  const handleExport = (type: string) => {
    toast.info(`Exporting ${type} report...`, {
      description: "This feature will be available soon"
    })
  }

  // Available tabs for validation
  const validTabs = ["overview", "inventory", "financial", "investors", "sales", "employees", "health"]

  // If tab from URL is invalid, redirect to default
  useEffect(() => {
    if (urlTab && !validTabs.includes(urlTab)) {
      const params = new URLSearchParams(searchParams.toString())
      params.set("tab", "overview")
      router.replace(`?${params.toString()}`, { scroll: false })
    }
  }, [urlTab])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 space-y-6 p-6 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Business Intelligence</h1>
            <p className="text-muted-foreground">
              Comprehensive reports and analytics for your business
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleExport("comprehensive")}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7 h-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Inventory</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Financial</span>
            </TabsTrigger>
            <TabsTrigger value="investors" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Investors</span>
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Sales</span>
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Employees</span>
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              <span className="hidden sm:inline">Health</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <QuickStats />
            
            <div className="grid gap-6 md:grid-cols-2">
              <FinancialReports preview />
              <InventoryReports preview />
              <InvestorReports preview />
              <SalesReports preview />
            </div>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <InventoryReports />
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            <FinancialReports />
          </TabsContent>

          {/* Investors Tab */}
          <TabsContent value="investors" className="space-y-6">
            <InvestorReports />
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-6">
            <SalesReports />
          </TabsContent>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-6">
            <EmployeeReports />
          </TabsContent>

          {/* Business Health Tab */}
          <TabsContent value="health" className="space-y-6">
            <BusinessHealth />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}