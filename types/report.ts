// Query Parameters
export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

export interface PeriodQueryParams {
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  year?: number;
  month?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Inventory Reports
export interface InventorySummary {
  totalItems: number;
  totalInventoryValue: number;
  totalExpectedSaleValue: number;
  averageStockValue: number;
  lowStockItemsCount: number;
}

export interface CompanyStock {
  companyName: string;
  stockValue: number;
  itemCount: number;
  percentageOfTotal: number;
}

export interface LowStockItem {
  id: string;
  productCode: string;
  productName: string;
  currentQuantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  purchasePrice: number;
  expectedSalePrice: number;
}

// Accounts Receivable Reports
export interface CompanyReceivable {
  companyName: string;
  totalBilled: number;
  totalCollected: number;
  totalDue: number;
  collectionRate: number;
}

export interface AgingBucket {
  bucket: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface ReceivableAging {
  totalReceivable: number;
  agingBuckets: AgingBucket[];
}

export interface BillingSummary {
  totalBills: number;
  totalBilledAmount: number;
  totalCollected: number;
  totalDue: number;
  collectionRate: number;
  billsByStatus: {
    pending: number;
    partiallyPaid: number;
    paid: number;
    overdue: number;
  };
}

// Investor Reports
export interface InvestorSummary {
  investorId: string;
  investorName: string;
  totalInvestment: number;
  totalRevenue: number;
  totalCollected: number;
  totalProfitEarned: number;
  totalPaid: number;
  totalDue: number;
  payableNow: number;
  overallROI: number;
  activeInvestments: number;
}

export interface InvestmentBreakdown {
  investmentId: string;
  poNumber: string;
  vendorName: string;
  investmentAmount: number;
  profitPercentage: number;
  totalRevenue: number;
  totalCollected: number;
  profitEarned: number;
  payableNow: number;
  roi: number;
  status: string;
}

// Expense Reports
export interface ExpenseCategorySummary {
  category: string;
  totalAmount: number;
  count: number;
  percentage: number;
}

export interface PeriodicExpense {
  period: string;
  totalAmount: number;
  count: number;
  categories: ExpenseCategorySummary[];
}

// Sales Reports
export interface SalesSummary {
  totalSales: number;
  corporateSales: number;
  retailSales: number;
  cogs: number;
  grossProfit: number;
  netProfit: number;
  grossMargin: number;
  netMargin: number;
}

export interface PeriodicSales {
  period: string;
  totalSales: number;
  cogs: number;
  grossProfit: number;
  expenses: number;
  netProfit: number;
}

// Employee Reports
export interface SalarySummary {
  totalSalaryExpense: number;
  totalEmployees: number;
  activeEmployees: number;
  averageSalary: number;
}

export interface MonthlySalary {
  month: string;
  year: number;
  totalSalary: number;
  employeeCount: number;
  allowances: number;
  overtime: number;
  bonuses: number;
}

export interface AllowanceBreakdown {
  category: string;
  totalAmount: number;
  percentage: number;
}

// Business Health Reports
export interface BusinessHealth {
  profitabilityIndex: number;
  operatingMargin: number;
  inventoryTurnover: number;
  cashFlow: number;
  currentRatio: number;
  quickRatio: number;
}

export interface CashFlow {
  operatingActivities: number;
  investingActivities: number;
  financingActivities: number;
  netCashFlow: number;
}

// Comprehensive Corporate Summary
export interface CorporateSummary {
  period: string;
  financials: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    totalAssets: number;
    totalLiabilities: number;
    equity: number;
  };
  sales: SalesSummary;
  inventory: InventorySummary;
  receivables: BillingSummary;
  investors: {
    totalInvestment: number;
    totalDueToInvestors: number;
    investorCount: number;
  };
  expenses: {
    total: number;
    byCategory: ExpenseCategorySummary[];
  };
  employees: SalarySummary;
  health: BusinessHealth;
}

// Dashboard Quick Stats
export interface QuickStats {
  inventory: {
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
  };
  receivables: {
    totalDue: number;
    collectionRate: number;
    totalBills: number;
  };
  sales: {
    totalSales: number;
    netProfit: number;
    profitMargin: number;
  };
  investors: {
    totalInvestment: number;
    totalDue: number;
    activeInvestors: number;
  };
  employees: {
    totalSalary: number;
    activeEmployees: number;
  };
}