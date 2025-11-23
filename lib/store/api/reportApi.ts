import {
  InventorySummary,
  CompanyStock,
  LowStockItem,
  CompanyReceivable,
  ReceivableAging,
  BillingSummary,
  InvestorSummary,
  InvestmentBreakdown,
  ExpenseCategorySummary,
  PeriodicExpense,
  SalesSummary,
  PeriodicSales,
  SalarySummary,
  MonthlySalary,
  BusinessHealth,
  CorporateSummary,
  QuickStats,
  DateRangeParams,
  PeriodQueryParams,
  PaginationParams,
} from '@/types/report';
import { baseApi } from './baseApi';

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== INVENTORY REPORTS ====================
    getInventorySummary: builder.query<InventorySummary, void>({
      query: () => ({
        url: '/reports/inventory/summary',
        method: 'GET',
      }),
      providesTags: ['InventoryReports'],
    }),

    getCompanyWiseStock: builder.query<CompanyStock[], void>({
      query: () => ({
        url: '/reports/inventory/company-stock',
        method: 'GET',
      }),
      providesTags: ['InventoryReports'],
    }),

    getLowStockReport: builder.query<LowStockItem[], void>({
      query: () => ({
        url: '/reports/inventory/low-stock',
        method: 'GET',
      }),
      providesTags: ['InventoryReports'],
    }),

    // ==================== ACCOUNTS RECEIVABLE REPORTS ====================
    getCompanyReceivables: builder.query<CompanyReceivable[], void>({
      query: () => ({
        url: '/reports/receivable/company-wise',
        method: 'GET',
      }),
      providesTags: ['ReceivableReports'],
    }),

    getReceivableAging: builder.query<ReceivableAging, void>({
      query: () => ({
        url: '/reports/receivable/aging',
        method: 'GET',
      }),
      providesTags: ['ReceivableReports'],
    }),

    getBillingSummary: builder.query<BillingSummary, void>({
      query: () => ({
        url: '/reports/billing/summary',
        method: 'GET',
      }),
      providesTags: ['BillingReports'],
    }),

    // ==================== INVESTOR REPORTS ====================
    getInvestorSummary: builder.query<InvestorSummary[], void>({
      query: () => ({
        url: '/reports/investors/summary',
        method: 'GET',
      }),
      providesTags: ['InvestorReports'],
    }),

    getInvestmentBreakdown: builder.query<InvestmentBreakdown[], string>({
      query: (investorId: string) => ({
        url: `/reports/investors/${investorId}/breakdown`,
        method: 'GET',
      }),
      providesTags: (result, error, investorId) => [
        { type: 'InvestorReports', id: investorId },
      ],
    }),

    // ==================== EXPENSE REPORTS ====================
    getExpenseByCategory: builder.query<ExpenseCategorySummary[], DateRangeParams>({
      query: (params: DateRangeParams) => ({
        url: '/reports/expenses/by-category',
        method: 'GET',
        params,
      }),
      providesTags: ['ExpenseReports'],
    }),

    getPeriodicExpenses: builder.query<PeriodicExpense[], PeriodQueryParams>({
      query: (params: PeriodQueryParams) => ({
        url: '/reports/expenses/periodic',
        method: 'GET',
        params,
      }),
      providesTags: ['ExpenseReports'],
    }),

    // ==================== SALES REPORTS ====================
    getSalesSummary: builder.query<SalesSummary, DateRangeParams>({
      query: (params: DateRangeParams) => ({
        url: '/reports/sales/summary',
        method: 'GET',
        params,
      }),
      providesTags: ['SalesReports'],
    }),

    getPeriodicSales: builder.query<PeriodicSales[], PeriodQueryParams>({
      query: (params: PeriodQueryParams) => ({
        url: '/reports/sales/periodic',
        method: 'GET',
        params,
      }),
      providesTags: ['SalesReports'],
    }),

    // ==================== EMPLOYEE REPORTS ====================
    getSalarySummary: builder.query<SalarySummary, void>({
      query: () => ({
        url: '/reports/employees/salary-summary',
        method: 'GET',
      }),
      providesTags: ['EmployeeReports'],
    }),

    getMonthlySalaries: builder.query<MonthlySalary[], PeriodQueryParams>({
      query: (params: PeriodQueryParams) => ({
        url: '/reports/employees/monthly-salaries',
        method: 'GET',
        params,
      }),
      providesTags: ['EmployeeReports'],
    }),

    // ==================== BUSINESS HEALTH REPORTS ====================
    getBusinessHealth: builder.query<BusinessHealth, DateRangeParams>({
      query: (params: DateRangeParams) => ({
        url: '/reports/business-health',
        method: 'GET',
        params,
      }),
      providesTags: ['BusinessHealth'],
    }),

    // ==================== COMPREHENSIVE CORPORATE SUMMARY ====================
    getCorporateSummary: builder.query<CorporateSummary, PeriodQueryParams>({
      query: (params: PeriodQueryParams) => ({
        url: '/reports/corporate-summary',
        method: 'GET',
        params,
      }),
      providesTags: ['CorporateSummary'],
    }),

    // ==================== DASHBOARD QUICK STATS ====================
    getQuickStats: builder.query<QuickStats, void>({
      query: () => ({
        url: '/reports/dashboard/quick-stats',
        method: 'GET',
      }),
      providesTags: ['DashboardStats'],
    }),

    // ==================== EXPORT REPORTS ====================
    exportInventoryReport: builder.mutation<{ url: string }, void>({
      query: () => ({
        url: '/reports/export/inventory',
        method: 'POST',
      }),
    }),

    exportFinancialReport: builder.mutation<{ url: string }, DateRangeParams>({
      query: (params: DateRangeParams) => ({
        url: '/reports/export/financial',
        method: 'POST',
        body: params,
      }),
    }),

    exportInvestorReport: builder.mutation<{ url: string }, void>({
      query: () => ({
        url: '/reports/export/investors',
        method: 'POST',
      }),
    }),
  }),
});

export const {
  // Inventory Reports
  useGetInventorySummaryQuery,
  useGetCompanyWiseStockQuery,
  useGetLowStockReportQuery,

  // Accounts Receivable Reports
  useGetCompanyReceivablesQuery,
  useGetReceivableAgingQuery,
  useGetBillingSummaryQuery,

  // Investor Reports
  useGetInvestorSummaryQuery,
  useGetInvestmentBreakdownQuery,

  // Expense Reports
  useGetExpenseByCategoryQuery,
  useGetPeriodicExpensesQuery,

  // Sales Reports
  useGetSalesSummaryQuery,
  useGetPeriodicSalesQuery,

  // Employee Reports
  useGetSalarySummaryQuery,
  useGetMonthlySalariesQuery,

  // Business Health Reports
  useGetBusinessHealthQuery,

  // Corporate Summary
  useGetCorporateSummaryQuery,

  // Dashboard Quick Stats
  useGetQuickStatsQuery,

  // Export Reports
  useExportInventoryReportMutation,
  useExportFinancialReportMutation,
  useExportInvestorReportMutation,
} = reportsApi;