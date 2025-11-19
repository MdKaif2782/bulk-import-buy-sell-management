import { baseApi } from './baseApi';
import {
  CreateExpenseRequest,
  UpdateExpenseRequest,
  GetExpensesParams,
  ExpenseResponse,
  ExpensesListResponse,
  ExpenseStatisticsResponse,
  MonthlyTrendResponse,
  CategorySummaryResponse,
} from '@/types/expense';

export const expenseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get expenses with pagination and filtering
    getExpenses: builder.query<ExpensesListResponse, GetExpensesParams | void>({
      query: (params) => ({
        url: '/expenses',
        method: 'GET',
        params: params as Record<string, any>,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.expenses.map(({ id }) => ({ type: 'Expense' as const, id })),
              { type: 'Expense', id: 'LIST' },
            ]
          : [{ type: 'Expense', id: 'LIST' }],
    }),

    // Get expense statistics
    getExpenseStatistics: builder.query<ExpenseStatisticsResponse, void>({
      query: () => '/expenses/statistics',
      providesTags: [{ type: 'Expense', id: 'STATS' }],
    }),

    // Get monthly trend data
    getMonthlyTrend: builder.query<MonthlyTrendResponse[], number | void>({
      query: (months = 6) => ({
        url: '/expenses/charts/monthly',
        method: 'GET',
        params: { months },
      }),
      providesTags: [{ type: 'Expense', id: 'CHARTS' }],
    }),

    // Get category chart data
    getCategoryChart: builder.query<CategorySummaryResponse[], void>({
      query: () => '/expenses/charts/category',
      providesTags: [{ type: 'Expense', id: 'CHARTS' }],
    }),

    // Get category summary
    getCategorySummary: builder.query<CategorySummaryResponse[], void>({
      query: () => '/expenses/category-summary',
      providesTags: [{ type: 'Expense', id: 'SUMMARY' }],
    }),

    // Get single expense by ID
    getExpense: builder.query<ExpenseResponse, string>({
      query: (id) => `/expenses/${id}`,
      providesTags: (result, error, id) => [{ type: 'Expense', id }],
    }),

    // Create new expense
    createExpense: builder.mutation<ExpenseResponse, CreateExpenseRequest>({
      query: (expenseData) => ({
        url: '/expenses',
        method: 'POST',
        body: expenseData,
      }),
      invalidatesTags: [
        { type: 'Expense', id: 'LIST' },
        { type: 'Expense', id: 'STATS' },
        { type: 'Expense', id: 'CHARTS' },
        { type: 'Expense', id: 'SUMMARY' },
      ],
    }),

    // Update existing expense
    updateExpense: builder.mutation<ExpenseResponse, { id: string; data: UpdateExpenseRequest }>({
      query: ({ id, data }) => ({
        url: `/expenses/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Expense', id },
        { type: 'Expense', id: 'LIST' },
        { type: 'Expense', id: 'STATS' },
        { type: 'Expense', id: 'CHARTS' },
        { type: 'Expense', id: 'SUMMARY' },
      ],
    }),

    // Delete expense
    deleteExpense: builder.mutation<void, string>({
      query: (id) => ({
        url: `/expenses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Expense', id },
        { type: 'Expense', id: 'LIST' },
        { type: 'Expense', id: 'STATS' },
        { type: 'Expense', id: 'CHARTS' },
        { type: 'Expense', id: 'SUMMARY' },
      ],
    }),
  }),
});

export const {
  useGetExpensesQuery,
  useGetExpenseStatisticsQuery,
  useGetMonthlyTrendQuery,
  useGetCategoryChartQuery,
  useGetCategorySummaryQuery,
  useGetExpenseQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} = expenseApi;