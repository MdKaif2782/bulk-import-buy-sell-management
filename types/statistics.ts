export interface DateRange {
  startDate?: string;
  endDate?: string;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  grossProfit: number;
  profitMargin: number;
  revenueGrowth: number;
  expenseGrowth: number;
}

export interface PeriodicSalesData {
  period: string;
  corporateSales: number;
  retailSales: number;
  totalSales: number;
  growth: number;
}

export interface SalesChannel {
  channel: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface TopProduct {
  productName: string;
  sales: number;
  quantity: number;
  growth: number;
}

export interface SalesAnalytics {
  monthlySales: PeriodicSalesData[];
  byChannel: SalesChannel[];
  topProducts: TopProduct[];
  salesTrend: 'up' | 'down' | 'stable';
}

export interface InventoryCategory {
  category: string;
  value: number;
  percentage: number;
  color: string;
}

export interface InventoryOverview {
  totalValue: number;
  totalItems: number;
  lowStockCount: number;
  outOfStockCount: number;
  byCategory: InventoryCategory[];
  turnoverRate: number;
}

export interface AgingBucket {
  bucket: string;
  amount: number;
  count: number;
  percentage: number;
  color: string;
}

export interface ReceivablesSummary {
  totalReceivable: number;
  collectedThisMonth: number;
  overdueAmount: number;
  collectionRate: number;
  agingBuckets: AgingBucket[];
}

export interface InvestorPerformance {
  investorName: string;
  investment: number;
  returns: number;
  roi: number;
  color: string;
}

export interface InvestorMetrics {
  totalInvestment: number;
  activeInvestors: number;
  totalPayouts: number;
  averageROI: number;
  topPerformers: InvestorPerformance[];
}

export interface ExpenseCategory {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface MonthlyExpense {
  month: string;
  amount: number;
  growth: number;
}

export interface ExpenseBreakdown {
  totalExpenses: number;
  byCategory: ExpenseCategory[];
  monthlyTrend: MonthlyExpense[];
}

export interface DepartmentStats {
  department: string;
  count: number;
  avgSalary: number;
  color: string;
}

export interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  monthlySalary: number;
  averageSalary: number;
  byDepartment: DepartmentStats[];
}

export interface BusinessHealth {
  profitabilityIndex: number;
  operatingMargin: number;
  inventoryTurnover: number;
  currentRatio: number;
  quickRatio: number;
  cashFlow: number;
  healthScore: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface ActivityLog {
  id: string;
  type: 'sale' | 'purchase' | 'payment' | 'investment' | 'expense' | 'inventory';
  description: string;
  amount?: number;
  timestamp: string;
  user: string;
  icon: string;
  color: string;
}

export interface QuickStats {
  todaySales: number;
  weekSales: number;
  monthSales: number;
  pendingOrders: number;
  unpaidBills: number;
  lowStockAlerts: number;
  activeInvestments: number;
}

export interface DashboardStats {
  financialSummary: FinancialSummary;
  salesAnalytics: SalesAnalytics;
  inventoryOverview: InventoryOverview;
  receivablesSummary: ReceivablesSummary;
  investorMetrics: InvestorMetrics;
  expenseBreakdown: ExpenseBreakdown;
  employeeStats: EmployeeStats;
  businessHealth: BusinessHealth;
  recentActivities: ActivityLog[];
  quickStats: QuickStats;
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}