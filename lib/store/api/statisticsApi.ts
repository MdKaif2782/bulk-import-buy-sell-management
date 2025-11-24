import { baseApi } from './baseApi';
import {
  DashboardStats,
  DateRange,
  ChartData,
  QuickStats,
} from '@/types/statistics';

export const statisticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get comprehensive dashboard statistics
    getDashboardStats: builder.query<DashboardStats, DateRange>({
      query: (params: DateRange) => ({
        url: '/statistics/dashboard',
        method: 'GET',
        params,
      }),
      providesTags: ['DashboardStats'],
      keepUnusedDataFor: 300, // Keep data for 5 minutes
    }),

    // Get sales data for charts
    getSalesChartData: builder.query<ChartData, DateRange>({
      query: (params: DateRange) => ({
        url: '/statistics/sales-chart',
        method: 'GET',
        params,
      }),
      providesTags: ['SalesChart'],
      keepUnusedDataFor: 600, // Keep data for 10 minutes
    }),

    // Get expense data for charts
    getExpenseChartData: builder.query<ChartData, DateRange>({
      query: (params: DateRange) => ({
        url: '/statistics/expense-chart',
        method: 'GET',
        params,
      }),
      providesTags: ['ExpenseChart'],
      keepUnusedDataFor: 600,
    }),

    // Get inventory data for charts
    getInventoryChartData: builder.query<ChartData, void>({
      query: () => '/statistics/inventory-chart',
      providesTags: ['InventoryChart'],
      keepUnusedDataFor: 600,
    }),

    // Get quick stats for dashboard cards
    getQuickStats: builder.query<QuickStats, DateRange>({
      query: (params: DateRange) => ({
        url: '/statistics/quick-stats',
        method: 'GET',
        params,
      }),
      providesTags: ['QuickStats'],
      keepUnusedDataFor: 60, // Keep data for 1 minute (frequently updated)
    }),

    // Refresh dashboard data
    refreshDashboard: builder.mutation<void, void>({
      query: () => ({
        url: '/statistics/dashboard',
        method: 'POST', // Assuming you have a refresh endpoint or using POST to trigger refresh
      }),
      invalidatesTags: ['DashboardStats', 'SalesChart', 'ExpenseChart', 'InventoryChart', 'QuickStats'],
    }),
  }),

  // Enable automatic refetching on focus and reconnect
  overrideExisting: false,
});

// Export hooks for usage in components
export const {
  useGetDashboardStatsQuery,
  useGetSalesChartDataQuery,
  useGetExpenseChartDataQuery,
  useGetInventoryChartDataQuery,
  useGetQuickStatsQuery,
  useRefreshDashboardMutation,
} = statisticsApi;

// Export endpoints for use in other parts of the application
export const {
  endpoints: {
    getDashboardStats,
    getSalesChartData,
    getExpenseChartData,
    getInventoryChartData,
    getQuickStats,
  },
} = statisticsApi;